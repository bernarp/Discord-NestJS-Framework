import {Injectable} from '@nestjs/common';
import {AsyncLocalStorage} from 'async_hooks';

interface IRequestContext {
    correlationId: string;
}

@Injectable()
export class RequestContextService {
    private readonly als = new AsyncLocalStorage<IRequestContext>();
    run<T>(callback: () => T, context: IRequestContext): T {
        return this.als.run(context, callback);
    }
    getCorrelationId(): string | undefined {
        return this.als.getStore()?.correlationId;
    }
}
