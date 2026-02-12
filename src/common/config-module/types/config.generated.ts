/**
 * ⚠️ AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * This file contains types inferred from Zod schemas and the ConfigKey mapping.
 */

export type ModuleDiscordLoggingInteractionConfig = {
    enabled: boolean;
    retryCount: number;
    /** Request timeout in ms */
    timeout: number;
    batchSize: number;
    /** System API Key */
    apiKey?: string | undefined;
    endpoint: string;
    /** Primary admin contact */
    adminEmail: string;
    /** Correlation trace ID */
    traceId?: string | undefined;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    tags: string[];
    nested: {
        value: string;
    };
};

export type ModuleDeepTestConfig = {
    /** The name of the microservice */
    serviceName: string;
    database: {
        host: string;
        /** Standard DB port */
        port: number;
        options: {
            ssl: boolean;
            /** Connection pool size */
            pool: number;
        };
    };
    /** List of deployment tags */
    tags: string[];
};

export type AppConfigKey = 'module.discord.logging.interaction' | 'module.deep.test';

export const ConfigKey = {
    Module: {
        Discord: {
            Logging: {
                Interaction: 'module.discord.logging.interaction'
            }
        },
        Deep: {
            Test: 'module.deep.test'
        }
    }
} as const;
