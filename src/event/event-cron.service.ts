import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class EventCronService {
  private readonly logger = new Logger(EventCronService.name);

  constructor(private prisma: PrismaService) {}

  // רץ כל דקה
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();
    this.logger.debug(`⏰ Running cronjob at ${now.toISOString()}`);

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    this.logger.debug(`Checking OPEN events older than ${oneHourAgo.toISOString()}`);
    this.logger.debug(`Checking ALL events older than ${twentyFourHoursAgo.toISOString()}`);

    // כמה אירועים עומדים בתנאי לפני עדכון
    const openEvents = await this.prisma.event.findMany({
      where: { status: Status.OPEN, updatedAt: { lt: oneHourAgo } },
      select: { id: true, name: true, updatedAt: true },
    });
    this.logger.debug(`Found ${openEvents.length} OPEN events to activate:`);
    openEvents.forEach(e =>
      this.logger.debug(`  - [${e.id}] ${e.name}, updatedAt=${e.updatedAt.toISOString()}`),
    );

    const inactiveEvents = await this.prisma.event.findMany({
      where: { updatedAt: { lt: twentyFourHoursAgo } },
      select: { id: true, name: true, status: true, updatedAt: true },
    });
    this.logger.debug(`Found ${inactiveEvents.length} events to close:`);
    inactiveEvents.forEach(e =>
      this.logger.debug(
        `  - [${e.id}] ${e.name}, status=${e.status}, updatedAt=${e.updatedAt.toISOString()}`,
      ),
    );

    // מבצעים עדכונים
    const updateToActive = await this.prisma.event.updateMany({
      where: { status: Status.OPEN, updatedAt: { lt: oneHourAgo } },
      data: { status: Status.ACTIVE },
    });
    this.logger.debug(`✅ Updated ${updateToActive.count} events from OPEN → ACTIVE`);

    const updateToClosed = await this.prisma.event.updateMany({
      where: { updatedAt: { lt: twentyFourHoursAgo } },
      data: { status: Status.CLOSED },
    });
    this.logger.debug(`✅ Updated ${updateToClosed.count} events → CLOSED`);

    this.logger.debug('🏁 Cronjob finished\n');
  }
}
