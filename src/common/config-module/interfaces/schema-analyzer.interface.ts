/**
 * @interface ISchemaAnalyzer
 * @description Interface for Zod schema analysis and unwrapping logic.
 */
export interface ISchemaAnalyzer {
    /**
     * Recursively unwraps Zod schema wrappers to reach the underlying core type.
     * @param schema - The Zod schema to unwrap.
     * @returns The underlying core Zod schema.
     */
    unwrap(schema: any): any;

    /**
     * Determines if a schema represents a Zod object.
     * @param schema - The schema to check.
     * @returns True if it's an object.
     */
    isObject(schema: any): boolean;
}
