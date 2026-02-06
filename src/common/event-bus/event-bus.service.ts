import {Injectable, Inject} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {BaseEvent} from './base.event.js';
import {ModuleRegistryService} from './module-registry.service.js';
import {EDAContext} from './eda-context.holder.js';
import {randomUUID} from 'crypto';

/**
 * Enhanced EventBus service that automatically handles Correlation ID propagation.
 * Acts as a wrapper around EventEmitter2.
 */
@Injectable()
export class EventBusService {
    constructor(
        private readonly _eventEmitter: EventEmitter2,
        private readonly _requestContext: RequestContextService,
        private readonly _registry: ModuleRegistryService,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {
        // Essential: Populate the static holder for Decorators (@Emits, @Subscribe)
        EDAContext.setEventBus(this);
        EDAContext.setRequestContext(this._requestContext);
    }

    /**
     * Emits an event into the system bus.
     * Automatically attaches the current Correlation ID from the RequestContext if not present.
     *
     * @param eventName - The unique identifier of the event.
     * @param event - The event instance containing payload and metadata.
     */
    public async emit(eventName: string, event: BaseEvent): Promise<void> {
        this._registry.checkAvailability(eventName);

        if (!event.correlationId) {
            event.correlationId = this._requestContext.getCorrelationId() ?? randomUUID();
        }

        const listenersCount = this._eventEmitter.listeners(eventName).length;
        this._logger.debug(`[Event] Emitting ${eventName} | CID: ${event.correlationId} | Listeners: ${listenersCount}`);

        await this._eventEmitter.emitAsync(eventName, event);
    }
}
