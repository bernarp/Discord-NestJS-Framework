import {NestFactory} from '@nestjs/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import {zodToTs, printNode, createAuxiliaryTypeStore} from 'zod-to-ts';
import {AppModule} from '../../../app.module.js';
import {ConfigService} from '../services/config.service.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import {CONFIG_DEFAULT_PATHS, ConfigContext} from '../constants/config.constants.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * CLI tool for configuration validation and TypeScript type generation.
 * This script initializes the NestJS application context to discover all @Config
 * decorated modules and verify their data against Zod schemas.
 */
async function bootstrap(): Promise<void> {
    console.log('[Config Tool] Starting validation and type generation...');

    try {
        const app = await NestFactory.createApplicationContext(AppModule, {
            logger: ['error', 'warn']
        });
        const configService = app.get(ConfigService);
        const logger = app.get<ILogger>(LOG.LOGGER);
        logger.log('All configurations validated successfully.', ConfigContext.CLI);
        await generateTypeScriptDefinitions(configService, logger);
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
 * Extracts configuration metadata and generates a .d.ts file with inferred types.
 * @param configService - The service containing registered metadata.
 * @param logger - Logger instance for status reporting.
 */
async function generateTypeScriptDefinitions(configService: ConfigService, logger: ILogger): Promise<void> {
    const registry = (configService as any)._metadataRegistry;
    if (!registry || registry.size === 0) {
        logger.warn('No configuration modules found for type generation.', ConfigContext.CLI);
        return;
    }
    let fileContent = `/**\n * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n * This file contains types inferred from Zod schemas in @Config decorators.\n */\n\n`;

    for (const [key, metadata] of registry.entries()) {
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
    const outputPath = path.join(process.cwd(), CONFIG_DEFAULT_PATHS.GENERATED_TYPES);
    await fs.writeFile(outputPath, fileContent);
    logger.log(`Type definitions generated at: ${outputPath}`, ConfigContext.CLI);
}

/**
 * Converts a kebab-case key into a PascalCase type name suffixing 'Config'.
 * @param key - The configuration key (e.g., 'auth-service').
 * @returns Formatted name (e.g., 'AuthServiceConfig').
 */
function formatTypeName(key: string): string {
    return (
        key
            .split('-')
            .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join('') + 'Config'
    );
}

bootstrap();
