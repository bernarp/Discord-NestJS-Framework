import {Injectable, Logger} from '@nestjs/common';
import {ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';
import {ICommandHandler} from '../interfaces/command-handler.interface.js';
import {ICommand} from '../interfaces/command.interface.js';

/**
 * Specialized handler for processing all slash command interactions.
 */
@Injectable()
export class CommandInteractionHandler implements ICommandHandler {
    private readonly logger = new Logger(CommandInteractionHandler.name);
    private readonly commands = new Map<string, ICommand>();

    /**
     * Executes the appropriate command based on the interaction's command name.
     * @param interaction The chat input command interaction.
     */
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = this.commands.get(interaction.commandName);

        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this.logger.error(`Error executing command ${interaction.commandName}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this.logger.warn(`Received unknown command: ${interaction.commandName}`);
        }
    }

    /**
     * Handles autocomplete interactions by delegating to the specific command.
     * @param interaction The autocomplete interaction.
     */
    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const command = this.commands.get(interaction.commandName);
        if (command && command.autocomplete) {
            await command.autocomplete(interaction);
        }
    }

    /**
     * Registers a specific command implementation.
     * @param command The command to register.
     */
    public registerCommand(command: ICommand): void {
        this.commands.set(command.name, command);
        this.logger.debug(`Registered entity command: ${command.name}`);
    }
}
