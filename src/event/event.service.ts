import { Injectable, BadRequestException } from '@nestjs/common';
import { type EventDto } from './event.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Status } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { formatToIsraelTimezone } from 'src/common/utils/date.util';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  private mapStatus(num: number): Status {
    switch (num) {
      case 1:
        return 'OPEN';
      case 2:
        return 'ACTIVE';
      case 3:
        return 'TESTING';
      case 4:
        return 'CHECKING';
      case 5:
        return 'CLOSED';
      case 6:
        return 'CANCELED';
      default:
        throw new BadRequestException('Invalid status value');
    }
  }

  async createOrUpdateEvent(event: EventDto) {
    // 1. בדיקות לוגיות נוספות
    if (event.status < 1 || event.status > 6) {
      throw new BadRequestException('Invalid status value');
    }

    // מיקום – נבדוק אם בקירוב נמצא בגבולות ישראל
    const { latitude, longitude } = event.location;
    if (
      latitude < 29.0 ||
      latitude > 33.5 ||
      longitude < 34.0 ||
      longitude > 36.0
    ) {
      throw new BadRequestException(
        'Location must be within Israel boundaries',
      );
    }

    // תאריך – לא יכול להיות בעבר
    const eventDate = new Date(event.create_date);
    if (eventDate < new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    // בדיקה אם יש לוקיישן כזה כבר
    const location = await this.prisma.location.findFirst({
      where: {
        latitude: event.location.latitude,
        longitude: event.location.longitude,
      },
    });

    const locationData = location
      ? { connect: { id: location.id } }
      : { create: { ...event.location } };

    const eventData: Prisma.EventCreateInput = {
      name: event.name,
      create_date: new Date(event.create_date),
      description: event.description,
      status: this.mapStatus(event.status),
      alerts: event.alerts,
      location: locationData,
    };

    let savedEvent;
    if (event.id) {
      const existing = await this.prisma.event.findUnique({
        where: { id: event.id },
      });
      if (existing) {
        savedEvent = await this.prisma.event.update({
          where: { id: event.id },
          data: eventData,
          include: { location: true },
        });
      }
    }

    if (!savedEvent) {
      savedEvent = await this.prisma.event.create({
        data: eventData,
        include: { location: true },
      });
    }

    try {
      await Promise.all(
        savedEvent.alerts.map(async (alert) => {
          const { alerts, ...eventWithoutAlerts } = savedEvent;

          const response = await firstValueFrom(
            this.http.post('https://postman-echo.com/post', {
              ...eventWithoutAlerts,
              alert, // שדה alert יחיד
              create_date: formatToIsraelTimezone(savedEvent.createdAt),
              createdAt: formatToIsraelTimezone(savedEvent.createdAt),
              updatedAt: formatToIsraelTimezone(savedEvent.updatedAt),
              timezone: 'Asia/Jerusalem',
            }),
          );

          console.log('External API response:', response.data);
        }),
      );
    } catch (err) {
      console.error('Error sending to external API:', err.message);
    }
    return savedEvent;
  }

  async getAllEvents() {
    return await this.prisma.event.findMany({
      include: {
        location: true,
      },
    });
  }
}
