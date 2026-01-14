import { Module } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, JwtAuthGuard, RolesGuard],
})
export class AttendanceModule {}
