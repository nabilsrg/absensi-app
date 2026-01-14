import 'dotenv/config';
import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.attendancePhoto.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();

  const emp1 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP001',
      fullName: 'Nabil Siregar',
      email: 'nabil@company.test',
      department: 'Engineering',
      position: 'Software Engineer',
      isActive: true,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP002',
      fullName: 'Budi Santoso',
      email: 'budi@company.test',
      department: 'Operations',
      position: 'Staff',
      isActive: true,
    },
  });

  const hrdPass = await bcrypt.hash('Hrd12345!', 10);
  await prisma.user.create({
    data: {
      username: 'hrd',
      passwordHash: hrdPass,
      role: Role.HRD,
      employeeId: null,
    },
  });

  const empPass = await bcrypt.hash('Emp12345!', 10);
  await prisma.user.create({
    data: {
      username: emp1.employeeCode,
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      employeeId: emp1.id,
    },
  });

  await prisma.user.create({
    data: {
      username: emp2.employeeCode,
      passwordHash: empPass,
      role: Role.EMPLOYEE,
      employeeId: emp2.id,
    },
  });

  const attendanceIds: number[] = [];
  for (let i = 0; i < 30; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateISO = d.toISOString().slice(0, 10);
    const isLate = i % 3 === 0;
    const checkInAt = new Date(
      `${dateISO}T${isLate ? '09:15:00' : '08:00:00'}.000Z`,
    );

    const attendance = await prisma.attendanceRecord.create({
      data: {
        employeeId: emp1.id,
        attendanceDate: new Date(dateISO),
        checkInAt,
        status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
        note: `Seed attendance ${i + 1} (${isLate ? 'late' : 'present'})`,
        photos: {
          create: [
            {
              filePath: '/uploads/sample.jpg',
              fileName: 'sample.jpg',
              mimeType: 'image/jpeg',
              fileSize: 123456,
              capturedAt: checkInAt,
            },
          ],
        },
      },
      include: { photos: true },
    });

    attendanceIds.push(attendance.id);
  }

  console.log('Seed done.');
  console.log('HRD login:', { username: 'hrd', password: 'Hrd12345!' });
  console.log('EMP login:', { username: 'EMP001', password: 'Emp12345!' });
  console.log('Sample attendanceIds:', attendanceIds.slice(0, 3));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
