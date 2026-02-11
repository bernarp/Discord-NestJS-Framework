/**
 * Interface for the service that listens to interaction creation events.
 * Roots all Discord interactions (Commands, Buttons, etc.) to the central manager.
 */
export interface IInteractionListener {
    /**
     * Initializes the interaction creation listener on the Discord client.
     */
    init(): void;
}
