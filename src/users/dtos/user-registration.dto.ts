import { IsNotEmpty, IsEmail, MinLength, Matches } from 'class-validator';

export class UserRegistrationDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password is too weak, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number and a special character',
  })
  password: string;
}
