import {Injectable} from '@nestjs/common';
import {zodToTs, printNode, createAuxiliaryTypeStore} from 'zod-to-ts';
import {StringUtils} from '../utils/string-utils.js';
import {ConfigCliConstants} from '../constants/config.constants.js';
import type {IConfigMetadata} from '../interfaces/config-options.interface.js';
import {ITypeScriptGenerator} from '../interfaces/typescript-generator.interface.js';

/**
 * @class TypeScriptGenerator
 * @description Service for generating TypeScript type definitions and key trees.
 */
@Injectable()
export class TypeScriptGenerator implements ITypeScriptGenerator {
    /**
     * Generates TypeScript content string from registered modules.
     * @param registry - Map of registered configuration metadata.
     * @returns Generated TypeScript file content.
     */
    public generateContent(registry: Map<string, IConfigMetadata>): string {
        let fileContent: string = ConfigCliConstants.GENERATED_HEADER;
        const keys: string[] = [];
        const configTree: any = {};

        for (const [key, metadata] of registry.entries()) {
            keys.push(key);
            this._buildTree(configTree, key);

            const typeName = StringUtils.formatTypeName(key);
            try {
                const {node} = zodToTs(
                    metadata.schema as any,
                    {
                        auxiliaryTypeStore: createAuxiliaryTypeStore()
                    } as any
                );
                fileContent += `export type ${typeName} = ${printNode(node)};\n\n`;
            } catch {
                fileContent += `export type ${typeName} = ${ConfigCliConstants.TYPE_FAIL_COMMENT}\n\n`;
            }
        }

        fileContent += `export type AppConfigKey = ${keys.map(k => `'${k}'`).join(' | ')};\n\n`;
        fileContent += `export const ConfigKey = ${JSON.stringify(configTree, null, 4).replace(/"([^"]+)":/g, '$1:')} as const;\n`;

        return fileContent;
    }

    /**
     * Builds a nested tree structure from a dot-notated or kebab-case string.
     * @private
     */
    private _buildTree(tree: any, fullKey: string): void {
        const segments = fullKey.split('.');
        let current = tree;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (!segment) continue;
            const pascalName = StringUtils.toPascalCase(segment);

            if (i === segments.length - 1) {
                if (current[pascalName] && typeof current[pascalName] === 'object') {
                    throw new Error(`Config Path Collision: [${fullKey}] conflicts with an existing parent node.`);
                }
                current[pascalName] = fullKey;
            } else {
                if (!current[pascalName]) {
                    current[pascalName] = {};
                } else if (typeof current[pascalName] === 'string') {
                    throw new Error(`Config Path Collision: [${fullKey}] conflicts with an existing leaf node.`);
                }
                current = current[pascalName];
            }
        }
    }
}
