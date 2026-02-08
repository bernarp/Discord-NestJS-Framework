import {BaseEvent} from '@/common/event-bus/base.event.js';

/**
 * Event emitted when a shard disconnects from the Discord Gateway.
 *
 * @class ClientDisconnectEvent
 * @extends BaseEvent<{timestamp: number}>
 */
export class ClientDisconnectEvent extends BaseEvent<{timestamp: number}> {
    constructor() {
        super({timestamp: Date.now()});
    }
}
