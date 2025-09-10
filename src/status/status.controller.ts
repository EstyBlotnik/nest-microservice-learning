import { Controller, Get, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('status')
@Controller('status')
export class StatusController {
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'The service is running OK.' })
    @ApiResponse({ status: 500, description: 'Unexpected server error.' })
    getStatus() {
        try {
            return {
                status: 'ok',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            };
        } catch (err) {
            throw new HttpException(
                { status: 'error', reason: 'unexpected failure' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
