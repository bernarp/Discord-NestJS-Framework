/**
 * Base class for all events in the system.
 * Ensures that every event has a timestamp and can carry a correlationId for tracing.
 */
export abstract class BaseEvent<T = any> {
    /**
     * Timestamp when the event was created.
     */
    public readonly timestamp: number;

    /**
     * Correlation ID for distributed tracing.
     * Usually populated automatically by the EventBusService.
     */
    public correlationId?: string;

    /**
     * The actual data/payload of the event.
     */
    public readonly payload: T;

    constructor(payload: T) {
        this.timestamp = Date.now();
        this.payload = payload;
    }
}
