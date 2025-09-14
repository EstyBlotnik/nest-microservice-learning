import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatusModule } from './status/status.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [StatusModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
