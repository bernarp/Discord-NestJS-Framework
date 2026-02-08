import {ChatInputCommandInteraction, MessageFlags, User} from 'discord.js';
import {Inject} from '@nestjs/common';
import {CommandSlash, LogMethod, SubCommand, Interaction, Option, CurrentUser} from '@/common/decorators/index.js';
import {ICommand} from '@/client/interfaces/command.interface.js';
import {CommandRegistrationType} from '@/client/enums/command-registration-type.enum.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {IUPTIME_PROVIDER_TOKEN, ISYSTEM_INFO_PROVIDER_TOKEN} from '@/common/utils/utils.token.js';
import type {IUptimeProvider} from '@/common/utils/interfaces/IUptimeProvider.js';
import type {ISystemInfoProvider} from '@/common/utils/interfaces/ISystemInfoProvider.js';

/**
 * Example command demonstrating the use of @CommandSlash and @SubCommand decorators.
 * Now supports parameter decorators like @Option and @CurrentUser.
 */
@CommandSlash({
    name: 'ping',
    description: 'Check bot latency and system status',
    registration: CommandRegistrationType.GUILD
})
export class PingCommand implements ICommand {
    public readonly name = 'ping';

    constructor(
        @Inject(LOG.LOGGER) private readonly _logger: ILogger,
        @Inject(IUPTIME_PROVIDER_TOKEN) private readonly _uptimeProvider: IUptimeProvider,
        @Inject(ISYSTEM_INFO_PROVIDER_TOKEN) private readonly _systemInfoProvider: ISystemInfoProvider
    ) {}

    /**
     * Entry point for the /ping command.
     * Called if no subcommand is provided.
     */
    public async execute(@Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: 'Pong! Please use a subcommand like `/ping simple`.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    /**
     * Subcommand: /ping simple
     * Returns a basic pong reply.
     */
    @SubCommand({
        name: 'simple',
        description: 'Basic connectivity check'
    })
    public async onSimplePing(@CurrentUser() user: User, @Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        const latency = Date.now() - interaction.createdTimestamp;
        await interaction.reply({
            content: `Pong! Latency: \`${latency}ms\`. User: ${user.tag}`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    /**
     * Subcommand: /ping info
     * Returns detailed bot and environment information.
     */
    @SubCommand({
        name: 'info',
        description: 'Detailed system information'
    })
    public async onInfoPing(@Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        const latency = Date.now() - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;

        await interaction.reply({
            content:
                `**System Status**\n` +
                `- Bot Latency: \`${latency}ms\`\n` +
                `- API Latency: \`${apiLatency}ms\`\n` +
                `- Uptime: \`${this._uptimeProvider.getFormattedUptime()}\`\n` +
                `- Node.js: \`${this._systemInfoProvider.getNodeVersion()}\`\n` +
                `- Memory: \`${this._systemInfoProvider.getMemoryUsage()}\``,
            flags: [MessageFlags.Ephemeral]
        });
    }
}
