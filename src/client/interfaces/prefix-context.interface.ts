import {
    Message,
    User,
    GuildMember,
    BaseGuildTextChannel,
    Guild,
    MessageReplyOptions,
    InteractionReplyOptions,
    MessagePayload,
    InteractionEditReplyOptions,
    MessageEditOptions,
    Client
} from 'discord.js';
import {IPrefixOptionResolver} from './prefix-option-resolver.interface.js';

/**
 * Union type for unified interaction responding.
 * Bridges the gap between Message.reply and Interaction.reply options.
 */
export type UnifiedReplyOptions = string | MessagePayload | (InteractionReplyOptions & MessageReplyOptions);

/**
 * Interface for the Context Adapter that bridges Discord Messages (Prefix Commands)
 * and ChatInputCommands (Slash Commands).
 */
export interface IPrefixContext {
    /** The Discord client instance */
    readonly client: Client;

    /** The original message that triggered the command */
    readonly message: Message;

    /** The user who sent the message */
    readonly user: User;

    /** The guild member who sent the message (if in a guild) */
    readonly member: GuildMember | null;

    /** The guild where the message was sent (if in a guild) */
    readonly guild: Guild | null;

    /** The channel where the message was sent */
    readonly channel: BaseGuildTextChannel | null;

    /** Correlation ID for tracing this execution */
    readonly correlationId: string;

    /** Argument resolver for this execution */
    readonly options: IPrefixOptionResolver;

    /**
     * Responds to the command.
     * Uses message.reply internally.
     */
    reply(options: UnifiedReplyOptions): Promise<Message>;

    /**
     * Defers the response.
     * For prefix commands, this might trigger 'typing' indicator.
     */
    deferReply(options?: {ephemeral?: boolean}): Promise<void>;

    /**
     * Edits the existing response.
     */
    editReply(options: string | MessagePayload | InteractionEditReplyOptions | MessageEditOptions): Promise<Message>;

    /**
     * Deletes the response message.
     */
    deleteReply(): Promise<void>;
}
