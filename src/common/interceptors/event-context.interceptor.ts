import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import {Observable} from 'rxjs';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {BaseEvent} from '@/common/event-bus/base.event.js';

/**
 * Interceptor that restores the RequestContext from an incoming event.
 * In NestJS EventEmitter, the event payload is the first argument (index 0).
 */
@Injectable()
export class EventContextInterceptor implements NestInterceptor {
    constructor(private readonly _requestContext: RequestContextService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const event = context.getArgByIndex(0);
        if (event && (event as BaseEvent).correlationId) {
            const correlationId = (event as BaseEvent).correlationId!;
            return new Observable(subscriber => {
                this._requestContext.run({correlationId}, () => {
                    next.handle().subscribe(subscriber);
                });
            });
        }

        return next.handle();
    }
}
