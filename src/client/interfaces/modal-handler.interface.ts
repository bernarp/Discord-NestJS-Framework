import { IBaseHandler } from './base-handler.interface.js';
import { IModal } from './modal.interface.js';

/**
 * Interface for modal interaction handlers.
 */
export interface IModalHandler extends IBaseHandler {
    /**
     * Registers a modal entity within the handler.
     */
    registerModal(modal: IModal): void;
}
