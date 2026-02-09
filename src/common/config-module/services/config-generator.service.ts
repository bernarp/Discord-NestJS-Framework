import {Injectable, Inject} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import {ICONFIG_SERVICE_TOKEN, ITYPESCRIPT_GENERATOR_TOKEN, IYAML_GENERATOR_TOKEN} from '../config.token.js';
import type {IConfigService} from '../interfaces/config-service.interface.js';
import type {IConfigGenerator} from '../interfaces/config-generator.interface.js';
import {CONFIG_DEFAULT_PATHS, ConfigCliConstants} from '../constants/config.constants.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import type {ITypeScriptGenerator} from '../interfaces/typescript-generator.interface.js';
import type {IYamlGenerator} from '../interfaces/yaml-generator.interface.js';

/**
 * @class ConfigGeneratorService
 * @description Orchestrator for configuration asset generation.
 * Coordinates TypeScript type generation and YAML skeleton creation.
 */
@Injectable()
export class ConfigGeneratorService implements IConfigGenerator {
    constructor(
        @Inject(ICONFIG_SERVICE_TOKEN) private readonly _configService: IConfigService,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger,
        @Inject(ITYPESCRIPT_GENERATOR_TOKEN) private readonly _tsGenerator: ITypeScriptGenerator,
        @Inject(IYAML_GENERATOR_TOKEN) private readonly _yamlGenerator: IYamlGenerator
    ) {}

    /**
     * Generates TypeScript type definitions based on registered schemas.
     */
    public async generateTypes(): Promise<void> {
        const registry = this._configService.getRegistry();
        if (!registry || registry.size === 0) {
            return;
        }
        const fileContent = this._tsGenerator.generateContent(registry);
        const outputPath = path.join(process.cwd(), CONFIG_DEFAULT_PATHS.GENERATED_TYPES);
        await fs.writeFile(outputPath, fileContent);
        console.log(`${ConfigCliConstants.TOOL_NAME} Type definitions generated at: ${outputPath}`);
    }

    /**
     * Generates YAML skeleton files for registered modules.
     */
    public async generateSkeletons(): Promise<void> {
        const registry = this._configService.getRegistry();
        const baseDir = path.join(process.cwd(), CONFIG_DEFAULT_PATHS.DEFAULTS);

        try {
            await fs.mkdir(baseDir, {recursive: true});
        } catch {}

        for (const [key, metadata] of registry.entries()) {
            const filePath = path.join(baseDir, `${key}.yaml`);

            try {
                await fs.access(filePath);
                console.log(`${ConfigCliConstants.TOOL_NAME} Config file [${key}.yaml] already exists. Skipping.`);
                continue;
            } catch {}
            console.log(`${ConfigCliConstants.TOOL_NAME} Generating skeleton for: ${key}`);
            const yamlContent = this._yamlGenerator.generate(metadata.schema);
            const header = `# Auto-generated skeleton for [${key}]\n# Fill in the values to define module defaults.\n\n`;

            await fs.writeFile(filePath, header + yamlContent);
            console.log(`${ConfigCliConstants.TOOL_NAME} Generated default skeleton: ${filePath}`);
        }
    }
}
