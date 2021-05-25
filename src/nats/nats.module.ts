import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import { NatsController } from './nats.controller';

@Module({
  providers: [NatsService],
  controllers: [NatsController]
})
export class NatsModule {}
