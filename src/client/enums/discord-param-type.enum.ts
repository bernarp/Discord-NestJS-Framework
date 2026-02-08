/**
 * Enum for types of data that can be injected via decorators in command methods.
 */
export enum DiscordParamType {
    /** Injects the full interaction object. */
    INTERACTION = '0',

    /** Injects a specific option value from the interaction. */
    OPTION = '1',

    /** Injects the user who triggered the interaction. */
    CURRENT_USER = '2',

    /** Injects the guild member who triggered the interaction. */
    CURRENT_MEMBER = '3',

    /** Injects the channel where the interaction occurred. */
    CURRENT_CHANNEL = '4',

    /** Injects the guild where the interaction occurred. */
    CURRENT_GUILD = '5',

    /** Injects the Discord client instance. */
    CLIENT = '6'
}
