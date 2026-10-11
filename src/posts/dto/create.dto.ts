
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'My first post',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    example: 'This is the content of my first post.',
    minLength: 1,
    maxLength: 20000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  content!: string;
}
