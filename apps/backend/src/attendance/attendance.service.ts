import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { AttendanceStatus, Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "../prisma/prisma.service";
import { ListMyAttendanceDto } from "./dto/list-my-attendance.dto";

function jakartaDateString(): string {
  // YYYY-MM-DD in Asia/Jakarta
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function jakartaMinutesSinceMidnight(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(params: {
    employeeId: number | null;
    note?: string;
    file: Express.Multer.File;
  }) {
    const { employeeId, note, file } = params;

    if (!employeeId) {
      throw new ForbiddenException("Employee account is not linked to an employeeId");
    }
    if (!file) {
      throw new BadRequestException("Photo is required");
    }

    // optional: ensure employee active
    const emp = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, isActive: true },
    });
    if (!emp) throw new ForbiddenException("Employee not found");
    if (!emp.isActive) throw new ForbiddenException("Employee is inactive");

    const dateStr = jakartaDateString(); // e.g. 2026-01-11
    const attendanceDate = new Date(dateStr); // stored as DATE (@db.Date), time ignored
    const checkInAt = new Date();
    const minutes = jakartaMinutesSinceMidnight(checkInAt);
    const isLate = minutes > 8 * 60;

    const existing = await this.prisma.attendanceRecord.findFirst({
      where: { employeeId, attendanceDate },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("Attendance already submitted for today");
    }

    try {
      const record = await this.prisma.attendanceRecord.create({
        data: {
          employeeId,
          attendanceDate,
          checkInAt,
          status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          note: note || null,
          photos: {
            create: [
              {
                filePath: `/uploads/attendance/${file.filename}`,
                fileName: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                capturedAt: new Date(),
              },
            ],
          },
        },
        include: {
          employee: { select: { id: true, employeeCode: true, fullName: true } },
          photos: true,
        },
      });

      return {
        id: record.id,
        attendanceDate: dateStr,
        checkInAt: record.checkInAt,
        status: record.status,
        note: record.note,
        employee: record.employee,
        photos: record.photos.map((p) => ({
          id: p.id,
          filePath: p.filePath,
          mimeType: p.mimeType,
          fileSize: p.fileSize,
        })),
      };
    } catch (e: any) {
      // Unique constraint duplicate (employeeId + attendanceDate)
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new ConflictException("Attendance already submitted for today");
        }
      }
      throw new InternalServerErrorException("Failed to submit attendance");
    }
  }

  async listMyAttendance(employeeId: number | null, query: ListMyAttendanceDto) {
    if (!employeeId) {
      throw new ForbiddenException("Employee account is not linked to an employeeId");
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AttendanceRecordWhereInput = { employeeId };

    if (query.from || query.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.from) dateFilter.gte = new Date(query.from);
      if (query.to) dateFilter.lte = new Date(query.to);
      where.attendanceDate = dateFilter;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { attendanceDate: "desc" },
        include: {
          photos: true,
        },
      }),
    ]);

    return {
      data,
      meta: { page, pageSize, total },
    };
  }

  async getMyAttendanceById(employeeId: number | null, id: number) {
    if (!employeeId) {
      throw new ForbiddenException("Employee account is not linked to an employeeId");
    }

    const record = await this.prisma.attendanceRecord.findFirst({
      where: { id, employeeId },
      include: {
        photos: true,
      },
    });

    if (!record) throw new NotFoundException("Attendance not found");

    return record;
  }
}
