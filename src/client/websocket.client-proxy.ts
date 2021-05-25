import {ClientProxy, ReadPacket, WritePacket} from "@nestjs/microservices";
import * as socketClient from "socket.io-client";
import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class WebsocketPubSubClient extends ClientProxy {
    constructor(private cfg: ConfigService) {
        super()
    }

    private socket: socketClient.Socket;
    private socketUrl = this.cfg.get('socketUrl')
    private logger = new Logger(WebsocketPubSubClient.name);

    async connect(): Promise<any> {
        if (!this.socket) {
            this.socket = socketClient(this.socketUrl);
            this.socket.on('connect', () => {
                this.logger.log('connect to WebSocket server');
            })
        }
    }

    async close() {
        this.socket.close();
        this.logger.log('close connection to WebSocket server');
    }

    async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
        return console.log('event to dispatch: ', packet);
    }

    publish(
        packet: ReadPacket<any>,
        callback: (packet: WritePacket<any>) => void,
    ): Function {
        this.socket.emit('server', {pattern: packet.pattern,
            payload: packet.data});
        this.socket.on('client', (res) => {
            callback({ response: res })
        })
        return () => (console.log);
    }
}
