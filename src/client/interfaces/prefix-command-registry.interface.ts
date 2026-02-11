import {IResolvedPrefixCommand} from './resolved-prefix-command.interface.js';

/**
 * Interface for the Prefix Command Registry.
 * Handles storage and retrieval of prefix command definitions.
 */
export interface IPrefixCommandRegistry {
    /**
     * Registers a resolved command in the registry.
     */
    register(command: IResolvedPrefixCommand): void;

    /**
     * Finds a command by its name or alias.
     */
    getCommand(trigger: string): IResolvedPrefixCommand | undefined;

    /**
     * Returns all registered commands (unique instances).
     */
    getAllCommands(): IResolvedPrefixCommand[];
}
