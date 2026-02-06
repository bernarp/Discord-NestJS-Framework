import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Interface representing the structure of the Request Context.
 */
export interface IRequestContext {
    /**
     * Unique identifier for tracing the request across services and events.
     */
    correlationId: string;
}

/**
 * Service for managing asynchronous context (AsyncLocalStorage).
 * Allows propagation of Correlation IDs through the call chain.
 */
@Injectable()
export class RequestContextService {
    private readonly _als = new AsyncLocalStorage<IRequestContext>();

    /**
     * Runs a function within a specific context.
     * @param context - The context to set.
     * @param callback - The function to execute.
     */
    public run<T>(context: IRequestContext, callback: () => T): T {
        return this._als.run(context, callback);
    }

    /**
     * Retrieves the Correlation ID from the current context.
     * @returns The Correlation ID or undefined if no context is found.
     */
    public getCorrelationId(): string | undefined {
        return this._als.getStore()?.correlationId;
    }

    /**
     * Sets a specific property in the current context.
     * Note: This only works if a context is already running.
     * @param key - The property key.
     * @param value - The property value.
     */
    public set<K extends keyof IRequestContext>(key: K, value: IRequestContext[K]): void {
        const store = this._als.getStore();
        if (store) {
            store[key] = value;
        }
    }
}
