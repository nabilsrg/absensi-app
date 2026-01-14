import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthRequest } from '../common/types/auth-request.type';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('EMPLOYEE')
  async profile(@Req() req: AuthRequest) {
    const { user } = req;
    let employeeCode: string | null = null;

    if (user?.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.employeeId },
        select: { employeeCode: true },
      });
      employeeCode = employee?.employeeCode ?? null;
    }

    return {
      user: {
        ...user,
        employeeCode,
      },
    };
  }
}
