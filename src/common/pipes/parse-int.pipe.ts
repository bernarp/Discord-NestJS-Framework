import {Injectable} from '@nestjs/common';
import {IDiscordPipe, IArgumentMetadata} from './interfaces/discord-pipe.interface.js';
import {BotException} from '../exceptions/bot.exception.js';

/**
 * Pipe that converts an input value to an integer.
 */
@Injectable()
export class ParseIntPipe implements IDiscordPipe {
    /**
     * Transforms the input value to an integer.
     * @param value Raw input value.
     * @param metadata Parameter metadata.
     * @returns Transformed integer.
     */
    public transform(value: any, metadata: IArgumentMetadata): number {
        if (value === undefined || value === null) return value;

        const val = parseInt(value, 10);

        if (isNaN(val)) {
            throw new BotException(`Validation failed: Argument '${metadata.data || 'unknown'}' must be an integer.`, 'Validation Error');
        }

        return val;
    }
}
