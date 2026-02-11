import {User, GuildMember, Role, BaseGuildTextChannel, Message} from 'discord.js';
import {IPrefixOptionResolver} from '../interfaces/index.js';

/**
 * Resolver for positional arguments in prefix commands.
 * Matches string tokens to named parameters based on position.
 */
export class PrefixOptionResolver implements IPrefixOptionResolver {
    constructor(
        private readonly _message: Message,
        private readonly _args: string[],
        private readonly _paramMap: Map<string, number> = new Map()
    ) {}

    /** @inheritdoc */
    public getString(name: string, required?: boolean): string | null {
        const index = this._paramMap.get(name);
        const value = index !== undefined ? (this._args[index] ?? null) : null;
        if (required && value === null) {
            throw new Error(`Missing required string option: ${name}`);
        }
        return value;
    }

    /** @inheritdoc */
    public getNumber(name: string, required?: boolean): number | null {
        const value = this.getString(name, required);
        if (value === null) return null;
        const num = parseFloat(value);
        if (isNaN(num)) {
            if (required) throw new Error(`Option ${name} must be a number`);
            return null;
        }
        return num;
    }

    /** @inheritdoc */
    public getInteger(name: string, required?: boolean): number | null {
        const num = this.getNumber(name, required);
        return num !== null ? Math.floor(num) : null;
    }

    /** @inheritdoc */
    public getBoolean(name: string, required?: boolean): boolean | null {
        const value = this.getString(name, required);
        if (value === null) return null;
        const low = value.toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(low)) return true;
        if (['false', '0', 'no', 'off'].includes(low)) return false;
        if (required) throw new Error(`Option ${name} must be a boolean`);
        return null;
    }

    /** @inheritdoc */
    public getUser(name: string, required?: boolean): User | null {
        const value = this.getString(name, required);
        if (!value) return null;
        const id = this._extractId(value);
        const user = this._message.client.users.cache.get(id);
        if (required && !user) throw new Error(`User not found for option: ${name}`);
        return user || null;
    }

    /** @inheritdoc */
    public getMember(name: string, required?: boolean): GuildMember | null {
        const user = this.getUser(name, required);
        if (!user || !this._message.guild) return null;
        const member = this._message.guild.members.cache.get(user.id);
        if (required && !member) throw new Error(`Member not found for option: ${name}`);
        return member || null;
    }

    /** @inheritdoc */
    public getRole(name: string, required?: boolean): Role | null {
        const value = this.getString(name, required);
        if (!value || !this._message.guild) return null;
        const id = this._extractId(value);
        const role = this._message.guild.roles.cache.get(id);
        if (required && !role) throw new Error(`Role not found for option: ${name}`);
        return role || null;
    }

    /** @inheritdoc */
    public getChannel(name: string, required?: boolean): BaseGuildTextChannel | null {
        const value = this.getString(name, required);
        if (!value || !this._message.guild) return null;
        const id = this._extractId(value);
        const channel = this._message.guild.channels.cache.get(id);
        if (required && !channel) throw new Error(`Channel not found for option: ${name}`);
        return (channel as BaseGuildTextChannel) || null;
    }

    /**
     * Extracts ID from mention <@!ID>, <@ID>, <#ID>, <@&ID> or raw ID.
     */
    private _extractId(input: string): string {
        return input.replace(/[<@!#&>]/g, '');
    }
}
