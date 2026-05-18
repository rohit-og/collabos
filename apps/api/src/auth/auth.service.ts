import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });
    return { id: user.id, email: user.email, name: user.name };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, roles: [] }, { expiresIn: '15m' });

    // Create refresh token with tokenId so we can revoke it later
    const tokenId = randomUUID();
    const refreshToken = await this.jwtService.signAsync({ sub: user.id, tokenId }, { expiresIn: '7d' });
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({ data: { id: tokenId, tokenHash, userId: user.id, expiresAt } });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload: any = await this.jwtService.verifyAsync(refreshToken);
      const { sub: userId, tokenId } = payload;
      const record = await this.prisma.refreshToken.findUnique({ where: { id: tokenId } });
      if (!record || record.revoked) throw new UnauthorizedException('Invalid refresh token');
      if (record.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');
      const match = await bcrypt.compare(refreshToken, record.tokenHash);
      if (!match) throw new UnauthorizedException('Invalid refresh token');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found');

      const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, roles: [] }, { expiresIn: '15m' });
      return { accessToken };
    } catch (err) {
      this.logger.warn('Refresh failed', err?.message || err);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(tokenId: string) {
    await this.prisma.refreshToken.updateMany({ where: { id: tokenId }, data: { revoked: true } });
    return { revoked: true };
  }
}
