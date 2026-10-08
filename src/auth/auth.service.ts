import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import * as bcrypt from 'bcrypt';
  
  import { JwtService } from '@nestjs/jwt';
  
  import { UsersService } from '../users/users.service.js';
  
  import { LoginDto } from './dto/login.dto.js';
  import { RegisterDto } from './dto/register.dto.js';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
    ) {}
  
    async register(dto: RegisterDto) {
      return this.usersService.create(dto);
    }
  
    async login(dto: LoginDto) {
      const user =
        await this.usersService.findByEmail(
          dto.email,
        );
  
      if (!user) {
        throw new UnauthorizedException(
          'Invalid credentials',
        );
      }
  
      const passwordMatches =
        await bcrypt.compare(
          dto.password,
          user.password,
        );
  
      if (!passwordMatches) {
        throw new UnauthorizedException(
          'Invalid credentials',
        );
      }
  
      const payload = {
        sub: user.id,
        username: user.username,
      };
  
      const accessToken =
        await this.jwtService.signAsync(
          payload,
        );
  
      return {
        accessToken,
      };
    }
  }