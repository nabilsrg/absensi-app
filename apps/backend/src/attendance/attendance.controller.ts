import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttendanceService } from './attendance.service';
import { AttendanceCheckInDto } from './dto/checkin.dto';
import { attendanceMulterOptions } from './dto/multer.config';
import { ListMyAttendanceDto } from './dto/list-my-attendance.dto';

// Sesuaikan import guard/decorator kamu:
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

import type { AuthRequest } from '../common/types/auth-request.type';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post('check-in')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  @UseInterceptors(FileInterceptor('photo', attendanceMulterOptions))
  async checkIn(
    @Req() req: AuthRequest,
    @Body() dto: AttendanceCheckInDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attendance.checkIn({
      employeeId: req.user.employeeId,
      note: dto.note,
      file,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  async myAttendance(@Req() req: AuthRequest, @Query() query: ListMyAttendanceDto) {
    return this.attendance.listMyAttendance(req.user.employeeId, query);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  async myAttendanceHistory(
    @Req() req: AuthRequest,
    @Query() query: ListMyAttendanceDto,
  ) {
    return this.attendance.listMyAttendance(req.user.employeeId, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  async getMyAttendance(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.attendance.getMyAttendanceById(req.user.employeeId, id);
  }
}
