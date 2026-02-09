import {NestFactory} from '@nestjs/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import {zodToTs, printNode, createAuxiliaryTypeStore} from 'zod-to-ts';
import {AppModule} from '../../../app.module.js';
import {ConfigService} from '../services/config.service.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import {CONFIG_DEFAULT_PATHS, ConfigContext} from '../constants/config.constants.js';
import {ICONFIG_SERVICE_TOKEN} from '../config.token.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import type {IConfigService} from '../interfaces/config-service.interface.js';

/**
 * CLI tool for configuration validation and TypeScript type generation.
 * This script initializes the NestJS application context to discover all @Config
 * decorated modules and verify their data against Zod schemas.
 */
async function bootstrap(): Promise<void> {
    process.env.APP_CLI_MODE = 'true';
    console.log('[Config Tool] Starting validation and type generation...');

    try {
        const app = await NestFactory.createApplicationContext(AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose']
        });
        await app.init();
        const configService = app.get<IConfigService>(ICONFIG_SERVICE_TOKEN);
        const logger = app.get<ILogger>(LOG.LOGGER);

        logger.log('All configurations validated successfully.', ConfigContext.CLI);
        await generateTypeScriptDefinitions(configService as any, logger);

        await app.close();
        console.log('[Config Tool] Execution completed successfully.');
        process.exit(0);
    } catch (error: any) {
        console.error('\n[Config Tool] CRITICAL ERROR');
        console.error(error.message);
        process.exit(1);
    }
}

/**
 * Extracts configuration metadata and generates a .ts file with inferred types and ConfigKey map.
 * @param configService - The service containing registered metadata.
 * @param logger - Logger instance for status reporting.
 */
async function generateTypeScriptDefinitions(configService: ConfigService, logger: ILogger): Promise<void> {
    const registry = (configService as any)._metadataRegistry;
    if (!registry || registry.size === 0) {
        logger.warn('No configuration modules found for type generation.', ConfigContext.CLI);
        return;
    }

    let fileContent = `/**\n * ⚠️ AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n * This file contains types inferred from Zod schemas and the ConfigKey mapping.\n */\n\n`;

    const keys: string[] = [];
    const configTree: any = {};

    for (const [key, metadata] of registry.entries()) {
        keys.push(key);
        buildTree(configTree, key);

        const {schema} = metadata;
        const typeName = formatTypeName(key);
        try {
            const {node} = zodToTs(
                schema as any,
                {
                    auxiliaryTypeStore: createAuxiliaryTypeStore()
                } as any
            );
            const typeDefinition = printNode(node);
            fileContent += `export type ${typeName} = ${typeDefinition};\n\n`;
        } catch (err) {
            fileContent += `export type ${typeName} = any; // Type inference failed\n\n`;
        }
    }
    fileContent += `export type AppConfigKey = ${keys.map(k => `'${k}'`).join(' | ')};\n\n`;
    fileContent += `export const ConfigKey = ${JSON.stringify(configTree, null, 4).replace(/"([^"]+)":/g, '$1:')} as const;\n`;
    const outputPath = path.join(process.cwd(), CONFIG_DEFAULT_PATHS.GENERATED_TYPES);
    await fs.writeFile(outputPath, fileContent);
    logger.log(`Type definitions and mapping generated at: ${outputPath}`, ConfigContext.CLI);
}

/**
 * Builds a nested tree structure from a dot-notated or kebab-case string.
 * Each segment is converted to PascalCase as it's added to the tree.
 */
function buildTree(tree: any, fullKey: string) {
    const segments = fullKey.split('.');
    let current = tree;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) continue;
        const pascalName = toPascalCase(segment);

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

/**
 * Converts string to PascalCase (handles both kebab-case and plain strings).
 */
function toPascalCase(str: string): string {
    return str
        .split(/[-_]/)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join('');
}

/**
 * Converts a key into a PascalCase type name suffixing 'Config'.
 * @param key - The configuration key.
 */
function formatTypeName(key: string): string {
    return toPascalCase(key.replace(/\./g, '-')) + 'Config';
}

bootstrap();
