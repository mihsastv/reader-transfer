import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import {ConfigModule} from "@nestjs/config";
import configuration from "./config/configuration";

@Module({
  imports: [NatsModule, ConfigModule.forRoot({
    load: [configuration], isGlobal: true
  })]
})
export class AppModule {}
