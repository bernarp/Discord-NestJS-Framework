import {Injectable, Inject} from '@nestjs/common';
import {AnySelectMenuInteraction, Interaction} from 'discord.js';
import {AbstractInteractionHandler} from './base/abstract-interaction.handler.js';
import {ISelectMenuHandler} from '../interfaces/select-menu-handler.interface.js';
import {ISelectMenu} from '../interfaces/select-menu.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * @class SelectMenuInteractionHandler
 * @extends AbstractInteractionHandler
 * @implements ISelectMenuHandler
 * @description Specialized handler for processing all Discord select menu interactions (String, User, Role, etc.).
 * Matches incoming interactions with registered select menu entities via customId.
 */
@Injectable()
export class SelectMenuInteractionHandler extends AbstractInteractionHandler<AnySelectMenuInteraction, ISelectMenu> implements ISelectMenuHandler {
    /**
     * @constructor
     * @param {ILogger} logger - Custom logger instance.
     */
    constructor(@Inject(LOG.LOGGER) logger: ILogger) {
        super(logger);
    }

    /**
     * @public
     * @param {Interaction} interaction - The Discord interaction object.
     * @returns {boolean} True if the interaction is any kind of select menu.
     * @description Determines if this handler can process the given interaction.
     */
    public supports(interaction: Interaction): boolean {
        return interaction.isAnySelectMenu();
    }

    /**
     * @public
     * @param {ISelectMenu} selectMenu - The select menu entity to register.
     * @returns {void}
     * @description Registers a select menu entity in the local registry using its customId.
     */
    public registerSelectMenu(selectMenu: ISelectMenu): void {
        this.register(selectMenu);
        this._logger.debug(`Registered entity select menu: ${selectMenu.customId}`);
    }

    /**
     * @protected
     * @override
     * @param {ISelectMenu} selectMenu - The select menu entity.
     * @returns {string} The customId of the select menu.
     * @description Returns the key used for select menu registration.
     */
    protected getEntityKey(selectMenu: ISelectMenu): string {
        return selectMenu.customId;
    }

    /**
     * @protected
     * @override
     * @param {AnySelectMenuInteraction} interaction - The select menu interaction.
     * @returns {string} The customId from the interaction.
     * @description Returns the customId from the interaction to match against the registry.
     */
    protected getInteractionKey(interaction: AnySelectMenuInteraction): string {
        return interaction.customId;
    }
}
