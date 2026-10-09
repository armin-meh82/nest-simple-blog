import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import * as bcrypt from 'bcrypt';
  
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  
  import { UsersService } from '../users/users.service.js';
  
  import { LoginDto } from './dto/login.dto.js';
  import { RegisterDto } from './dto/register.dto.js';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    async register(dto: RegisterDto) {
      return this.usersService.create(dto);
    }
  
    private getRefreshSecret(): string {
      const secret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
      );
  
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is missing');
      }
  
      return secret;
    }
  
    private async generateTokens(
      userId: number,
      username: string,
    ) {
      const payload = {
        sub: userId,
        username,
      };
  
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload),
        this.jwtService.signAsync(payload, {
          secret: this.getRefreshSecret(),
          expiresIn: '7d',
        }),
      ]);
  
      const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        10,
      );
  
      await this.usersService.updateRefreshTokenHash(
        userId,
        refreshTokenHash,
      );
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    async login(dto: LoginDto) {
      const user = await this.usersService.findByEmail(
        dto.email,
      );
  
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      const passwordMatches = await bcrypt.compare(
        dto.password,
        user.password,
      );
  
      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      return this.generateTokens(user.id, user.username);
    }
  
    async refreshTokens(refreshToken: string) {
      let payload: { sub: number; username: string };
    
      try {
        payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.getRefreshSecret(),
        });
      } catch {
        throw new UnauthorizedException('Invalid refresh token');
      }
    
      const user = await this.usersService.findById(payload.sub);
    
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    
      const tokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );
    
      if (!tokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      });
    
      return { accessToken };
    }
  
  }