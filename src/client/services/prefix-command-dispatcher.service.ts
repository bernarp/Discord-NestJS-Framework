import {Injectable, Inject} from '@nestjs/common';
import * as discord from 'discord.js';
import {On} from '@/common/decorators/index.js';
import type {IPrefixCommandRegistry, IPrefixContext, IPrefixCommandDispatcher, IResolvedPrefixCommand} from '../interfaces/index.js';
import {IPREFIX_COMMAND_REGISTRY_TOKEN} from '../client.token.js';
import {PrefixInteractionAdapter} from '../adapters/index.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {ParamsResolverService} from '../interactions/params-resolver.service.js';
import {LogClass} from '@/common/decorators/log-class.decorator.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';

/**
 * Service responsible for dispatching message-based commands.
 * Listens to messageCreate event and routes to the appropriate handler.
 */
@LogClass({level: LogLevel.DEBUG})
@Injectable()
export class PrefixCommandDispatcherService implements IPrefixCommandDispatcher {
    private readonly _prefix = '!';

    constructor(
        @Inject(IPREFIX_COMMAND_REGISTRY_TOKEN) private readonly _registry: IPrefixCommandRegistry,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger,
        private readonly _requestContext: RequestContextService,
        private readonly _paramsResolver: ParamsResolverService
    ) {}

    /** @inheritdoc */
    @On(discord.Events.MessageCreate)
    public async handleMessage(message: discord.Message): Promise<void> {
        if (message.author.bot || !message.content.startsWith(this._prefix)) {
            return;
        }
        const correlationId = this._requestContext.getCorrelationId() || discord.SnowflakeUtil.generate().toString();
        const args = message.content.slice(this._prefix.length).trim().split(/ +/);
        const commandTrigger = args.shift()?.toLowerCase();
        if (!commandTrigger) return;
        const resolved = this._registry.getCommand(commandTrigger);
        if (!resolved) return;
        try {
            await this._executeCommand(message, resolved, args, correlationId);
        } catch (error) {
            const err = error as Error;
            this._logger.error(`Failed to execute prefix command [${commandTrigger}]: ${err.message}`, err.stack);
            if (message.channel && 'send' in message.channel) {
                await message.reply('An error occurred while executing this command.');
            }
        }
    }

    /**
     * Orchestrates the final execution of the command.
     */
    private async _executeCommand(message: discord.Message, resolved: IResolvedPrefixCommand, args: string[], correlationId: string): Promise<void> {
        let target: IResolvedPrefixCommand = resolved;
        const finalArgs = [...args];
        if (args.length > 0 && resolved.subCommands) {
            const firstArg = args[0];
            if (firstArg) {
                const subCommandName = firstArg.toLowerCase();
                const subResolved = resolved.subCommands.get(subCommandName);
                if (subResolved) {
                    target = subResolved;
                    finalArgs.shift();
                }
            }
        }
        const ctx: IPrefixContext = new PrefixInteractionAdapter(message, correlationId, finalArgs, target.paramMap);
        const methodName = target.methodName;
        const instance = target.instance;
        if (instance && methodName && typeof (instance as any)[methodName] === 'function') {
            const resolvedArgs = await this._paramsResolver.resolveArguments(instance, methodName, ctx);
            await (instance as any)[methodName](...resolvedArgs);
        } else {
            this._logger.error(`Method ${methodName} not found on instance of ${instance?.constructor?.name || 'unknown'}`);
        }
    }
}
