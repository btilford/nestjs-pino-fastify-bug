import { Controller, Get } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino/dist';
import { captured } from './app.module';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(
    @InjectPinoLogger(AppController.name) private readonly logger: PinoLogger,
    private readonly appService: AppService,
  ) {}


  private expectedAccessLogs = 0;
  private expectedRequestId = 0;


  @Get()
  getHello(): string {
    ++this.expectedAccessLogs;
    this.expectedRequestId += 2;
    this.logger.info('controller method getHello');

    setTimeout(() => {
      const output = captured.output;
      const accessLogs = output.filter(_ => _.msg === 'request completed');
      const withRequestId = output.filter(_ => _.req?.id);
      console.assert(
        withRequestId.length === this.expectedRequestId,
        `Expected ${this.expectedRequestId} logs with request id but found ${withRequestId.length}`,
      );
      console.assert(
        accessLogs.length === this.expectedAccessLogs,
        `Expected ${this.expectedAccessLogs} access logs but found ${accessLogs.length}`,
      );
    }, 100);

    return this.appService.getHello();
  }


  @Get('/ping')
  ping(): string {
    // This message should still have request ID even though the access log is excluded.
    this.logger.info('/ping is excluded from access logs but should still have a request id');
    ++this.expectedRequestId;

    setTimeout(() => {
      const output = captured.output;
      const accessLogs = output.filter(_ => _.msg === 'request completed');
      const withRequestId = output.filter(_ => _.req?.id);
      console.assert(
        withRequestId.length === this.expectedRequestId,
        `Expected ${this.expectedRequestId} logs with request id but found ${withRequestId.length}`,
      );
      console.assert(
        accessLogs.length === this.expectedAccessLogs,
        `Expected ${this.expectedAccessLogs} access logs but found ${accessLogs.length}`,
      );
    }, 100);

    return 'pong';
  }
}
