import { ApplicationCommandOptionType } from 'discord.js';

/**
 * Wrapper over Discord option types to isolate business logic from library dependencies.
 */
export enum OptionType {
    Subcommand = ApplicationCommandOptionType.Subcommand,
    SubcommandGroup = ApplicationCommandOptionType.SubcommandGroup,
    String = ApplicationCommandOptionType.String,
    Integer = ApplicationCommandOptionType.Integer,
    Boolean = ApplicationCommandOptionType.Boolean,
    User = ApplicationCommandOptionType.User,
    Channel = ApplicationCommandOptionType.Channel,
    Role = ApplicationCommandOptionType.Role,
    Mentionable = ApplicationCommandOptionType.Mentionable,
    Number = ApplicationCommandOptionType.Number,
    Attachment = ApplicationCommandOptionType.Attachment
}
