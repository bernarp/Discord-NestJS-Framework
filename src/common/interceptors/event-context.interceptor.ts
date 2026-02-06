import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from '@/common/_request-context/services/RequestContext.service.js';

/**
 * Interceptor that restores the RequestContext from an incoming event.
 * Extracts the correlationId from the event payload and sets up the AsyncLocalStorage.
 */
@Injectable()
export class EventContextInterceptor implements NestInterceptor {
    constructor(private readonly _requestContext: RequestContextService) { }

    /**
     * Extracts correlationId and wraps the handler execution in RequestContext.run().
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // In the context of NestJS events, the data is the event object itself
        const event = context.switchToRpc().getData();

        if (event && event.correlationId) {
            return new Observable((subscriber) => {
                // Restore the context for the entire event processing chain
                this._requestContext.run({ correlationId: event.correlationId }, () => {
                    next.handle().subscribe(subscriber);
                });
            });
        }

        return next.handle();
    }
}
