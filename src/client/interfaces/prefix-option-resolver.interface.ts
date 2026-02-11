import {User, GuildMember, Role, BaseGuildTextChannel} from 'discord.js';

/**
 * Interface for Prefix Command option resolver.
 * Mimics ChatInputCommandInteraction.options API.
 */
export interface IPrefixOptionResolver {
    /** Gets a raw string argument by name or index */
    getString(name: string, required?: boolean): string | null;

    /** Gets a number argument by name or index */
    getNumber(name: string, required?: boolean): number | null;

    /** Gets an integer argument by name or index */
    getInteger(name: string, required?: boolean): number | null;

    /** Gets a boolean argument by name or index */
    getBoolean(name: string, required?: boolean): boolean | null;

    /** Gets a user argument (resolves mention or ID) */
    getUser(name: string, required?: boolean): User | null;

    /** Gets a member argument */
    getMember(name: string, required?: boolean): GuildMember | null;

    /** Gets a role argument */
    getRole(name: string, required?: boolean): Role | null;

    /** Gets a channel argument */
    getChannel(name: string, required?: boolean): BaseGuildTextChannel | null;
}
