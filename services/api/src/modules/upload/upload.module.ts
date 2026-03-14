import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = configService.get('UPLOAD_PATH') || './uploads';
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = uuidv4();
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedTypes = configService.get('UPLOAD_ALLOWED_TYPES')?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ];
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type'), false);
          }
        },
        limits: {
          fileSize: parseInt(configService.get('UPLOAD_MAX_SIZE') || '10485760'), // 10MB
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}