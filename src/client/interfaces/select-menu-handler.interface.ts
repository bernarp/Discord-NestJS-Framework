import {IBaseHandler} from './base-handler.interface.js';
import {ISelectMenu} from './select-menu.interface.js';

/**
 * Interface for select menu interaction handlers.
 */
export interface ISelectMenuHandler extends IBaseHandler {
    /**
     * Registers a select menu entity within the handler.
     */
    registerSelectMenu(selectMenu: ISelectMenu): void;
}
