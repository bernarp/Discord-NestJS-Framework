import 'reflect-metadata';

/**
 * Utility to preserve metadata when wrapping methods in decorators.
 * Ensures that NestJS (EventEmitter, Discovery, etc.) can still see the original metadata.
 */
export function preserveMetadata(originalMethod: any, wrapperMethod: any): void {
    const metadataKeys = Reflect.getOwnMetadataKeys(originalMethod);
    for (const key of metadataKeys) {
        const value = Reflect.getOwnMetadata(key, originalMethod);
        Reflect.defineMetadata(key, value, wrapperMethod);
    }
    Object.defineProperty(wrapperMethod, 'name', {
        value: originalMethod.name,
        configurable: true
    });
}
