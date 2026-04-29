// File: src/time-off/time-off.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeOffBalance } from './time-off-balance.entity';
import { TimeOffService } from './time-off.service';
import { TimeOffController } from './time-off.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TimeOffBalance])],
  providers: [TimeOffService],
  controllers: [TimeOffController],
})
export class TimeOffModule {}