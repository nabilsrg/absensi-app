import { Module } from '@nestjs/common';
import { HrController } from './hr.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HrService } from './hr.service';

@Module({
  controllers: [HrController],
  providers: [RolesGuard, HrService],
})
export class HrModule {}
