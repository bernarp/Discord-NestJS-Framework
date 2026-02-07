import {ChatInputCommandInteraction, MessageFlags, User} from 'discord.js';
import {Inject} from '@nestjs/common';
import {CommandSlash, LogMethod, SubCommand, Interaction, Option, CurrentUser} from '@/common/decorators/index.js';
import {ICommand} from '@/client/interfaces/command.interface.js';
import {CommandRegistrationType} from '@/client/enums/command-registration-type.enum.js';
import {SUBCOMMAND_METADATA} from '@/common/decorators/keys.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {ParamsResolverService} from '@/client/interactions/params-resolver.service.js';

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
        private readonly _paramsResolver: ParamsResolverService
    ) {}

    /**
     * Entry point for the /ping command.
     * Routes the interaction to the appropriate subcommand handler.
     */
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subCommandName = interaction.options.getSubcommand(false);
        if (!subCommandName) {
            await interaction.reply({
                content: 'Pong! Please use a subcommand like `/ping simple`.',
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }
        const prototype = Object.getPrototypeOf(this);
        const methodNames = Object.getOwnPropertyNames(prototype);
        for (const methodName of methodNames) {
            const method = (this as any)[methodName];
            if (typeof method !== 'function') continue;

            const metadata = Reflect.getMetadata(SUBCOMMAND_METADATA, method);
            if (metadata && metadata.name === subCommandName) {
                const args = this._paramsResolver.resolveArguments(this, methodName, interaction);
                await method.apply(this, args);
                return;
            }
        }

        await interaction.reply({
            content: `Unknown subcommand: ${subCommandName}`,
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
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        await interaction.reply({
            content:
                `**System Status**\n` +
                `- Bot Latency: \`${latency}ms\`\n` +
                `- API Latency: \`${apiLatency}ms\`\n` +
                `- Uptime: \`${hours}h ${minutes}m ${seconds}s\`\n` +
                `- Node.js: \`${process.version}\``,
            flags: [MessageFlags.Ephemeral]
        });
    }
}
