import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';
import {Logger} from "@nestjs/common";
import configuration from "./config/configuration";

async function bootstrap() {
  const logger = new Logger('StarApp')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.NATS,
    options: {
      url: configuration().natsUrl,
    },
  });
  logger.log(configuration().natsUrl);
  app.listen(() => logger.log('Microservice is listening'));
}
bootstrap();
