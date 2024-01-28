import { IsString, IsDate, IsNotEmpty } from 'class-validator';
export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsDate()
  expiresIn: number;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
