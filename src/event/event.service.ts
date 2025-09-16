import { Injectable, BadRequestException } from '@nestjs/common';
import { type EventDto } from './event.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Status } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

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

    if (event.id) {
      console.log("if (event.id) {")
      const existing = await this.prisma.event.findUnique({
        where: { id: event.id },
      });

      if (existing) {
        console.log("if (existing) {")
        // עדכון
        return await this.prisma.event.update({
          where: { id: event.id },
          data: eventData,
          include: { location: true },
        });
      }
    }

    // יצירה חדשה
    return await this.prisma.event.create({
      data: eventData,
      include: { location: true },
    });
  }

  async getAllEvents() {
    return await this.prisma.event.findMany({
      include: {
        location: true,
      },
    });
  }
}
