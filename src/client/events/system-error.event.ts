import {BaseEvent} from '@/common/event-bus/base.event.js';
import {DiscordErrorContext} from '../enums/discord-error-context.enum.js';

/**
 * Event emitted when a system-level error or diagnostic occurs.
 *
 * This payload is sent through the EventBus when the Discord client
 * encounters gateway errors, REST rate limits, or internal failures.
 *
 * @class SystemErrorEvent
 * @extends BaseEvent<Error | any>
 */
export class SystemErrorEvent extends BaseEvent<Error | any> {
    /**
     * @param error - The raw error object or diagnostic data.
     * @param context - The technical origin of the error.
     */
    constructor(
        public readonly error: Error | any,
        public readonly context: DiscordErrorContext
    ) {
        super(error);
    }
}
