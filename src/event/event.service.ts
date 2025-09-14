import { Injectable, BadRequestException } from '@nestjs/common';
import type { EventDto } from './event.schema';

@Injectable()
export class EventService {
    private events: EventDto[] = []; // סימולציה של DB מקומי

    updateEvent(event: EventDto): EventDto {
        // 1. בדיקות לוגיות נוספות
        if (event.status < 1 || event.status > 6) {
            throw new BadRequestException('Invalid status value');
        }

        // מיקום – נבדוק אם בקירוב נמצא בגבולות ישראל
        const { latitude, longitude } = event.location;
        if (latitude < 29.0 || latitude > 33.5 || longitude < 34.0 || longitude > 36.0) {
            throw new BadRequestException('Location must be within Israel boundaries');
        }

        // תאריך – לא יכול להיות בעבר
        const eventDate = new Date(event.create_date);
        if (eventDate < new Date()) {
            throw new BadRequestException('Event date must be in the future');
        }

        // 2. עדכון "DB" מקומי
        this.events.push(event);

        // מחזירים את האירוע המעודכן
        return event;
    }

    getAllEvents(): EventDto[] {
        return this.events;
    }
}
