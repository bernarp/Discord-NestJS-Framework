import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {discordConfig} from '@common/config-env/index.js';
import {ClientModule} from './client/client.module.js';
import {LoggerModule} from './common/_logger/Logger.module.js';
import {TemplateModule} from './modules/template/template.module.js';

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
        TemplateModule
    ],

    controllers: [],
    providers: []
})
export class AppModule {}
