import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  coordinates?: { lat: number; lng: number };

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  best_time?: string[];

  @IsArray()
  @IsOptional()
  tips?: string[];

  @IsEnum(['indoor', 'outdoor', 'urban', 'nature'])
  @IsOptional()
  category?: string;

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: string;
}