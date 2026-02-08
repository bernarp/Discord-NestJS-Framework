/**
 * Enum for Discord activity types.
 * Matches discord.js ActivityType values for seamless integration.
 */
export enum DiscordActivityType {
    Playing = 0,
    Streaming = 1,
    Listening = 2,
    Watching = 3,
    Custom = 4,
    Competing = 5
}

/**
 * Enum for Discord presence status.
 * Matches discord.js PresenceUpdateStatus strings.
 */
export enum DiscordPresenceStatus {
    Online = 'online',
    Idle = 'idle',
    DoNotDisturb = 'dnd',
    Invisible = 'invisible',
    Offline = 'offline'
}
