import { Interaction } from 'discord.js';
import { IBaseHandler } from '../../interfaces/base-handler.interface.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * @abstract
 * @class AbstractInteractionHandler
 * @implements IBaseHandler
 * @template TInteraction - The specific type of Discord Interaction.
 * @template TEntity - The internal entity type representing the handler (e.g., ICommand, IButton).
 * @description Provides a base implementation for interaction handlers using the Template Method pattern.
 * Manages an internal registry of entities and orchestrates the execution lifecycle: 
 * preExecute -> processEntity -> postExecute.
 */
export abstract class AbstractInteractionHandler<
    TInteraction extends Interaction,
    TEntity extends { name?: string; customId?: string }
> implements IBaseHandler {

    /**
     * @protected
     * @readonly
     * @type {Map<string, TEntity>}
     * @description Internal storage for registered entity handlers (commands, buttons, etc.).
     */
    protected readonly _registry = new Map<string, TEntity>();

    /**
     * @constructor
     * @param {ILogger} _logger - Injected logger instance for the specific handler implementation.
     */
    constructor(protected readonly _logger: ILogger) { }

    /**
     * @public
     * @param {TEntity} entity - The entity to be registered in this handler's registry.
     * @returns {void}
     * @description Registers an entity and warns if a duplicate key (name or customId) is detected.
     */
    public register(entity: TEntity): void {
        const key = this.getEntityKey(entity);
        if (this._registry.has(key)) {
            this._logger.warn(`Duplicate registration detected for key: ${key} in ${this.constructor.name}`);
            return;
        }
        this._registry.set(key, entity);
    }

    /**
     * @public
     * @async
     * @param {TInteraction} interaction - The incoming Discord interaction.
     * @returns {Promise<void>}
     * @description Main entry point for interaction processing. Orchestrates the full execution lifecycle.
     */
    public async execute(interaction: TInteraction): Promise<void> {
        const key = this.getInteractionKey(interaction);
        const entity = this._registry.get(key);

        if (!entity) {
            this._logger.debug(`No handler found for key: ${key} in ${this.constructor.name}`);
            return;
        }

        try {
            await this.preExecute(interaction, entity);
            await this.processEntity(interaction, entity);
            await this.postExecute(interaction, entity);
        } catch (error) {
            this.handleError(interaction, error);
        }
    }

    /**
     * @public
     * @abstract
     * @param {Interaction} interaction - The raw Discord interaction.
     * @returns {boolean}
     * @description Type guard to check if the specific handler implementation supports this interaction.
     */
    public abstract supports(interaction: Interaction): boolean;

    /**
     * @protected
     * @abstract
     * @param {TEntity} entity - The entity to get the key from.
     * @returns {string} The unique key (name or customId).
     * @description Extracts the registry key from a handler entity.
     */
    protected abstract getEntityKey(entity: TEntity): string;

    /**
     * @protected
     * @abstract
     * @param {TInteraction} interaction - The incoming interaction.
     * @returns {string} The key used for matching in the registry.
     * @description Extracts the lookup key from a Discord interaction.
     */
    protected abstract getInteractionKey(interaction: TInteraction): string;

    /**
     * @protected
     * @async
     * @param {TInteraction} interaction - The interaction.
     * @param {TEntity} entity - The matched entity.
     * @returns {Promise<void>}
     * @description The core execution logic. By default, calls the 'execute' method of the entity if it exists.
     */
    protected async processEntity(interaction: TInteraction, entity: TEntity): Promise<void> {
        if ('execute' in entity && typeof (entity as any).execute === 'function') {
            await (entity as any).execute(interaction);
        }
    }

    /**
     * @protected
     * @async
     * @param {TInteraction} interaction - The interaction.
     * @param {TEntity} entity - The matched entity.
     * @returns {Promise<void>}
     * @description Hook called BEFORE the main process logic. Useful for permissions, deferring, etc.
     */
    protected async preExecute(interaction: TInteraction, entity: TEntity): Promise<void> {
        // Default implementation does nothing
    }

    /**
     * @protected
     * @async
     * @param {TInteraction} interaction - The interaction.
     * @param {TEntity} entity - The matched entity.
     * @returns {Promise<void>}
     * @description Hook called AFTER the main process logic. Useful for metrics, logging, etc.
     */
    protected async postExecute(interaction: TInteraction, entity: TEntity): Promise<void> {
        // Default implementation does nothing
    }

    /**
     * @protected
     * @param {TInteraction} interaction - The interaction that caused the error.
     * @param {any} error - The caught error object.
     * @returns {void}
     * @description Centralized error handling for the interaction lifecycle. Logs to the custom logger.
     */
    protected handleError(interaction: TInteraction, error: any): void {
        const err = error as Error;
        this._logger.err(`Error handling interaction ${interaction.id}: ${err.message}`, err.stack);
        throw error;
    }
}
