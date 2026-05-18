import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto, examples: { default: { value: { email: 'user@example.com', name: 'Alice', password: 'strong-password-123' } } } })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto, examples: { default: { value: { email: 'user@example.com', password: 'strong-password-123' } } } })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string', example: '<refresh-token>' } }, required: ['refreshToken'] } })
  @ApiResponse({ status: 200, description: 'Returns a new access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiBody({ schema: { type: 'object', properties: { tokenId: { type: 'string', example: 'uuid-token-id' } }, required: ['tokenId'] } })
  @ApiResponse({ status: 200, description: 'Revokes the refresh token' })
  async logout(@Body('tokenId') tokenId: string) {
    return this.authService.logout(tokenId);
  }
}
