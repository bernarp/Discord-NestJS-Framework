import {Interaction} from 'discord.js';
import {ICommandHandler} from './command-handler.interface.js';
import {IButtonHandler} from './button-handler.interface.js';
import {ISelectMenuHandler} from './select-menu-handler.interface.js';
import {IModalHandler} from './modal-handler.interface.js';

/**
 * Interface for the interactions manager responsible for routing events.
 */
export interface IInteractionsManager {
    /**
     * Handles an incoming Discord interaction.
     * @param interaction The interaction received from Discord.
     */
    handleInteraction(interaction: Interaction): Promise<void>;

    /**
     * Registers the slash command handler.
     * @param handler The command handler implementation.
     */
    setCommandHandler(handler: ICommandHandler): void;

    /**
     * Registers the button handler.
     * @param handler The button handler implementation.
     */
    setButtonHandler(handler: IButtonHandler): void;

    /**
     * Registers the select menu handler.
     * @param handler The select menu handler implementation.
     */
    setSelectMenuHandler(handler: ISelectMenuHandler): void;

    /**
     * Registers the modal handler.
     * @param handler The modal handler implementation.
     */
    setModalHandler(handler: IModalHandler): void;
}
