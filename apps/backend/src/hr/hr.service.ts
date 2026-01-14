import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListAttendanceDto } from './dto/list-attendance.dto';
import { ListEmployeesDto } from './dto/list-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(dto: CreateEmployeeDto) {
    try {
      return await this.prisma.employee.create({
        data: {
          employeeCode: dto.employeeCode,
          fullName: dto.fullName,
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          department: dto.department ?? null,
          position: dto.position ?? null,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Employee code or email already exists');
      }
      throw new InternalServerErrorException('Failed to create employee');
    }
  }

  async listEmployees(query: ListEmployeesDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EmployeeWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      const search = query.search.trim();
      if (search.length > 0) {
        where.OR = [
          { employeeCode: { contains: search } },
          { fullName: { contains: search } },
          { email: { contains: search } },
          { department: { contains: search } },
          { position: { contains: search } },
        ];
      }
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: { page, pageSize, total },
    };
  }

  async getEmployee(id: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async updateEmployee(id: number, dto: UpdateEmployeeDto) {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data: {
          employeeCode: dto.employeeCode,
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          department: dto.department,
          position: dto.position,
          isActive: dto.isActive,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Employee not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Employee code or email already exists');
        }
      }
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  async deactivateEmployee(id: number) {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Employee not found');
      }
      throw new InternalServerErrorException('Failed to deactivate employee');
    }
  }

  async listAttendances(query: ListAttendanceDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AttendanceRecordWhereInput = {};

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.lte = new Date(query.endDate);
      where.attendanceDate = dateFilter;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { attendanceDate: 'desc' },
        include: {
          employee: {
            select: { id: true, employeeCode: true, fullName: true },
          },
          photos: true,
        },
      }),
    ]);

    return {
      data,
      meta: { page, pageSize, total },
    };
  }

  async getAttendance(id: number) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            department: true,
            position: true,
          },
        },
        photos: true,
      },
    });

    if (!record) throw new NotFoundException('Attendance not found');

    return record;
  }
}
