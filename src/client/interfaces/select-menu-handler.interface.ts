import {AnySelectMenuInteraction} from 'discord.js';
import {IBaseHandler} from './base-handler.interface.js';

/**
 * Interface for select menu interaction handlers.
 */
export interface ISelectMenuHandler extends IBaseHandler<AnySelectMenuInteraction> {}
