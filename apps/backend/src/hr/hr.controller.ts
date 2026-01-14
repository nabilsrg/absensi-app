import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListAttendanceDto } from './dto/list-attendance.dto';
import { ListEmployeesDto } from './dto/list-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { HrService } from './hr.service';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HRD')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('employees')
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  async listEmployees(@Query() query: ListEmployeesDto) {
    return this.hrService.listEmployees(query);
  }

  @Get('employees/:id')
  async getEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.getEmployee(id);
  }

  @Patch('employees/:id')
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.hrService.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  async deactivateEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.deactivateEmployee(id);
  }

  @Get('attendances')
  async listAttendances(@Query() query: ListAttendanceDto) {
    return this.hrService.listAttendances(query);
  }

  @Get('attendances/:id')
  async getAttendance(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.getAttendance(id);
  }
}
