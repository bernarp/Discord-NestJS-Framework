import { Global, Module } from '@nestjs/common';
import { UptimeProvider } from './services/UptimeProvider.js';
import { SystemInfoProvider } from './services/SystemInfoProvider.js';
import { IUPTIME_PROVIDER_TOKEN, ISYSTEM_INFO_PROVIDER_TOKEN } from './utils.token.js';

/**
 * Global module providing utility services across the application.
 */
@Global()
@Module({
    providers: [
        {
            provide: IUPTIME_PROVIDER_TOKEN,
            useClass: UptimeProvider
        },
        {
            provide: ISYSTEM_INFO_PROVIDER_TOKEN,
            useClass: SystemInfoProvider
        }
    ],
    exports: [IUPTIME_PROVIDER_TOKEN, ISYSTEM_INFO_PROVIDER_TOKEN]
})
export class UtilsModule { }
