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


  @Get()
  getHello(): string {
    this.logger.info('controller method getHello');

    setTimeout(() => {
      const output = captured.output;
      const accessLogs = output.filter(_ => _.context === 'ACCESS-LOGGER');
      const withRequestId = output.filter(_ => _.req?.id);
      console.assert(withRequestId.length > 0, 'No logs had request id');
      console.assert(accessLogs.length > 0, 'No access logs');
    }, 100);

    return this.appService.getHello();
  }


  @Get('/ping')
  ping(): string {
    // This message should still have request ID even though the access log is excluded.
    this.logger.info('controller method ping');

    setTimeout(() => {
      const output = captured.output;
      const accessLogs = output.filter(_ => _.context === 'ACCESS-LOGGER');
      const withRequestId = output.filter(_ => _.req?.id);
      console.assert(withRequestId.length > 0, 'No logs had request id');
      console.assert(accessLogs.length > 0, 'No access logs');
    }, 100);

    return 'pong';
  }
}
