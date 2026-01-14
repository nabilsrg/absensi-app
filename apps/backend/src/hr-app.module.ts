import { Module } from '@nestjs/common';
import { JwtStrategy } from './auth/jwt.strategy';
import { HrModule } from './hr/hr.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HrModule],
  providers: [JwtStrategy],
})
export class HrAppModule {}
