import {Type} from '@nestjs/common';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';

/**
 * Metadata about the argument being processed.
 */
export interface IArgumentMetadata {
    /**
     * The injection type (@Option, @CurrentUser, etc.)
     */
    type: DiscordParamType;

    /**
     * The reflected type of the parameter (String, Number, Boolean, or Class).
     * Requires emitDecoratorMetadata: true in tsconfig.
     */
    metatype?: Type<any>;

    /**
     * The data passed to the decorator (e.g., option name from @Option('age')).
     */
    data?: string;
}

/**
 * Interface that Discord pipes must implement.
 * Pipes are used for data transformation and validation.
 */
export interface IDiscordPipe {
    /**
     * Transforms the input value or performs validation.
     * @param value The raw value from the interaction.
     * @param metadata Information about the parameter being processed.
     * @returns The transformed value or a Promise of it.
     */
    transform(value: any, metadata: IArgumentMetadata): any | Promise<any>;
}
