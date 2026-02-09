import type {IConfigMetadata} from './config-options.interface.js';

/**
 * @interface ITypeScriptGenerator
 * @description Interface for generating TypeScript type definitions and key trees.
 */
export interface ITypeScriptGenerator {
    /**
     * Generates TypeScript content string from registered modules.
     * @param registry - Map of registered configuration metadata.
     * @returns Generated TypeScript file content.
     */
    generateContent(registry: Map<string, IConfigMetadata>): string;
}
