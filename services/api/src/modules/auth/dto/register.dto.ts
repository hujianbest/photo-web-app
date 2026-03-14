import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, {
    message: '用户名只能包含字母、数字、下划线，长度3-20位',
  })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, {
    message: '请输入正确的手机号码',
  })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @IsEnum(['user', 'model', 'admin'])
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  website?: string;
}