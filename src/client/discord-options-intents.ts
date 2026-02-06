import {GatewayIntentBits, Partials, ClientOptions} from 'discord.js';
import {DISCORD_CLIENT_OPTIONS} from '@client/client.js';
import {Provider} from '@nestjs/common';

/**
 * Provider configuration for Discord Client options.
 * Defines intents, partials, and other gateway-specific settings.
 */
export const discordOptionsProvider: Provider = {
    provide: DISCORD_CLIENT_OPTIONS,
    useValue: {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        failIfNotExists: false
    } as ClientOptions
};
