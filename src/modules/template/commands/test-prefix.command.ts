import {Injectable, Inject} from '@nestjs/common';
import {PrefixCommand, PrefixSubCommand, Option, Ctx, LogMethod} from '@/common/decorators/index.js';
import type {IPrefixContext} from '@/client/interfaces/index.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * @class TestPrefixCommand
 * @description A test prefix command with subcommands and options.
 */
@PrefixCommand({
    name: 'test',
    aliases: ['t', 'debug-test'],
    description: 'A test prefix command with subcommands and options',
    category: 'Debug'
})
@Injectable()
export class TestPrefixCommand {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Main entry point: !test
     */
    @LogMethod()
    public async execute(@Ctx() ctx: IPrefixContext): Promise<void> {
        await ctx.reply('Main test command executed! Try `!test info` or `!test echo <text>`.');
    }

    /**
     * Subcommand: !test info
     */
    @PrefixSubCommand({
        name: 'info',
        description: 'Shows info about the execution context'
    })
    public async onInfo(@Ctx() ctx: IPrefixContext): Promise<void> {
        await ctx.reply(`**Context Info**:\n` + `- User: \`${ctx.user.tag}\`\n` + `- Guild: \`${ctx.guild?.name ?? 'DM'}\`\n` + `- Correlation ID: \`${ctx.correlationId}\``);
    }

    /**
     * Subcommand: !test echo <text>
     */
    @PrefixSubCommand({
        name: 'echo',
        description: 'Echoes back the provided text'
    })
    public async onEcho(@Option('text') text: string, @Ctx() ctx: IPrefixContext): Promise<void> {
        if (!text) {
            await ctx.reply('**Error**: You must provide some text to echo!\nUsage: `!test echo <your message>`');
            return;
        }
        await ctx.reply(`**Echo**: ${text}`);
    }
}
