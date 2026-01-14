import { Module } from '@nestjs/common';
import { JwtStrategy } from './auth/jwt.strategy';
import { AttendanceModule } from './attendance/attendance.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AttendanceModule],
  providers: [JwtStrategy],
})
export class AttendanceAppModule {}
