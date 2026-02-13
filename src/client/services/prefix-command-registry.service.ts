import {Injectable, Inject} from '@nestjs/common';
import {IResolvedPrefixCommand, IPrefixCommandRegistry} from '../interfaces/index.js';
import {LogClass} from '@/common/decorators/log-class.decorator.js';
import {LogLevel} from '@/common/decorators/log-method.decorator.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Registry for all discovered Prefix Commands.
 * Stores the mapping between command names (and aliases) and their implementations.
 */
@Injectable()
export class PrefixCommandRegistry implements IPrefixCommandRegistry {
    /**
     * Map of command name/alias to resolved command structure.
     */
    private readonly _commands = new Map<string, IResolvedPrefixCommand>();

    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /** @inheritdoc */
    public register(command: IResolvedPrefixCommand): void {
        const {name, aliases} = command.options;
        this._logger.debug(`Storing prefix command: ${name}`, 'CommandRegistry');
        this._commands.set(name.toLowerCase(), command);
        if (aliases) {
            for (const alias of aliases) {
                this._logger.debug(`Registering alias: ${alias} for command: ${name}`, 'CommandRegistry');
                this._commands.set(alias.toLowerCase(), command);
            }
        }
    }

    /** @inheritdoc */
    public getCommand(trigger: string): IResolvedPrefixCommand | undefined {
        return this._commands.get(trigger.toLowerCase());
    }

    /** @inheritdoc */
    public getAllCommands(): IResolvedPrefixCommand[] {
        return Array.from(new Set(this._commands.values()));
    }
}
