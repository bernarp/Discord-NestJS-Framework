import {Injectable, Inject} from '@nestjs/common';
import {ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';
import {ICommandHandler} from '../interfaces/command-handler.interface.js';
import {ICommand} from '../interfaces/command.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {ParamsResolverService} from './params-resolver.service.js';
import {InteractionMethod} from '../enums/interaction-method.enum.js';
import {SUBCOMMAND_METADATA} from '@/common/decorators/keys.js';

/**
 * Specialized handler for processing all slash command interactions.
 */
@Injectable()
export class CommandInteractionHandler implements ICommandHandler {
    private readonly _commands = new Map<string, ICommand>();
    private readonly _subCommandMaps = new Map<string, Map<string, string>>();
    constructor(
        @Inject(LOG.LOGGER) private readonly _logger: ILogger,
        private readonly _paramsResolver: ParamsResolverService
    ) {}

    /**
     * Executes the appropriate command based on the interaction's command name.
     * @param interaction The chat input command interaction.
     */
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = this._commands.get(interaction.commandName);

        if (command) {
            try {
                const subCommandName = interaction.options.getSubcommand(false);
                let methodName: string = InteractionMethod.EXECUTE;
                if (subCommandName) {
                    const commandMap = this._subCommandMaps.get(interaction.commandName);
                    if (commandMap && commandMap.has(subCommandName)) {
                        methodName = commandMap.get(subCommandName)!;
                    }
                }
                const args = this._paramsResolver.resolveArguments(command, methodName, interaction);
                await (command as any)[methodName](...args);
            } catch (error) {
                const err = error as Error;
                this._logger.error(`Error executing command ${interaction.commandName}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this._logger.warn(`Received unknown command: ${interaction.commandName}`);
        }
    }

    /**
     * Handles autocomplete interactions by delegating to the specific command.
     * @param interaction The autocomplete interaction.
     */
    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const command = this._commands.get(interaction.commandName);
        if (command && command.autocomplete) {
            const subCommandName = interaction.options.getSubcommand(false);
            const args = this._paramsResolver.resolveArguments(command, InteractionMethod.AUTOCOMPLETE, interaction);
            await command.autocomplete(...args);
        }
    }

    /**
     * Registers a specific command implementation.
     * @param command The command to register.
     */
    public registerCommand(command: ICommand): void {
        this._commands.set(command.name, command);
        const subCommandMap = new Map<string, string>();
        const prototype = Object.getPrototypeOf(command);
        const propertyNames = Object.getOwnPropertyNames(prototype);
        for (const methodName of propertyNames) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
            if (!descriptor || typeof descriptor.value !== 'function' || methodName === 'constructor') {
                continue;
            }
            const subCommandMeta = Reflect.getMetadata(SUBCOMMAND_METADATA, command.constructor, methodName);
            if (subCommandMeta && subCommandMeta.name) {
                subCommandMap.set(subCommandMeta.name, methodName);
            }
        }
        if (subCommandMap.size > 0) {
            this._subCommandMaps.set(command.name, subCommandMap);
        }
        this._logger.debug(`Registered entity command: ${command.name}${subCommandMap.size > 0 ? ` with ${subCommandMap.size} subcommands` : ''}`);
    }
}
