import {Type} from '@nestjs/common';
import {User, GuildMember, Role, BaseChannel, Attachment} from 'discord.js';
import {OptionType} from '../enums/command-option.enum.js';

/**
 * Utility to map TypeScript/JavaScript types to Discord ApplicationCommandOptionType.
 */
export class TypeMapper {
    /**
     * Maps a constructor or primitive type to its corresponding Discord option type.
     * @param metatype - The type to map (e.g., String, Number, User).
     * @returns The resolved OptionType or null if unable to determine.
     */
    public static mapToDiscordType(metatype: Type<any> | Function): OptionType | null {
        if (!metatype) return null;

        // Primitives
        if (metatype === String) return OptionType.String;
        if (metatype === Boolean) return OptionType.Boolean;
        if (metatype === Number) return OptionType.Number;

        // Discord.js Classes
        if (metatype === User || metatype === GuildMember) return OptionType.User;
        if (metatype === Role) return OptionType.Role;
        if (metatype === Attachment) return OptionType.Attachment;

        // Channels (check prototype chain for BaseChannel)
        if (metatype === BaseChannel || (metatype.prototype && metatype.prototype instanceof BaseChannel)) {
            return OptionType.Channel;
        }

        return null;
    }
}
