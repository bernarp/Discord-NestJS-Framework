import { Module } from '@nestjs/common';
import { PingCommand } from './commands/ping.command.js';

/**
 * Template module demonstrating how to organize commands and providers.
 * Any class decorated with @CommandSlash must be listed in 'providers' to be discovered.
 */
@Module({
    providers: [
        PingCommand
    ],
    exports: [
        PingCommand
    ]
})
export class TemplateModule { }
