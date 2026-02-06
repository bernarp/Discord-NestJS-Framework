import { applyDecorators, UseInterceptors, SetMetadata } from '@nestjs/common';
import { EventEmitInterceptor } from '@common/interceptors/event-emit.interceptor.js';

/**
 * Metadata key for the Emits decorator.
 */
export const EMITS_EVENT_KEY = 'EMITS_EVENT_KEY';

/**
 * Decorator that automatically emits the return value of a method as a system event.
 * Uses EventEmitInterceptor to wrap the result and propagate the Correlation ID.
 *
 * @param eventName - The name of the event to emit.
 *
 * @example
 * @Emits('user.created')
 * async createUser(dto: any) { ... }
 */
export function Emits(eventName: string) {
    return applyDecorators(
        SetMetadata(EMITS_EVENT_KEY, eventName),
        UseInterceptors(EventEmitInterceptor),
    );
}
