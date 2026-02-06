import {ButtonInteraction} from 'discord.js';
import {IBaseHandler} from './base-handler.interface.js';

/**
 * Interface for button interaction handlers.
 */
export interface IButtonHandler extends IBaseHandler<ButtonInteraction> {}
