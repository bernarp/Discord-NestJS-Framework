import {registerAs} from '@nestjs/config';
import {z} from 'zod';

/**
 * Zod schema for Discord configuration.
 * Ensures all required environment variables are present and valid.
 */
const discordConfigSchema = z.object({
    /**
     * Discord Bot Token (DISCORD_TOKEN)
     */
    token: z.string().min(1, 'DISCORD_TOKEN is required'),
    /**
     * Discord Application Client ID (CLIENT_ID)
     */
    clientId: z.string().min(1, 'CLIENT_ID is required'),
    /**
     * Discord Guild (Server) ID for development and testing (GUILD_ID)
     */
    guildId: z.string().min(1, 'GUILD_ID is required')
});

/**
 * Type inferred from the Zod schema.
 */
export type IDiscordConfig = z.infer<typeof discordConfigSchema>;

/**
 * Discord namespaced configuration.
 * Groups Discord-specific settings and validates them using Zod.
 *
 * @example
 * constructor(
 *   @Inject(discordConfig.KEY)
 *   private readonly config: ConfigType<typeof discordConfig>,
 * ) {}
 */
export const discordConfig = registerAs('discord', (): IDiscordConfig => {
    const values = {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID
    };

    const result = discordConfigSchema.safeParse(values);

    if (!result.success) {
        const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`[ConfigError] Discord configuration validation failed: ${errorMessages}`);
    }

    return result.data;
});
