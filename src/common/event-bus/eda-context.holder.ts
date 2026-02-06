import {EventBusService} from './event-bus.service.js';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';

/**
 * Singleton-like holder to bridge the gap between NestJS DI and TypeScript Decorators.
 * Decorators cannot use DI, so we provide a static entry point for infrastructure services.
 */
export class EDAContext {
    private static _eventBus: EventBusService;
    private static _requestContext: RequestContextService;

    public static setEventBus(service: EventBusService): void {
        this._eventBus = service;
    }

    public static getEventBus(): EventBusService {
        if (!this._eventBus) {
            throw new Error('[EDAContext] EventBusService not initialized in EDAContext');
        }
        return this._eventBus;
    }

    public static setRequestContext(service: RequestContextService): void {
        this._requestContext = service;
    }

    public static getRequestContext(): RequestContextService {
        if (!this._requestContext) {
            throw new Error('[EDAContext] RequestContextService not initialized in EDAContext');
        }
        return this._requestContext;
    }
}
