import {Injectable, OnModuleInit, Logger, Inject, UseInterceptors} from '@nestjs/common';
import {DiscoveryService, Reflector} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {REST, Routes} from 'discord.js';
import {COMMAND_METADATA} from '@common/decorators/keys.js';
import {CommandOptions} from '@common/decorators/command.schema.js';
import {CommandRegistrationType} from '@client/enums/command-registration-type.enum.js';
import type {ICommand} from '@client/interfaces/command.interface.js';
import {ICOMMAND_HANDLER_TOKEN} from '@client/client.token.js';
import type {ICommandHandler} from '@client/interfaces/command-handler.interface.js';
import {LoggingInterceptor} from '@common/interceptors/logging.interceptor.js';
import {LogMethod, LogLevel} from '@common/decorators/log-method.decorator.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Service responsible for discovering and registering slash commands with Discord API.
 *
 * It scans all providers for the @CommandSlash decorator, differentiates between
 * Guild and Global registration, and uploads the configuration to Discord.
 * It also registers command instances in the CommandInteractionHandler for routing.
 */
@Injectable()
@UseInterceptors(LoggingInterceptor)
export class SlashCommandRegistrationService implements OnModuleInit {
    constructor(
        private readonly _discoveryService: DiscoveryService,
        private readonly _reflector: Reflector,
        private readonly _configService: ConfigService,
        @Inject(ICOMMAND_HANDLER_TOKEN) private readonly _commandHandler: ICommandHandler,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * NestJS Lifecycle Hook: Triggered after all modules are initialized.
     */
    public async onModuleInit(): Promise<void> {
        await this.registerCommands();
    }

    /**
     * Scans for @CommandSlash metadata and processes registration.
     */
    @LogMethod({
        description: 'Discover and register commands locally',
        level: LogLevel.DEBUG,
        logInput: false
    })
    private async registerCommands(): Promise<void> {
        const providers = this._discoveryService.getProviders();
        const guildCommands: any[] = [];
        const globalCommands: any[] = [];

        providers.forEach(wrapper => {
            const {instance} = wrapper;
            if (!instance || !instance.constructor) return;
            const metadata = this._reflector.get<CommandOptions>(COMMAND_METADATA, instance.constructor);
            if (!metadata) return;
            this._commandHandler.registerCommand(instance as unknown as ICommand);
            const commandData = {
                name: metadata.name,
                description: metadata.description,
                options: metadata.options || [],
                default_member_permissions: metadata.defaultMemberPermissions?.toString(),
                dm_permission: metadata.dmPermission
            };

            if (metadata.registration === CommandRegistrationType.GUILD) {
                guildCommands.push(commandData);
            } else {
                globalCommands.push(commandData);
            }
        });

        if (guildCommands.length > 0 || globalCommands.length > 0) {
            await this._uploadToDiscord(guildCommands, globalCommands);
        }
    }

    /**
     * Uploads the collected command configurations to Discord via REST API.
     * @param guildCommands List of commands for Guild registration.
     * @param globalCommands List of commands for Global registration.
     */
    @LogMethod({
        description: 'Upload commands to Discord API',
        level: LogLevel.DEBUG,
        logInput: true,
        logResult: true
    })
    private async _uploadToDiscord(guildCommands: any[], globalCommands: any[]): Promise<void> {
        const token = this._configService.get<string>('DISCORD_TOKEN');
        const clientId = this._configService.get<string>('CLIENT_ID');
        const guildId = this._configService.get<string>('GUILD_ID');

        if (!token || !clientId) {
            this._logger.error('Registration failed: DISCORD_TOKEN or CLIENT_ID is missing');
            return;
        }

        const rest = new REST({version: '10'}).setToken(token);

        try {
            if (globalCommands.length > 0) {
                this._logger.log(`Registering ${globalCommands.length} global commands...`);
                await rest.put(Routes.applicationCommands(clientId), {body: globalCommands});
                this._logger.log('Successfully registered global commands.');
            }

            if (guildCommands.length > 0) {
                if (!guildId) {
                    this._logger.warn('DISCORD_DEV_GUILD_ID is missing, skipping guild commands registration');
                    return;
                }
                this._logger.log(`Registering ${guildCommands.length} guild commands to guild ${guildId}...`);
                await rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: guildCommands});
                this._logger.log('Successfully registered guild commands.');
            }
        } catch (error) {
            const err = error as Error;
            this._logger.error(`Discord API Registration Error: ${err.message}`, err.stack);
        }
    }
}
