/**
 * Converts any object to a single-line JSON string.
 * Safely handles BigInt and circular references.
 */
export function safeJsonStringify(value: any): string {
    const seen = new WeakSet();

    return JSON.stringify(value, (key, val) => {
        if (typeof val === 'bigint') {
            return val.toString();
        }
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) {
                return '[Circular]';
            }
            seen.add(val);
        }
        if (val instanceof Error) {
            return {
                message: val.message,
                stack: val.stack,
                name: val.name
            };
        }

        return val;
    });
}
