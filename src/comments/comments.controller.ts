import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import type { Request } from 'express';
  
  import { CommentsService } from './comments.service.js';
  import { CreateCommentDto } from './dto/comment.dto.js';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
  
  type AuthenticatedRequest = Request & {
    user: { sub: number };
  };
  
  @Controller('posts/:postId/comments')
  export class CommentsController {
    constructor(
      private readonly commentsService: CommentsService,
    ) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    create(
      @Param('postId', ParseIntPipe) postId: number,
      @Req() request: AuthenticatedRequest,
      @Body() dto: CreateCommentDto,
    ) {
      return this.commentsService.create(
        postId,
        Number(request.user.sub),
        dto,
      );
    }
  }