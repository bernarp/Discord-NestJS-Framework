import {Inject, Injectable, Type} from '@nestjs/common';
import {ChatInputCommandInteraction, AutocompleteInteraction, BaseInteraction, User, GuildMember, Role, BaseChannel, Attachment} from 'discord.js';
import {DISCORD_PARAMS_METADATA} from '@/common/decorators/keys.js';
import {DiscordParamType} from '../enums/discord-param-type.enum.js';
import {IParamMetadata} from '../interfaces/param-metadata.interface.js';
import {BotException} from '@/common/exceptions/bot.exception.js';
import {IDiscordPipe, IArgumentMetadata} from '../../common/pipes/interfaces/discord-pipe.interface.js';
import {ParseIntPipe} from '../../common/pipes/parse-int.pipe.js';
import {ParseFloatPipe} from '../../common/pipes/parse-float.pipe.js';
import {ParseBoolPipe} from '../../common/pipes/parse-bool.pipe.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {EDAContext} from '@/common/event-bus/eda-context.holder.js';
import {IPrefixContext} from '../interfaces/prefix-context.interface.js';

/**
 * Service responsible for resolving method arguments based on custom Discord decorators.
 * Supports data transformation and validation via Pipes.
 */
@Injectable()
export class ParamsResolverService {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Resolves arguments for a specific method execution based on interaction data.
     * @param target - The object instance containing the method.
     * @param methodName - The name of the method to resolve parameters for.
     * @param interaction - The current Discord interaction or prefix context.
     * @returns Array of resolved arguments in correct order.
     */
    @LogMethod({level: LogLevel.DEBUG, description: 'Resolve method arguments'})
    public async resolveArguments(target: object, methodName: string, interaction: BaseInteraction | IPrefixContext): Promise<any[]> {
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, methodName) || [];
        if (metadata.length === 0) {
            return [interaction];
        }
        const paramTypes: Type<any>[] = Reflect.getMetadata('design:paramtypes', target, methodName) || [];
        const args: any[] = [];
        for (const param of metadata) {
            const metatype = paramTypes[param.index];
            const rawValue = this._resolveRawValue(param, interaction, metatype);
            const argumentMetadata: IArgumentMetadata = {
                type: param.type,
                metatype: metatype,
                data: param.data
            };
            args[param.index] = await this._applyPipes(rawValue, param, argumentMetadata);
        }

        return args;
    }

    /**
     * Applies a chain of pipes to a value.
     */
    private async _applyPipes(value: any, param: IParamMetadata, metadata: IArgumentMetadata): Promise<any> {
        let result = value;
        if ((!param.pipes || param.pipes.length === 0) && param.type === DiscordParamType.OPTION) {
            result = this._applyAutomaticTransformation(result, metadata);
        }
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
    private _resolveRawValue(param: IParamMetadata, interaction: BaseInteraction | IPrefixContext, metatype?: Type<any>): any {
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
                return this._getOptionValue(param.data!, interaction, metatype);

            case DiscordParamType.REQUEST_CONTEXT:
                return EDAContext.getRequestContext().getContext();

            default:
                return undefined;
        }
    }

    /**
     * Safely retrieves option value from interaction with smart type resolution.
     */
    private _getOptionValue(name: string, interaction: BaseInteraction | IPrefixContext, metatype?: Type<any>): any {
        if (this._isPrefixContext(interaction)) {
            const options = interaction.options;

            if (metatype) {
                if (metatype === User) return options.getUser(name);
                if (metatype === GuildMember) return options.getMember(name);
                if (metatype === Role) return options.getRole(name);
                if (metatype === BaseChannel || (metatype.prototype && metatype.prototype instanceof BaseChannel)) {
                    return options.getChannel(name);
                }
            }

            return options.getString(name);
        }
        if (!(interaction instanceof ChatInputCommandInteraction) && !(interaction instanceof AutocompleteInteraction)) {
            return undefined;
        }
        if (interaction.isAutocomplete()) {
            return interaction.options.get(name)?.value;
        }
        const options = interaction.options;
        if (metatype) {
            if (metatype === User) return options.getUser(name);
            if (metatype === GuildMember) return options.getMember(name);
            if (metatype === Role) return options.getRole(name);
            if (metatype === Attachment) return options.getAttachment(name);
            if (metatype === BaseChannel || (metatype.prototype && metatype.prototype instanceof BaseChannel)) {
                return options.getChannel(name);
            }
        }

        return options.get(name)?.value;
    }

    /**
     * Type guard to check if the given interaction is a Prefix Context.
     */
    private _isPrefixContext(interaction: BaseInteraction | IPrefixContext): interaction is IPrefixContext {
        return !(interaction instanceof BaseInteraction);
    }
}
