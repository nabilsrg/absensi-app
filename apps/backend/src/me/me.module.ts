import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeController],
  providers: [RolesGuard],
})
export class MeModule {}
