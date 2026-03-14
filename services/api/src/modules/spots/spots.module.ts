import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { CheckinSpot } from './entities/checkin-spot.entity';
import { Checkin } from './entities/checkin.entity';
import { CheckinLike } from './entities/checkin-like.entity';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { CheckinLikesController } from './checkin-likes.controller';
import { CheckinLikesService } from './checkin-likes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckinSpot, Checkin, CheckinLike]),
  ],
  controllers: [
    SpotsController,
    CheckinsController,
    CheckinLikesController,
  ],
  providers: [
    SpotsService,
    CheckinsService,
    CheckinLikesService,
  ],
  exports: [SpotsService],
})
export class SpotsModule {}