import {Injectable, Logger} from '@nestjs/common';
import {AnySelectMenuInteraction} from 'discord.js';
import {ISelectMenuHandler} from '../../interfaces/select-menu-handler.interface.js';
import {ISelectMenu} from '../../interfaces/select-menu.interface.js';

/**
 * Specialized handler for processing all select menu interactions.
 */
@Injectable()
export class SelectMenuInteractionHandler implements ISelectMenuHandler {
    private readonly logger = new Logger(SelectMenuInteractionHandler.name);
    private readonly selectMenus = new Map<string, ISelectMenu>();

    /**
     * Executes the appropriate select menu logic based on the custom ID.
     * @param interaction The select menu interaction.
     */
    public async execute(interaction: AnySelectMenuInteraction): Promise<void> {
        const selectMenu = this.selectMenus.get(interaction.customId);

        if (selectMenu) {
            try {
                await selectMenu.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this.logger.error(`Error executing select menu ${interaction.customId}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this.logger.warn(`Received unknown select menu interaction: ${interaction.customId}`);
        }
    }

    /**
     * Registers a specific select menu implementation.
     * @param selectMenu The select menu to register.
     */
    public registerSelectMenu(selectMenu: ISelectMenu): void {
        this.selectMenus.set(selectMenu.customId, selectMenu);
        this.logger.debug(`Registered entity select menu: ${selectMenu.customId}`);
    }
}
