/**
 * @interface IConfigGenerator
 * @description Interface for generating configuration-related files (types, skeletons).
 */
export interface IConfigGenerator {
    /**
     * Generates TypeScript type definitions based on registered schemas.
     * @returns {Promise<void>}
     */
    generateTypes(): Promise<void>;

    /**
     * Generates YAML skeleton files for registered modules.
     * @returns {Promise<void>}
     */
    generateSkeletons(): Promise<void>;
}
