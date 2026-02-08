import {DiscordParamType} from '../enums/discord-param-type.enum.js';
import {IDiscordPipe} from '../../common/pipes/interfaces/discord-pipe.interface.js';

/**
 * Metadata stored for each decorated parameter.
 */
export interface IParamMetadata {
    /**
     * Type of injection requested.
     */
    type: DiscordParamType;

    /**
     * Index of the parameter in the method signature.
     */
    index: number;

    /**
     * Optional data (e.g., name of the option to extract).
     */
    data?: string;

    /**
     * Array of pipes to be applied to the parameter value.
     * Can be instances or classes.
     */
    pipes?: (IDiscordPipe | Function)[];
}
