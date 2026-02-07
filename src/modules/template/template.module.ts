import {Module} from '@nestjs/common';
import {PingCommand} from './commands/ping.command.js';
import {ReadyListener} from './listeners/ready.listener.js';

/**
 * Template module demonstrating how to organize commands and providers.
 * Any class decorated with @CommandSlash or @On/@Once must be listed in 'providers' to be discovered.
 */
@Module({
    providers: [PingCommand, ReadyListener],
    exports: [PingCommand, ReadyListener]
})
export class ListenersModule {}
