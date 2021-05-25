import {Inject, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ClientProxy} from "@nestjs/microservices";
import {Observable, pipe} from "rxjs";
import * as readline from "readline";
import * as fs from "fs";
import {TRANSFER_SERVICE} from "../common/common.consts";
import {Stats} from "fs";
import {ConfigService} from "@nestjs/config";
import {WebsocketPubSubClient} from "../client/websocket.client-proxy";
import {take, timeout} from "rxjs/operators";

@Injectable()
export class NatsService implements OnModuleInit {
    constructor(private configService: ConfigService) {
    }

    @Inject(TRANSFER_SERVICE) private clientProxy: ClientProxy;
    @Inject() private clientWebSocket: WebsocketPubSubClient;

    private client: ClientProxy | WebsocketPubSubClient;
    private byteSize = this.configService.get('highWaterMark');
    private logger = new Logger(NatsService.name);
    private currTransport = this.configService.get('selectTransport');

    onModuleInit(): any {
        this.client = this.currTransport ? this.clientWebSocket : this.clientProxy;

        setTimeout(async () => {
            this.mainProcess().catch(e => this.logger.error(e));
        }, 1000);
    }

    async mainProcess() {
        let path = 'none';
        let stat: Stats = undefined;

        while (!stat) {
            if (path !== 'none') {
                this.logger.warn('no file found at the specified path')
            }
            path = await this.inputPath();
            stat = await this.checkFile(path);
        }
        this.logger.debug(`The file ${path} is ready for transfer`);

        await this.initStream(path)
            .pipe(take(1), timeout(5000))
            .toPromise()
            .then(async () => {
                this.logger.log(`The stream for transfer file ${path} is init`)
                await this.sendStream(path, stat);
                this.closeStream().pipe(take(1)).subscribe(async () => {
                        this.logger.debug(`The stream for transfer file ${path} is closed`);
                        await this.repeatApp();
                    }
                );
            })
            .catch(async (e) => {
                this.logger.error(`Server is not allow, Check Settings:
                                           current Transport: ${this.currTransport ? 'NATS' : 'WS'} ${e}`);
                await this.repeatApp();
            });
    }

    async repeatApp() {
        if (await this.repeatTransfer()) {
            await this.mainProcess();
        } else {
            this.logger.debug('Thank you for using our service )');
        }
    }

    initStream(path): Observable<boolean> {
        const fileName = this.replacePath(path);
        const pattern = 'createStream';
        return this.client.send<boolean>(pattern, fileName)
    }

    sendData(payload): Observable<boolean> {
        const pattern = 'sendData';
        return this.client.send<boolean>(pattern, payload)
    }

    sendStream(path: string, stats: Stats): Promise<boolean> {
        const rs = fs.createReadStream(path,
            {highWaterMark: this.byteSize});
        const stepSize = Math.ceil(stats.size) / 40;
        let currStep = 2 * stepSize;
        let count = 0;

        rs.on("data", (data) => {
            rs.pause();
            this.sendData(data).pipe(take(1))
                .subscribe(() => {
                        rs.resume();
                        if (!count) {
                            process.stdout.write("File loading -> ");
                        }
                        count += this.byteSize;
                        if (currStep < count) {
                            process.stdout.write("-> ");
                            currStep += stepSize;
                        }
                    }
                );
        });
        return new Promise(resolve => {
            rs.on('end', () => {
                process.stdout.write("\n");
                this.logger.log(`finish write file ${path} 100%`);
                resolve(true);
            });
        })

    }

    closeStream(): Observable<boolean> {
        const pattern = 'closeStream';
        return this.client.send<boolean>(pattern, 'null');
    }

    async checkFile(path: string): Promise<Stats> {
        return new Promise(resolve => {
                fs.stat(path, (err, stat) => {
                    resolve(stat?.isFile() ? stat : null);
                })
            }
        )
    }

    async inputPath(): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return await new Promise((resolve) => {
            rl.question('Enter the path to the file >', (answer) => {
                rl.close();
                resolve(answer);
            })
        })
    }

    async repeatTransfer(): Promise<boolean> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return await new Promise((resolve) => {
            rl.question('Do you want to send another file? (N/y) >', (answer) => {
                rl.close();
                resolve(answer === 'y');
            })
        })
    }

    replacePath(path: string) {
        const fileName = path.replace('\\', '/').split('/');
        return fileName[fileName.length - 1]
    }
}
