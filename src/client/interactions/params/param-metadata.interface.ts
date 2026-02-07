import { DiscordParamType } from './discord-param-type.enum.js';

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
}
