import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { discordConfig } from '@common/config-env/index.js';
import { ClientModule } from './client/client.module.js';
import { LoggerModule } from './common/_logger/Logger.module.js';
import { RequestContextModule } from './common/_request-context/request-context.module.js';
import { EventBusModule } from './common/event-bus/event-bus.module.js';
import { TemplateModule } from './modules/template/template.module.js';

/**
 * Root Application Module.
 * Orchestrates global configurations and feature modules.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [discordConfig],
            envFilePath: '.env'
        }),
        ClientModule,
        LoggerModule,
        RequestContextModule,
        EventBusModule,
        TemplateModule
    ],

    controllers: [],
    providers: []
})
export class AppModule { }
