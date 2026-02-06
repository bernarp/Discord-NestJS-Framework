import {Injectable, Inject} from '@nestjs/common';
import {Subscribe} from '@/common/decorators/subscribe.decorator.js';
import {Emits} from '@/common/decorators/emits.decorator.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {BaseEvent} from '@/common/event-bus/base.event.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Service for Module B.
 * Acts as a middleware/processor in the event flow.
 */
@Injectable()
export class TestEvents2Service {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {
        this._logger.log('[Module B] TestEvents2Service initialized', 'TestEvents2Service');
    }

    /**
     * Listens for Init event from Module A.
     * Processes the data and responds back.
     *
     * @Emits will automatically take the return value and send it to Module A.
     */
    @Subscribe(Events.TEST_INIT)
    @Emits(Events.TEST_RESPONSE)
    public async onModuleAInit(event: BaseEvent<any>): Promise<any> {
        this._logger.log(`[Module B] Received INIT event. Original CID: ${event.correlationId}`, 'TestEvents2Service');
        const responseData = {
            status: 'PROCESSED',
            originalData: event.payload,
            processedBy: 'Module B Service',
            processingTime: Date.now()
        };

        this._logger.log(`[Module B] Processing finished, sending response...`, 'TestEvents2Service');

        return responseData;
    }
}
