/**
 * Dictionary of all system event names.
 * Using a centralized dictionary ensures consistency and prevents typos in decorators.
 */
export const Events = {
    /**
     * Initial test event sent from Module A to Module B.
     */
    TEST_INIT: 'test.init',

    /**
     * Response event sent from Module B back to Module A.
     */
    TEST_RESPONSE: 'test.response',

    /**
     * Template events (example placeholders)
     */
    TEMPLATE: {
        CREATED: 'template.created',
        UPDATED: 'template.updated',
        DELETED: 'template.deleted'
    }
} as const;

/**
 * Type representing all possible event names from the dictionary.
 */
export type AppEventName = (typeof Events)[keyof typeof Events] | string;
