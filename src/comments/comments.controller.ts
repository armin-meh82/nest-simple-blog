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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/comment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

type AuthenticatedRequest = Request & {
  user: { sub: number };
};

@ApiTags('Comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a comment or a nested reply',
  })
  @ApiParam({
    name: 'postId',
    type: Number,
    description: 'ID of the post to comment on',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Post or parent comment not found',
  })
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
