// File: src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeOffBalance } from './time-off/time-off-balance.entity';
import { TimeOffModule } from './time-off/time-off.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'hr-database.sqlite', // Local SQLite database file ka naam
      entities: [TimeOffBalance],
      synchronize: true, // Development ke liye acha hai, tables automatically ban jayengi
    }),
    TypeOrmModule.forFeature([TimeOffBalance]),
    TimeOffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}