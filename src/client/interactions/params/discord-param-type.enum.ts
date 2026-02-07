/**
 * Enum for types of data that can be injected via decorators in command methods.
 */
export enum DiscordParamType {
    /**
     * Injects the full interaction object.
     */
    INTERACTION = '0',

    /**
     * Injects the user who triggered the interaction.
     */
    CURRENT_USER = '1',

    /**
     * Injects a specific option value from the interaction.
     */
    OPTION = '2',
}
