import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, MeModule],
})
export class AuthAppModule {}
