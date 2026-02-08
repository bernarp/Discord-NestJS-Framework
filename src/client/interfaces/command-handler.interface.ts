import {IBaseHandler} from './base-handler.interface.js';
import {ICommand} from './command.interface.js';

/**
 * Interface for command interaction handlers.
 */
export interface ICommandHandler extends IBaseHandler {
    /**
     * Registers a command entity within the handler.
     */
    registerCommand(command: ICommand): void;
}
