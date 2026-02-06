import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {APP_FILTER} from '@nestjs/core';
import {discordConfig} from '@common/config-env/index.js';
import {ClientModule} from './client/client.module.js';
import {LoggerModule} from './common/_logger/Logger.module.js';
import {RequestContextModule} from './common/_request-context/request-context.module.js';
import {EventBusModule} from './common/event-bus/event-bus.module.js';
import {GlobalExceptionFilter} from './common/filters/global-exception.filter.js';
import {FiltersModule} from './common/filters/filters.module.js';
import {TemplateModule} from './modules/template/template.module.js';
import {TemplateTestEvents1Module} from './modules/template-test-events1/template-test-events1.module.js';
import {TemplateTestEvents2Module} from './modules/template-test-events2/template-test-events2.module.js';

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
        FiltersModule,
        TemplateModule,
        TemplateTestEvents1Module,
        TemplateTestEvents2Module
    ],

    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter
        }
    ]
})
export class AppModule {}
