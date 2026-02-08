import {ChatInputCommandInteraction, MessageFlags, User, Client, Guild, GuildMember, TextChannel} from 'discord.js';
import {Inject} from '@nestjs/common';
import {CommandSlash, LogMethod, SubCommand, Interaction, Option, CurrentUser, Client as BotClient, CurrentChannel, CurrentGuild, CurrentMember, Defer, Ephemeral} from '@/common/decorators/index.js';
import {ICommand} from '@/client/interfaces/command.interface.js';
import {CommandRegistrationType} from '@/client/enums/command-registration-type.enum.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {IUPTIME_PROVIDER_TOKEN, ISYSTEM_INFO_PROVIDER_TOKEN} from '@/common/utils/utils.token.js';
import type {IUptimeProvider} from '@/common/utils/interfaces/IUptimeProvider.js';
import type {ISystemInfoProvider} from '@/common/utils/interfaces/ISystemInfoProvider.js';

/**
 * Example command demonstrating the use of @CommandSlash and @SubCommand decorators.
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
     */
    public async execute(@Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: 'Pong! Please use a subcommand like `/ping simple`.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    /**
     * Subcommand: /ping simple
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

    /**
     * Subcommand: /ping debug
     */
    @SubCommand({
        name: 'debug',
        description: 'Test all context decorators'
    })
    public async onDebug(
        @BotClient() client: Client,
        @CurrentGuild() guild: Guild,
        @CurrentChannel() channel: TextChannel,
        @CurrentMember() member: GuildMember,
        @CurrentUser() user: User,
        @Interaction() interaction: ChatInputCommandInteraction
    ): Promise<void> {
        await interaction.reply({
            content:
                `**Debug Context**\n` +
                `- Client Latency: \`${client.ws.ping}ms\`\n` +
                `- Guild: \`${guild.name}\` (\`${guild.id}\`)\n` +
                `- Channel: \`${channel.name}\`\n` +
                `- Member: \`${member.displayName}\`\n` +
                `- User: \`${user.tag}\``,
            flags: [MessageFlags.Ephemeral]
        });
    }

    /**
     * Subcommand: /ping long
     * Tests @Defer and @Ephemeral decorators.
     */
    @Ephemeral()
    @Defer()
    @SubCommand({
        name: 'long',
        description: 'Test defer and ephemeral decorators'
    })
    public async onLongPing(@Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await interaction.editReply({
            content: 'This was a long task, but I deferred it automatically!'
        });
    }

    /**
     * Subcommand: /ping validate
     * Tests Pipes and automatic type transformation.
     */
    @SubCommand({
        name: 'validate',
        description: 'Test pipes and validation'
    })
    public async onValidate(@Option('age') age: number, @Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: `**Pipe Validation Success**\n- Received: \`${age}\`\n- Runtime Type: \`${typeof age}\``,
            flags: [MessageFlags.Ephemeral]
        });
    }
}
