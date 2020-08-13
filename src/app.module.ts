import { Module, RequestMethod } from '@nestjs/common';
import hyperid from 'hyperid';
import { LoggerModule } from 'nestjs-pino/dist';
import { Writable } from 'stream';
import { AppController } from './app.controller';
import { AppService } from './app.service';


export class CaptureOutput extends Writable {
  protected _output = [];


  get output(): any[]{
    return this._output;
  }


  _write(chunk: any, encoding: string, callback: (error?: (Error | null)) => void): void {
    if (chunk instanceof Buffer) {
      chunk = chunk.toString('utf8');
    }
    this._output.push(JSON.parse(chunk));

    console.log(chunk);
    callback();
  }
}


export const captured = new CaptureOutput();


@Module({
  imports: [
    LoggerModule.forRoot({
      forRoutes: [
        { path: '(.*)', method: RequestMethod.ALL },
      ],
      exclude: [
        { path: '(.*)ping', method: RequestMethod.ALL },
      ],
      pinoHttp: [
        {
          genReqId: req => {
            req.id = (
              req.id
              || req.headers['x-request-id']
              || hyperid({ urlSafe: true }).uuid
            );
            return req.id;

          },
        },
        captured,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {

}
