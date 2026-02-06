import { OnEvent as NestOnEvent } from '@nestjs/event-emitter';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { EventContextInterceptor } from '@common/interceptors/event-context.interceptor.js';

/**
 * Enhanced replacement for @OnEvent that automatically restores the RequestContext.
 * Ensures that logs inside the event handler include the original Correlation ID.
 *
 * @param eventName - The name of the event to subscribe to.
 */
export function Subscribe(eventName: string) {
    return applyDecorators(
        NestOnEvent(eventName, { async: true }),
        UseInterceptors(EventContextInterceptor),
    );
}
