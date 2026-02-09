import {BaseEvent} from '../../event-bus/base.event.js';

/**
 * Event payload for configuration updates.
 */
export interface IConfigUpdatedPayload<T = any> {
    /** The unique key of the configuration module. */
    key: string;
    /** The new configuration value. */
    value: T;
    /** The previous configuration value (if needed for diffing). */
    oldValue: T;
}

/**
 * Emitted when a configuration module has been hot-reloaded successfully.
 */
export class ConfigUpdatedEvent<T = any> extends BaseEvent<IConfigUpdatedPayload<T>> {
    constructor(payload: IConfigUpdatedPayload<T>) {
        super(payload);
    }
}
