import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateCheckinDto {
  @IsArray()
  @IsNotEmpty()
  photos: string[];

  @IsString()
  @IsOptional()
  caption?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  coordinates?: { lat: number; lng: number };

  @IsString()
  @IsOptional()
  weather?: string;

  @IsOptional()
  camera_info?: Record<string, any>;
}