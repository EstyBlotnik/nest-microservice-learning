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

  /**
   * Maps a numeric status (1-6) from the DTO
   * to the corresponding Prisma Status enum.
   * Throws BadRequestException if value is invalid.
   */
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

  /**
   * Sends the saved event data to an external API.
   * Each alert is sent as a separate request, replacing the `alerts` array
   * with a single `alert` field. Dates are formatted to Asia/Jerusalem timezone.
   */
  private async sendEventToExternalAPI(savedEvent: any) {
    await Promise.all(
      savedEvent.alerts.map(async (alert) => {
        // Remove the alerts array from the object
        const { alerts, ...eventWithoutAlerts } = savedEvent;

        // Build payload with single alert and formatted dates
        const payload = {
          ...eventWithoutAlerts,
          alert,
          create_date: formatToIsraelTimezone(savedEvent.create_date),
          createdAt: formatToIsraelTimezone(savedEvent.createdAt),
          updatedAt: formatToIsraelTimezone(savedEvent.updatedAt),
          timezone: 'Asia/Jerusalem',
        };

        // Send to external API (URL is read from environment variable)
        const response = await firstValueFrom(
          this.http.post(process.env.EXTERNAL_API_URL!, payload),
        );

        console.log('External API response:', response.data);
      }),
    );
  }

  /**
   * Creates or updates an event in the database.
   * - Validates input (status, location boundaries, future date).
   * - Reuses existing location if available.
   * - Updates event if ID exists, otherwise creates a new one.
   * - After saving, sends event data to external API.
   */
  async createOrUpdateEvent(event: EventDto) {
    // --- Validation ---
    if (event.status < 1 || event.status > 6) {
      throw new BadRequestException('Invalid status value');
    }

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

    const eventDate = new Date(event.create_date);
    if (eventDate < new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    // --- Location handling ---
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

    // --- Update or Create ---
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

    // --- External API call ---
    try {
      await this.sendEventToExternalAPI(savedEvent);
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
