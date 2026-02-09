import {NestFactory} from '@nestjs/core';
import {AppModule} from '../../../app.module.js';
import {ICONFIG_GENERATOR_TOKEN} from '../config.token.js';
import type {IConfigGenerator} from '../interfaces/config-generator.interface.js';
import {ConfigCliConstants} from '../constants/config.constants.js';

/**
 * CLI tool for configuration validation and TypeScript type generation.
 * This script initializes the NestJS application context to delegate
 * generation tasks to the ConfigGeneratorService.
 */
async function bootstrap(): Promise<void> {
    process.env.APP_CLI_MODE = 'true';
    console.log(`${ConfigCliConstants.TOOL_NAME} Starting validation and type generation...`);

    try {
        const app = await NestFactory.createApplicationContext(AppModule, {
            logger: ['error', 'warn']
        });
        await app.init();
        const generator = app.get<IConfigGenerator>(ICONFIG_GENERATOR_TOKEN);
        await generator.generateTypes();
        await generator.generateSkeletons();
        await app.close();
        console.log(`${ConfigCliConstants.TOOL_NAME} Execution completed successfully.`);
        process.exit(0);
    } catch (error: any) {
        console.error(`\n${ConfigCliConstants.TOOL_NAME} CRITICAL ERROR`);
        console.error(error.stack || error.message);
        process.exit(1);
    }
}

bootstrap();
