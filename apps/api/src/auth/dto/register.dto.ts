import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alice', description: 'Full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'strong-password-123', description: 'User password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  password: string;
}
