import {Message, User, GuildMember, BaseGuildTextChannel, Guild, MessagePayload, InteractionEditReplyOptions, MessageEditOptions, Client} from 'discord.js';
import {IPrefixContext, UnifiedReplyOptions} from '../interfaces/index.js';
import {IPrefixOptionResolver} from '../interfaces/prefix-option-resolver.interface.js';
import {PrefixOptionResolver} from './prefix-option.resolver.js';

/**
 * Adapter that follows the IPrefixContext interface to provide a unified
 * API for both Prefix and Slash commands.
 */
export class PrefixInteractionAdapter implements IPrefixContext {
    private _lastResponse: Message | null = null;
    private _isDeferred: boolean = false;
    private readonly _options: PrefixOptionResolver;

    constructor(
        private readonly _message: Message,
        private readonly _correlationId: string,
        args: string[],
        paramMap: Map<string, number> = new Map()
    ) {
        this._options = new PrefixOptionResolver(_message, args, paramMap);
    }

    public get message(): Message {
        return this._message;
    }

    public get user(): User {
        return this._message.author;
    }

    public get member(): GuildMember | null {
        return this._message.member;
    }

    public get guild(): Guild | null {
        return this._message.guild;
    }

    public get channel(): BaseGuildTextChannel | null {
        return this._message.channel as BaseGuildTextChannel;
    }

    public get correlationId(): string {
        return this._correlationId;
    }

    public get options(): IPrefixOptionResolver {
        return this._options;
    }

    /** @inheritdoc */
    public get client(): Client {
        return this._message.client;
    }

    /** @inheritdoc */
    public async reply(options: UnifiedReplyOptions): Promise<Message> {
        const response = await this._message.reply(options as any);
        this._lastResponse = response;
        return response;
    }

    /** @inheritdoc */
    public async deferReply(options?: {ephemeral?: boolean}): Promise<void> {
        if (this._isDeferred) return;

        await this.channel?.sendTyping();
        this._isDeferred = true;
    }

    /** @inheritdoc */
    public async editReply(options: string | MessagePayload | InteractionEditReplyOptions | MessageEditOptions): Promise<Message> {
        if (!this._lastResponse) {
            throw new Error('Cannot edit reply: No initial response was sent.');
        }
        return await this._lastResponse.edit(options as any);
    }

    /** @inheritdoc */
    public async deleteReply(): Promise<void> {
        if (!this._lastResponse) {
            throw new Error('Cannot delete reply: No initial response was sent.');
        }

        await this._lastResponse.delete();
        this._lastResponse = null;
    }
}
