import {Injectable} from '@nestjs/common';
import {IDiscordPipe, IArgumentMetadata} from './interfaces/discord-pipe.interface.js';
import {BotException} from '../exceptions/bot.exception.js';

/**
 * Pipe that converts an input value to a floating-point number.
 */
@Injectable()
export class ParseFloatPipe implements IDiscordPipe {
    /**
     * Transforms the input value to a float.
     * @param value Raw input value.
     * @param metadata Parameter metadata.
     * @returns Transformed float.
     */
    public transform(value: any, metadata: IArgumentMetadata): number {
        if (value === undefined || value === null) return value;

        const val = parseFloat(value);

        if (isNaN(val)) {
            throw new BotException(`Validation failed: Argument '${metadata.data || 'unknown'}' must be a number.`, 'Validation Error');
        }

        return val;
    }
}
