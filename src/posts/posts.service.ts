import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { CreatePostDto } from './dto/create.dto.js';
import { UpdatePostDto } from './dto/update.dto.js';
import { QueryPostsDto } from './dto/query.dto.js';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly events: EventEmitter2,
  ) {}

  async create(userId: number, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        author: { connect: { id: userId } },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: { id: true, username: true },
        },
      },
    });

    this.events.emit('posts.changed');
    return post;
  }

  async findById(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, username: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      totalComments: post._count.comments,
      _count: undefined,
    };
  }

  async update(
    id: number,
    userId: number,
    dto: UpdatePostDto,
  ) {
    const existing = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.authorId !== userId) {
      throw new ForbiddenException(
        'You can only update your own posts',
      );
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && {
          title: dto.title.trim(),
        }),
        ...(dto.content !== undefined && {
          content: dto.content.trim(),
        }),
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        author: {
          select: { id: true, username: true },
        },
      },
    });

    this.events.emit('posts.changed');
    return post;
  }

  async remove(id: number, userId: number) {
    const existing = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.authorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own posts',
      );
    }

    await this.prisma.post.delete({ where: { id } });
    this.events.emit('posts.changed');

    return { message: 'Post deleted successfully' };
  }

  async feed(query: QueryPostsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const version = await this.redis.getFeedVersion();
    const cacheKey = `feed:${version}:${page}:${limit}`;

    const cached = await this.redis.get<unknown>(cacheKey);

    if (cached) {
      return cached;
    }

    const where = {};

    const [posts, totalItems] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          author: {
            select: { id: true, username: true },
          },
          _count: {
            select: { comments: true },
          },
          comments: {
            where: { parentId: null },
            orderBy: [
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: { id: true, username: true },
              },
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const items = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      totalComments: post._count.comments,
      latestComment: post.comments[0] ?? null,
    }));

    const result = {
      data: items,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };

    await this.redis.set(cacheKey, result, 60);
    return result;
  }

  async thread(
    postId: number,
    page = 1,
    limit = 10,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: { id: true, username: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const where = {
      postId,
      parentId: null,
    };

    const [comments, totalItems] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        orderBy: [
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: { id: true, username: true },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      post,
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
        totalReplies: comment._count.replies,
      })),
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}