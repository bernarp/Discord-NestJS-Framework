import {Injectable, Inject} from '@nestjs/common';
import {ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';
import {ICommandHandler} from '../interfaces/command-handler.interface.js';
import {ICommand} from '../interfaces/command.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {ParamsResolverService} from './params-resolver.service.js';

/**
 * Specialized handler for processing all slash command interactions.
 */
@Injectable()
export class CommandInteractionHandler implements ICommandHandler {
    private readonly _commands = new Map<string, ICommand>();

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
                const args = this._paramsResolver.resolveArguments(command, 'execute', interaction);
                await command.execute(...args);
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
            const args = this._paramsResolver.resolveArguments(command, 'autocomplete', interaction);
            await command.autocomplete(...args);
        }
    }

    /**
     * Registers a specific command implementation.
     * @param command The command to register.
     */
    public registerCommand(command: ICommand): void {
        this._commands.set(command.name, command);
        this._logger.debug(`Registered entity command: ${command.name}`);
    }
}
