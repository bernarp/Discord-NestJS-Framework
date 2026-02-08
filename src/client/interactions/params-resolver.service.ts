import {Injectable} from '@nestjs/common';
import {ChatInputCommandInteraction, AutocompleteInteraction, BaseInteraction} from 'discord.js';
import {DISCORD_PARAMS_METADATA} from '@/common/decorators/keys.js';
import {DiscordParamType} from '../enums/discord-param-type.enum.js';
import {IParamMetadata} from '../interfaces/param-metadata.interface.js';

import {BotException} from '@/common/exceptions/bot.exception.js';

/**
 * Service responsible for resolving method arguments based on custom Discord decorators.
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
    public resolveArguments(target: object, methodName: string, interaction: BaseInteraction): any[] {
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, methodName) || [];
        if (metadata.length === 0) {
            return [interaction];
        }
        const args: any[] = [];
        metadata.forEach(param => {
            args[param.index] = this._resolveValue(param, interaction);
        });

        return args;
    }

    /**
     * extracts specific value from interaction based on param type.
     */
    private _resolveValue(param: IParamMetadata, interaction: BaseInteraction): any {
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
