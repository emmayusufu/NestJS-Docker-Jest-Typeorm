import {
  IsString,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  IsObject,
  ValidateIf,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  isPrivate: boolean = false;

  @IsObject()
  @ValidateIf((o) => o.metadata !== undefined)
  metadata: object = {};

  @IsArray()
  @ValidateIf((o) => o.tags !== undefined)
  tags: string[] = [];

  @IsString()
  @IsNotEmpty()
  userId: string;
}
