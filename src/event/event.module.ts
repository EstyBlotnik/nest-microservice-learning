import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { EventCronService } from './event-cron.service';

@Module({
  imports: [HttpModule],
  controllers: [EventController],
  providers: [EventService, PrismaService, EventCronService],
  exports: [EventService, PrismaService],
})
export class EventModule {}
