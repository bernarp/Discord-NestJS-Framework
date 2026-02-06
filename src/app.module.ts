import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ClientModule} from './client/client.module.js';

import {APP_INTERCEPTOR} from '@nestjs/core';
import {LoggingInterceptor} from './common/interceptors/logging.interceptor.js';

/**
 * Root Application Module.
 * Orchestrates global configurations and feature modules.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        }),
        ClientModule
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor
        }
    ]
})
export class AppModule {}
