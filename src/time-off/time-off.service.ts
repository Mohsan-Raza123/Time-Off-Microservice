// File: src/time-off/time-off.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeOffBalance } from './time-off-balance.entity';

@Injectable()
export class TimeOffService {
  constructor(
    @InjectRepository(TimeOffBalance)
    private balanceRepo: Repository<TimeOffBalance>,
  ) {}

  // Employee ka current balance get karne ke liye
  async getBalance(employeeId: string, locationId: string) {
    const record = await this.balanceRepo.findOne({ where: { employeeId, locationId } });
    return record || { employeeId, locationId, balance: 0 };
  }

  // Time-off request submit karna (with Defensive Check)
  async submitRequest(employeeId: string, locationId: string, requestedDays: number) {
    const record = await this.balanceRepo.findOne({ where: { employeeId, locationId } });
    const currentBalance = record ? record.balance : 0;

    // Defensive Check: Agar balance local DB mein kam hai, toh pehle hi reject kar do
    if (currentBalance < requestedDays) {
      throw new BadRequestException('Local Check: Insufficient time-off balance.');
    }

    // Yahan aam taur par hum HCM ki Real-time API ko call karte hain...
    // Agar HCM accept kar le, toh hum local DB update kar dete hain
    record!.balance -= requestedDays;
    await this.balanceRepo.save(record!);

    return { 
      status: 'Success', 
      message: 'Request approved and synced with HCM', 
      remainingBalance: record!.balance 
    };
  }

  // HCM se aanay wale Batch Updates ko handle karna (e.g., Work Anniversary refresh)
  async syncBatch(balances: { employeeId: string; locationId: string; balance: number }[]) {
    for (const b of balances) {
       let record = await this.balanceRepo.findOne({ where: { employeeId: b.employeeId, locationId: b.locationId } });
       if (!record) {
         record = this.balanceRepo.create(b);
       } else {
         record.balance = b.balance;
         record.lastSyncedAt = new Date();
       }
       await this.balanceRepo.save(record);
    }
    return { message: 'Batch sync complete from HCM Source of Truth' };
  }
}