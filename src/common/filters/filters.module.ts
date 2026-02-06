import {Module} from '@nestjs/common';
import {ExceptionFormatterService} from './services/exception-formatter.service.js';
import {DiscordErrorResponseService} from './services/discord-error-response.service.js';

/**
 * Module providing exception handling infrastructure.
 */
@Module({
    providers: [ExceptionFormatterService, DiscordErrorResponseService],
    exports: [ExceptionFormatterService, DiscordErrorResponseService]
})
export class FiltersModule {}
