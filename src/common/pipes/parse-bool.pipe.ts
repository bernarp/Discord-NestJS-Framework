import {Injectable} from '@nestjs/common';
import {IDiscordPipe, IArgumentMetadata} from './interfaces/discord-pipe.interface.js';
import {BotException} from '../exceptions/bot.exception.js';

/**
 * Pipe that converts an input value to a boolean.
 */
@Injectable()
export class ParseBoolPipe implements IDiscordPipe {
    /**
     * Transforms the input value to a boolean.
     * @param value Raw input value.
     * @param metadata Parameter metadata.
     * @returns Transformed boolean.
     */
    public transform(value: any, metadata: IArgumentMetadata): boolean {
        if (value === undefined || value === null) return value;
        if (typeof value === 'boolean') return value;

        if (value === 'true' || value === '1' || value === 1) return true;
        if (value === 'false' || value === '0' || value === 0) return false;

        throw new BotException(`Validation failed: Argument '${metadata.data || 'unknown'}' must be a boolean.`, 'Validation Error');
    }
}
