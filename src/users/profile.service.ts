import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service.js';
  
  @Injectable()
  export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}
  
    async getProfile(userId: number) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          bio: true,
          avatar: true,
          createdAt: true,
        },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const [
        totalPosts,
        totalComments,
        recentPosts,
        recentComments,
      ] = await this.prisma.$transaction([
        this.prisma.post.count({
          where: { authorId: userId },
        }),
        this.prisma.comment.count({
          where: { authorId: userId },
        }),
        this.prisma.post.findMany({
          where: { authorId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        }),
        this.prisma.comment.findMany({
          where: { authorId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            content: true,
            postId: true,
            createdAt: true,
            post: {
              select: { title: true },
            },
          },
        }),
      ]);
  
      const recentActivity = [
        ...recentPosts.map((post) => ({
          type: 'post' as const,
          id: post.id,
          title: post.title,
          createdAt: post.createdAt,
        })),
        ...recentComments.map((comment) => ({
          type: 'comment' as const,
          id: comment.id,
          content: comment.content,
          postId: comment.postId,
          postTitle: comment.post.title,
          createdAt: comment.createdAt,
        })),
      ]
        .sort(
          (a, b) =>
            b.createdAt.getTime() - a.createdAt.getTime(),
        )
        .slice(0, 5);
  
      return {
        user,
        total_posts_created: totalPosts,
        total_comments_made: totalComments,
        recent_activity: recentActivity,
      };
    }
  }