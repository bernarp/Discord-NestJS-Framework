import {OptionType} from '../enums/command-option.enum.js';

/**
 * Represents a single option within a Discord slash command.
 */
export interface IDiscordCommandOptionDto {
    name: string;
    description: string;
    type: OptionType;
    required?: boolean;
    autocomplete?: boolean;
}

/**
 * Data Transfer Object for registering slash commands with the Discord API.
 */
export interface IDiscordCommandRegistrationDto {
    name: string;
    description: string;
    options?: IDiscordCommandOptionDto[];
    default_member_permissions?: string;
    dm_permission?: boolean;
}
