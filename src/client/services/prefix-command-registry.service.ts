import {Injectable} from '@nestjs/common';
import {IResolvedPrefixCommand, IPrefixCommandRegistry} from '../interfaces/index.js';
import {LogClass} from '@/common/decorators/log-class.decorator.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';

/**
 * Registry for all discovered Prefix Commands.
 * Stores the mapping between command names (and aliases) and their implementations.
 */
@LogClass({level: LogLevel.DEBUG})
@Injectable()
export class PrefixCommandRegistry implements IPrefixCommandRegistry {
    /**
     * Map of command name/alias to resolved command structure.
     */
    private readonly _commands = new Map<string, IResolvedPrefixCommand>();

    /** @inheritdoc */
    public register(command: IResolvedPrefixCommand): void {
        const {name, aliases} = command.options;
        this._commands.set(name.toLowerCase(), command);
        if (aliases) {
            for (const alias of aliases) {
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
