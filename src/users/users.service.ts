import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';

import { RegisterDto } from '../auth/dto/register.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: RegisterDto) {
    const existingUser =
      await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              username: dto.username,
            },
            {
              email: dto.email,
            },
          ],
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Username or email already exists',
      );
    }

    const passwordHash =
      await bcrypt.hash(dto.password, 10);

    const user =
      await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          password: passwordHash,
        },
      });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}