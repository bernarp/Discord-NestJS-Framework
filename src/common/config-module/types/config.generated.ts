/**
 * ⚠️ AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * This file contains types inferred from Zod schemas and the ConfigKey mapping.
 */

export type ModuleDiscordLoggingInteractionConfig = {
    enabled: boolean;
    retryCount: number;
    nested: {
        value: string;
    };
};

export type AppConfigKey = 'module.discord.logging.interaction';

export const ConfigKey = {
    Module: {
        Discord: {
            Logging: {
                Interaction: 'module.discord.logging.interaction'
            }
        }
    }
} as const;
