import {Injectable, Inject} from '@nestjs/common';
import {Subscribe} from '@/common/decorators/subscribe.decorator.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {BaseEvent} from '@/common/event-bus/base.event.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Service for Module A.
 * Orchestrates the final stage of the event flow.
 */
@Injectable()
export class TestEvents1Service {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {
        this._logger.log('[Module A] TestEvents1Service initialized', 'TestEvents1Service');
    }

    /**
     * Handles the response from Module B.
     * Demonstrates that the Correlation ID has been preserved through the entire round-trip.
     */
    @Subscribe(Events.TEST_RESPONSE)
    public onModuleBResponse(event: BaseEvent<any>): void {
        this._logger.log(`[Module A] Received response from Module B. Context: ${JSON.stringify(event.payload)}`, 'TestEvents1Service');

        this._logger.log(`[Module A] Flow Completed! Correlation ID: ${event.correlationId}`, 'TestEvents1Service');
    }
}
