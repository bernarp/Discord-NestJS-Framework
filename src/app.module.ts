import {Module} from '@nestjs/common';
import {ConfigModule as NestConfigModule} from '@nestjs/config';
import {ConfigModule} from './common/config-module/config.module.js';
import {TestConfigModule} from './test-config.module.js';
import {APP_FILTER} from '@nestjs/core';
import {discordConfig} from '@common/config-env/index.js';
import {ClientModule} from './client/client.module.js';
import {LoggerModule} from './common/_logger/Logger.module.js';
import {RequestContextModule} from './common/_request-context/request-context.module.js';
import {EventBusModule} from './common/event-bus/event-bus.module.js';
import {GlobalExceptionFilter} from './common/filters/global-exception.filter.js';
import {FiltersModule} from './common/filters/filters.module.js';
import {UtilsModule} from './common/utils/utils.module.js';
import {ListenersModule} from './modules/template/template.module.js';
import {TemplateTestEvents1Module} from './modules/template-test-events1/template-test-events1.module.js';
import {TemplateTestEvents2Module} from './modules/template-test-events2/template-test-events2.module.js';
import {UIModule} from './client/ui/ui.module.js';

/**
 * Root Application Module.
 * Orchestrates global configurations and feature modules.
 */
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            load: [discordConfig],
            envFilePath: '.env'
        }),
        ConfigModule.forRoot({
            hotReload: true
        }),
        TestConfigModule,
        ClientModule,
        UIModule,
        LoggerModule,
        RequestContextModule,
        EventBusModule,
        FiltersModule,
        UtilsModule,
        ListenersModule,
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
