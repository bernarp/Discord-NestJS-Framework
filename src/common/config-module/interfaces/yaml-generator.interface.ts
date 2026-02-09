/**
 * @interface IYamlGenerator
 * @description Interface for generating YAML skeletons from Zod schemas.
 */
export interface IYamlGenerator {
    /**
     * Generates a YAML skeleton string for a given schema.
     * @param schema - The Zod schema to process.
     * @returns Generated YAML string.
     */
    generate(schema: any): string;
}
