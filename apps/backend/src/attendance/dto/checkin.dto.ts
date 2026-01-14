import { IsOptional, IsString, MaxLength } from "class-validator";

export class AttendanceCheckInDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
