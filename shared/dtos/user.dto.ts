import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from '../utils/enums';
import { IsValidPassword } from '../validators/password.validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsValidPassword()
  password: string;

  @IsNotEmpty()
  role: UserRole;
}
