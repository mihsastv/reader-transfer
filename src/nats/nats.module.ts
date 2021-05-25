import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import {ClientsModule, Transport} from "@nestjs/microservices";
import {TRANSFER_SERVICE} from "../common/common.consts";
import {ConfigService} from "@nestjs/config";
import {WebsocketPubSubClient} from "../client/websocket.client-proxy";

@Module({
  imports: [ClientsModule.register([
    { name: TRANSFER_SERVICE, transport: Transport.NATS },
  ]),],
  providers: [NatsService,
    ConfigService,
    WebsocketPubSubClient],
})
export class NatsModule {}
