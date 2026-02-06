import {ModalSubmitInteraction} from 'discord.js';
import {IBaseHandler} from './base-handler.interface.js';

/**
 * Interface for modal submission handlers.
 */
export interface IModalHandler extends IBaseHandler<ModalSubmitInteraction> {}
