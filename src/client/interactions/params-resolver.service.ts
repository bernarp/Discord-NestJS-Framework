import {Injectable, Type} from '@nestjs/common';
import {ChatInputCommandInteraction, AutocompleteInteraction, BaseInteraction} from 'discord.js';
import {DISCORD_PARAMS_METADATA} from '@/common/decorators/keys.js';
import {DiscordParamType} from '../enums/discord-param-type.enum.js';
import {IParamMetadata} from '../interfaces/param-metadata.interface.js';
import {BotException} from '@/common/exceptions/bot.exception.js';
import {IDiscordPipe, IArgumentMetadata} from '../../common/pipes/interfaces/discord-pipe.interface.js';
import {ParseIntPipe} from '../../common/pipes/parse-int.pipe.js';
import {ParseFloatPipe} from '../../common/pipes/parse-float.pipe.js';
import {ParseBoolPipe} from '../../common/pipes/parse-bool.pipe.js';

/**
 * Service responsible for resolving method arguments based on custom Discord decorators.
 * Supports data transformation and validation via Pipes.
 */
@Injectable()
export class ParamsResolverService {
    /**
     * Resolves arguments for a specific method execution based on interaction data.
     * @param target - The object instance containing the method.
     * @param methodName - The name of the method to resolve parameters for.
     * @param interaction - The current Discord interaction.
     * @returns Array of resolved arguments in correct order.
     */
    public async resolveArguments(target: object, methodName: string, interaction: BaseInteraction): Promise<any[]> {
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, methodName) || [];

        if (metadata.length === 0) {
            return [interaction];
        }

        // Get reflected types (requires emitDecoratorMetadata: true)
        const paramTypes: Type<any>[] = Reflect.getMetadata('design:paramtypes', target, methodName) || [];

        const args: any[] = [];
        for (const param of metadata) {
            const rawValue = this._resolveRawValue(param, interaction);

            // Prepare metadata for pipes
            const argumentMetadata: IArgumentMetadata = {
                type: param.type,
                metatype: paramTypes[param.index],
                data: param.data
            };

            // Apply Pipes
            args[param.index] = await this._applyPipes(rawValue, param, argumentMetadata);
        }

        return args;
    }

    /**
     * Applies a chain of pipes to a value.
     */
    private async _applyPipes(value: any, param: IParamMetadata, metadata: IArgumentMetadata): Promise<any> {
        let result = value;

        // 1. Automatic transformation based on metatype if no pipes are explicitly provided
        // and it's an OPTION type (where we usually need parsing)
        if ((!param.pipes || param.pipes.length === 0) && param.type === DiscordParamType.OPTION) {
            result = this._applyAutomaticTransformation(result, metadata);
        }

        // 2. Apply explicitly defined pipes
        if (param.pipes && param.pipes.length > 0) {
            for (const pipe of param.pipes) {
                const pipeInstance = typeof pipe === 'function' ? new (pipe as Type<IDiscordPipe>)() : pipe;

                result = await pipeInstance.transform(result, metadata);
            }
        }

        return result;
    }

    /**
     * Automatically applies basic parsing if the metatype matches common primitives.
     */
    private _applyAutomaticTransformation(value: any, metadata: IArgumentMetadata): any {
        if (value === undefined || value === null) return value;

        switch (metadata.metatype) {
            case Number:
                // Try to determine if it's float or int?
                // For simplicity, use Float to support both, or Int if we know it should be Int.
                // Here we'll default to Float as it covers Int as well.
                return new ParseFloatPipe().transform(value, metadata);
            case Boolean:
                return new ParseBoolPipe().transform(value, metadata);
            case String:
                return String(value);
            default:
                return value;
        }
    }

    /**
     * Extracts specific raw value from interaction based on param type.
     */
    private _resolveRawValue(param: IParamMetadata, interaction: BaseInteraction): any {
        switch (param.type) {
            case DiscordParamType.INTERACTION:
                return interaction;

            case DiscordParamType.CURRENT_USER:
                return interaction.user;

            case DiscordParamType.CURRENT_MEMBER:
                if (!interaction.guild) {
                    throw new BotException('Decorator @CurrentMember() can only be used within a guild context.');
                }
                return interaction.member;

            case DiscordParamType.CURRENT_CHANNEL:
                return interaction.channel;

            case DiscordParamType.CURRENT_GUILD:
                return interaction.guild;

            case DiscordParamType.CLIENT:
                return interaction.client;

            case DiscordParamType.OPTION:
                return this._getOptionValue(param.data!, interaction);

            default:
                return undefined;
        }
    }

    /**
     * Safely retrieves option value from interaction.
     */
    private _getOptionValue(name: string, interaction: BaseInteraction): any {
        if (!(interaction instanceof ChatInputCommandInteraction) && !(interaction instanceof AutocompleteInteraction)) {
            return undefined;
        }
        const option = interaction.options.get(name);
        if (!option) return undefined;
        return option.value;
    }
}
