import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [EventController],
    providers: [EventService, PrismaService],
    exports: [EventService, PrismaService],
})
export class EventModule { }
