import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service.js';
import { ModuleRegistryService } from './module-registry.service.js';
import { EventContextInterceptor } from '../interceptors/event-context.interceptor.js';

/**
 * Global module providing Event Bus infrastructure.
 * Handles event distribution and automatic Correlation ID propagation.
 */
@Global()
@Module({
    imports: [
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 20,
            verboseMemoryLeak: true,
            ignoreErrors: false
        })
    ],
    providers: [EventBusService, ModuleRegistryService, EventContextInterceptor],
    exports: [EventBusService, ModuleRegistryService]
})
export class EventBusModule { }
