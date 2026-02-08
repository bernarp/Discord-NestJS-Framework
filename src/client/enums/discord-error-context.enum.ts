/**
 * Enum representing technical contexts for global system errors.
 * Used in TGlobalErrorHandler to identify the source of the issue.
 */
export enum DiscordErrorContext {
    /** Critical errors on the Discord Gateway (WebSocket connection) */
    GatewayError = 'GatewayError',

    /** Non-fatal warnings from the Discord Gateway */
    GatewayWarning = 'GatewayWarning',

    /** REST API rate limit triggers */
    RateLimit = 'RateLimit',

    /** Failures during interaction processing/routing */
    InteractionError = 'InteractionError',

    /** General internal framework errors */
    InternalError = 'InternalError'
}
