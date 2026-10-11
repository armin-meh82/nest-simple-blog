
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';
  import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  
  import { ProfileService } from './profile.service.js';
  
  @ApiTags('Users')
  @Controller('users')
  export class ProfileController {
    constructor(
      private readonly profileService: ProfileService,
    ) {}
  
    @Get(':userId/profile')
    @ApiOperation({
      summary: 'Get user profile and activity analytics',
    })
    @ApiParam({
      name: 'userId',
      type: Number,
      description: 'User ID',
    })
    @ApiResponse({
      status: 200,
      description: 'User profile, activity totals and recent actions',
    })
    @ApiResponse({
      status: 404,
      description: 'User not found',
    })
    getProfile(
      @Param('userId', ParseIntPipe) userId: number,
    ) {
      return this.profileService.getProfile(userId);
    }
  }
  