import {Injectable, Logger} from '@nestjs/common';
import {BaseInteraction, EmbedBuilder, Colors} from 'discord.js';
import {IErrorDetails} from '../interfaces/error-details.interface.js';

/**
 * Service specialized in sending error feedback to Discord interactions.
 */
@Injectable()
export class DiscordErrorResponseService {
    private readonly _logger = new Logger(DiscordErrorResponseService.name);

    /**
     * Sends an error embed as a reply or update to a Discord interaction.
     * @param interaction - The Discord interaction to reply to.
     * @param details - Formatted error title and message.
     * @param traceId - Correlation ID for debugging support.
     */
    public async sendError(interaction: BaseInteraction, details: IErrorDetails, traceId: string): Promise<void> {
        if (!interaction.isRepliable()) return;

        const embed = new EmbedBuilder()
            .setTitle(`❌ ${details.title}`)
            .setDescription(details.message)
            .setFooter({text: `Trace ID: ${traceId}`})
            .setColor(Colors.Red)
            .setTimestamp();

        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    embeds: [embed],
                    components: []
                });
            } else {
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }
        } catch (error) {
            this._logger.error(`Failed to send Discord error response: ${error}`);
        }
    }
}
