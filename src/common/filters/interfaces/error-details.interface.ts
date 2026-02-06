/**
 * Interface representing formatted error details for user display.
 */
export interface IErrorDetails {
    /**
     * User-friendly title for the error (e.g., "Access Denied").
     */
    title: string;

    /**
     * User-friendly description of what went wrong.
     */
    message: string;
}
