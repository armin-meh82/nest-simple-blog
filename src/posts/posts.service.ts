import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import { PrismaService } from '../prisma/prisma.service.js';
  import { CreatePostDto } from './dto/create.dto.js';
  
  @Injectable()
  export class PostsService {
    constructor(
      private readonly prisma: PrismaService,
    ) {}
  
    async create(
      userId: number,
      dto: CreatePostDto,
    ) {
      return this.prisma.post.create({
        data: {
          title: dto.title.trim(),
          content: dto.content.trim(),
  
          author: {
            connect: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    }
  
    async findById(id: number) {
      const post = await this.prisma.post.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
  
      if (!post) {
        throw new NotFoundException('Post not found');
      }
  
      return post;
    }
  }