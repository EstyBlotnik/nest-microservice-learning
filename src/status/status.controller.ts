import { Controller, Get, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatusService } from './status.service';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'The service is running OK.' })
  @ApiResponse({ status: 500, description: 'Unexpected server error.' })
  async getStatus() {
    const dbOk = await this.statusService.checkDatabase();

    if (!dbOk) {
      throw new HttpException(
        { status: 'error', reason: 'Database connection failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
