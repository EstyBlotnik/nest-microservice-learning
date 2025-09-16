import { z } from 'zod';
import { Status } from '@prisma/client';
// סטטוסים מותרים
const statusEnum = z.union([
  z.literal(1), // פתוח
  z.literal(2), // פעיל
  z.literal(3), // ניסוי
  z.literal(4), // בבדיקה
  z.literal(5), // סגור
  z.literal(6), // מבוטל
]);

export const EventSchema = z.object({
  id: z.number().optional(),
  name: z.string().regex(/^[a-zA-Z0-9 ]+$/, 'Name must be alphanumeric'),
  create_date: z.string().datetime({ offset: true }),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  alerts: z.array(z.number()),
  status: statusEnum,
  description: z.string(),
});

export type EventDto = z.infer<typeof EventSchema>;
