import {Module} from '@nestjs/common';
import {PingCommand} from './commands/ping.command.js';
import {TestCommand} from './commands/test.command.js';
import {ReadyListener} from './listeners/ready.listener.js';

/**
 * Template module demonstrating how to organize commands and providers.
 * Any class decorated with @CommandSlash or @On/@Once must be listed in 'providers' to be discovered.
 */
@Module({
    providers: [PingCommand, TestCommand, ReadyListener],
    exports: [PingCommand, TestCommand, ReadyListener]
})
export class ListenersModule {}
