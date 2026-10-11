import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { ProfileService } from './profile.service.js';
  
  @Controller('users')
  export class ProfileController {
    constructor(
      private readonly profileService: ProfileService,
    ) {}
  
    @Get(':userId/profile')
    getProfile(
      @Param('userId', ParseIntPipe) userId: number,
    ) {
      return this.profileService.getProfile(userId);
    }
  }