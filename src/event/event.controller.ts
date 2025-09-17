import { Body, Controller, Post, Get, UsePipes } from '@nestjs/common';
import { EventSchema } from './event.schema';
import type { EventDto } from './event.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { EventService } from './event.service';
@ApiTags('event')
@Controller()
export class EventController {
  constructor( private readonly eventService: EventService  ) {}
  @Post('update')
  @ApiResponse({ status: 201, description: 'Update completed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiBody({
    description: 'Event object',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string', example: 'Conference2025' },
        create_date: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-01T12:00:00+02:00',
        },
        location: {
          type: 'object',
          properties: {
            latitude: { type: 'number', example: 32.08 },
            longitude: { type: 'number', example: 34.78 },
          },
        },
        alerts: {
          type: 'array',
          items: { type: 'number' },
          example: [101, 202],
        },
        status: { type: 'integer', enum: [1, 2, 3, 4, 5, 6] },
        description: { type: 'string', example: 'אירוע בדיקה' },
      },
      required: [
        'id',
        'name',
        'create_date',
        'location',
        'status',
        'description',
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(EventSchema))
  async updateEvent(@Body() body: EventDto) {
    const updated = await this.eventService.createOrUpdateEvent(body);
    return { message: 'Event updated successfully', event: updated };
  }

  @Get('event')
  @ApiResponse({ status: 200, description: 'Returned all events.' })
  @ApiResponse({ status: 500, description: 'Unexpected server error.' })
  getAll() {
    return this.eventService.getAllEvents();
  }
}
