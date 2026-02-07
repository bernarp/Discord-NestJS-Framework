import {Injectable, Inject} from '@nestjs/common';
import {BaseInteraction} from 'discord.js';
import {IErrorDetails} from '../interfaces/error-details.interface.js';
import {AdvancedComponentFactory} from '@/client/ui/services/advanced-component-factory.service.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Service specialized in sending error feedback to Discord interactions using V2 Components.
 */
@Injectable()
export class DiscordErrorResponseService {
    constructor(
        private readonly _uiFactory: AdvancedComponentFactory,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * Sends an error response as a reply or update to a Discord interaction using V2 components.
     * @param {BaseInteraction} interaction - The Discord interaction to reply to.
     * @param {IErrorDetails} details - Formatted error title and message.
     * @param {string} traceId - Correlation ID for debugging support.
     * @returns {Promise<void>}
     */
    public async sendError(interaction: BaseInteraction, details: IErrorDetails, traceId: string): Promise<void> {
        if (!interaction.isRepliable()) return;

        const {container} = this._uiFactory.createContainer().setColor(0xff0000).addHeading(`${details.title}`, 2).addText(details.message).addDivider().addTimestamp(new Date(), 'R').build();
        try {
            const responseOptions = {
                components: [container],
                embeds: [],
                ephemeral: true
            };

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(responseOptions);
            } else {
                await interaction.reply(responseOptions);
            }
        } catch (error) {
            this._logger.err(`Failed to send Discord error response: ${error}`);
        }
    }
}
