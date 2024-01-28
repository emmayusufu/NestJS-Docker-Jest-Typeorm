import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePostPrivacyDto {
  @IsBoolean()
  @IsNotEmpty()
  isPrivate: boolean;
}
