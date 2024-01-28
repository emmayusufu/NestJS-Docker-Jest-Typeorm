import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';

export class UserLoginDto {
  @IsEmail()
  @ValidateIf((v) => v.username === undefined)
  emailAddress?: string;

  @IsString()
  @ValidateIf((v) => v.emailAddress === undefined)
  username?: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
