import {IBaseHandler} from './base-handler.interface.js';
import {IButton} from './button.interface.js';

/**
 * Interface for button interaction handlers.
 */
export interface IButtonHandler extends IBaseHandler {
    /**
     * Registers a button entity within the handler.
     */
    registerButton(button: IButton): void;
}
