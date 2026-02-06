import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service.js';
import { ModuleRegistryService } from './module-registry.service.js';
import { EventEmitInterceptor } from '../interceptors/event-emit.interceptor.js';
import { EventContextInterceptor } from '../interceptors/event-context.interceptor.js';

/**
 * Global module providing Event Bus infrastructure.
 * Handles event distribution and automatic Correlation ID propagation.
 */
@Global()
@Module({
    imports: [
        EventEmitterModule.forRoot({
            // Global configuration for EventEmitter2
            wildcard: true,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 20,
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),
    ],
    providers: [
        EventBusService,
        ModuleRegistryService,
        EventEmitInterceptor,
        EventContextInterceptor,
    ],
    exports: [
        EventBusService,
        ModuleRegistryService,
    ],
})
export class EventBusModule { }
