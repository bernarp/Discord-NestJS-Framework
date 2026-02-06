import {Module, Global} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {CustomLogger} from './services/CustomLogger.js';
import {LogContextResolver} from './services/LogContextResolver.js';
import {LogFormatter} from './services/LogFormatter.js';
import {FileWriter} from './services/FileWriter.js';
import {LOG} from './constants/LoggerConfig.js';
import {Logger} from '@nestjs/common';
import {RequestContextModule} from '../_request-context/request-context.module.js';

@Global()
@Module({
    imports: [RequestContextModule],
    providers: [
        {
            provide: LOG.STARTUP_TIMESTAMP,
            useValue: new Date()
        },
        LogContextResolver,
        {provide: LOG.CONTEXT_RESOLVER, useClass: LogContextResolver},
        LogFormatter,
        {provide: LOG.LOG_FORMATTER, useClass: LogFormatter},
        FileWriter,
        {provide: LOG.FILE_WRITER, useClass: FileWriter},
        CustomLogger,
        {provide: LOG.LOGGER, useClass: CustomLogger},
        {provide: Logger, useExisting: LOG.LOGGER}
    ],
    exports: [Logger, LOG.LOGGER, LOG.FILE_WRITER]
})
export class LoggerModule {}
