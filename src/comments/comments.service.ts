import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { EventEmitter2 } from '@nestjs/event-emitter';
  
  import { PrismaService } from '../prisma/prisma.service.js';
  import { CreateCommentDto } from './dto/comment.dto.js';
  
  @Injectable()
  export class CommentsService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly events: EventEmitter2,
    ) {}
  
    async create(
      postId: number,
      userId: number,
      dto: CreateCommentDto,
    ) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });
  
      if (!post) {
        throw new NotFoundException('Post not found');
      }
  
      if (dto.parentId !== undefined) {
        const parent = await this.prisma.comment.findUnique({
          where: { id: dto.parentId },
          select: { id: true, postId: true },
        });
  
        if (!parent || parent.postId !== postId) {
          throw new BadRequestException(
            'Parent comment must belong to this post',
          );
        }
      }
  
      const comment = await this.prisma.comment.create({
        data: {
          content: dto.content.trim(),
          post: { connect: { id: postId } },
          author: { connect: { id: userId } },
          ...(dto.parentId !== undefined && {
            parent: { connect: { id: dto.parentId } },
          }),
        },
        select: {
          id: true,
          content: true,
          postId: true,
          parentId: true,
          createdAt: true,
          author: {
            select: { id: true, username: true },
          },
        },
      });
  
      this.events.emit('posts.changed');
      return comment;
    }
  }