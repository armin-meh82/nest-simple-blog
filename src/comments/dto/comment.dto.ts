
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Great post!',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({
    example: 12,
    minimum: 1,
    description:
      'Parent comment ID. Omit this field to create a top-level comment.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}
