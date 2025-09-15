import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatusModule } from './status/status.module';
import { EventModule } from './event/event.module';
import { PrismaService } from './prisma/prisma.service';
import { StatusService } from './status/status.service';

@Module({
  imports: [StatusModule, EventModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, StatusService],
})
export class AppModule { }