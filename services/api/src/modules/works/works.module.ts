import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';
import { Work } from './entities/work.entity';
import { WorkLikesController } from './work-likes.controller';
import { WorkLikesService } from './work-likes.service';
import { WorkLike } from './entities/work-likes.entity';
import { WorkCommentsController } from './work-comments.controller';
import { WorkCommentsService } from './work-comments.service';
import { WorkComment } from './entities/work-comments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Work, WorkLike, WorkComment]),
  ],
  controllers: [
    WorksController,
    WorkLikesController,
    WorkCommentsController,
  ],
  providers: [
    WorksService,
    WorkLikesService,
    WorkCommentsService,
  ],
  exports: [WorksService],
})
export class WorksModule {}