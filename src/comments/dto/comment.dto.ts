import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
  } from 'class-validator';
  
  export class CreateCommentDto {
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    content!: string;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    parentId?: number;
  }