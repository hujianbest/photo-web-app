import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  target_user_id: number;

  @IsEnum(['tfp', 'paid'])
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  time_range?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  coordinates?: { lat: number; lng: number };

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsArray()
  @IsOptional()
  requirements?: string[];

  @IsArray()
  @IsOptional()
  style_preferences?: string[];

  @IsArray()
  @IsOptional()
  sample_images?: string[];
}