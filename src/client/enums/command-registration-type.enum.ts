/**
 * Enum for Discord Slash Command registration environment.
 */
export enum CommandRegistrationType {
    /**
     * Registered only for a specific guild (developer server).
     * Faster updates, useful for development.
     */
    GUILD = '0',

    /**
     * Registered globally across all guilds.
     * Can take up to an hour to propagate.
     */
    GLOBAL = '1'
}
