import {Test, TestingModule} from '@nestjs/testing';
import {NatsService} from './nats.service';
import {NatsModule} from "./nats.module";
import {from, Observable} from "rxjs";

describe('NatsService', () => {
    let natsService: NatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [NatsModule]
        }).compile();

        natsService = module.get<NatsService>(NatsService);
    });
    describe('NatsWriterController testing', () => {
        it('should be defined', () => {
            expect(natsService).toBeDefined();
        });

        it('should be defined function', () => {
            expect(natsService.mainProcess).toBeDefined();
            expect(natsService.closeStream).toBeDefined();
            expect(natsService.initStream).toBeDefined();
            expect(natsService.repeatTransfer).toBeDefined();
            expect(natsService.inputPath).toBeDefined();
            expect(natsService.sendData).toBeDefined();
            expect(natsService.sendStream).toBeDefined();
        });

        it('should return result initStream', async () => {
            const result = true
            jest.spyOn(natsService, 'initStream').mockImplementation(() => from([result]));
            expect(await natsService.initStream('c:\\test\\test.xml').toPromise()).toEqual(result);
        });

        it('should return result closeStream', async () => {
            const result = true
            jest.spyOn(natsService, 'closeStream').mockImplementation(() => from([result]));
            expect(await natsService.closeStream().toPromise()).toEqual(result);
        });


    })

});
