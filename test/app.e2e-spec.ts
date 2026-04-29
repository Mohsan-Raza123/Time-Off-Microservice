// File: test/time-off.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Time-Off Microservice (e2e) & HCM Mock Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Mocking the HCM Batch Update (e.g., Start of Year / Work Anniversary refresh)
  it('/api/webhooks/hcm-batch (POST) - should simulate HCM syncing 10 days balance', () => {
    return request(app.getHttpServer())
      .post('/api/webhooks/hcm-batch')
      .send({
        balances: [
          { employeeId: 'emp-100', locationId: 'loc-PK', balance: 10 },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Batch sync complete from HCM Source of Truth');
      });
  });

  // 2. Testing Employee Balance Visibility
  it('/api/balances/emp-100/loc-PK (GET) - employee should see accurate synced balance', () => {
    return request(app.getHttpServer())
      .get('/api/balances/emp-100/loc-PK')
      .expect(200)
      .expect((res) => {
        expect(res.body.balance).toBe(10);
      });
  });

  // 3. Testing Defensive Programming (Crucial constraint)
  it('/api/requests (POST) - should defensively fail if requested days exceed balance without waiting for HCM', () => {
    return request(app.getHttpServer())
      .post('/api/requests')
      .send({ employeeId: 'emp-100', locationId: 'loc-PK', requestedDays: 15 })
      .expect(400) // 400 Bad Request error aana chahiye
      .expect((res) => {
        expect(res.body.message).toBe('Local Check: Insufficient time-off balance.');
      });
  });

  // 4. Testing a Valid Leave Request Lifecycle
  it('/api/requests (POST) - should approve valid request and deduct balance', () => {
    return request(app.getHttpServer())
      .post('/api/requests')
      .send({ employeeId: 'emp-100', locationId: 'loc-PK', requestedDays: 3 })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('Success');
        expect(res.body.remainingBalance).toBe(7); // 10 - 3 = 7
      });
  });
});