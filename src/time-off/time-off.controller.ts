// File: src/time-off/time-off.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TimeOffService } from './time-off.service';

@Controller('api')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Get('balances/:employeeId/:locationId')
  getBalance(@Param('employeeId') employeeId: string, @Param('locationId') locationId: string) {
    return this.timeOffService.getBalance(employeeId, locationId);
  }

  @Post('requests')
  submitRequest(@Body() body: { employeeId: string, locationId: string, requestedDays: number }) {
    return this.timeOffService.submitRequest(body.employeeId, body.locationId, body.requestedDays);
  }

  @Post('webhooks/hcm-batch')
  syncBatch(@Body() body: { balances: any[] }) {
    return this.timeOffService.syncBatch(body.balances);
  }
}