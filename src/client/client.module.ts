import {Global, Module, Provider} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {DiscoveryModule} from '@nestjs/core';
import {BotClient} from './client.js';
import {discordOptionsProvider} from '@client/discord-options-intents.js';
import {
    ICLIENT_TOKEN,
    ICOMMAND_HANDLER_TOKEN,
    IBUTTON_HANDLER_TOKEN,
    ISELECT_MENU_HANDLER_TOKEN,
    IMODAL_HANDLER_TOKEN,
    IINTERACTIONS_MANAGER_TOKEN,
    IDISCORD_EVENT_MANAGER_TOKEN,
    IDISCORD_INTERACTION_HANDLERS_TOKEN
} from '@/client/client.token.js';

import {InteractionsManager} from './interactions-manager.js';
import {CommandInteractionHandler} from './interactions/command-interaction.handler.js';
import {ButtonInteractionHandler} from './interactions/button-interaction.handler.js';
import {SelectMenuInteractionHandler} from './interactions/select-menu-interaction.handler.js';
import {ModalInteractionHandler} from './interactions/modal-interaction.handler.js';
import {SlashCommandRegistrationService} from './register-slash-commands.js';
import {ParamsResolverService} from './interactions/params-resolver.service.js';
import {DiscordEventManager} from './services/discord-event-manager.service.js';
import {DiscordEventDiscoveryService} from './services/discord-event-discovery.service.js';

/**
 * Global module responsible for managing the Discord Client lifecycle.
 * Implements a registry of interaction handlers for a clean, decoupled architecture.
 */
@Global()
@Module({
    imports: [ConfigModule, DiscoveryModule],
    providers: [
        discordOptionsProvider,
        InteractionsManager,
        BotClient,
        CommandInteractionHandler,
        ButtonInteractionHandler,
        SelectMenuInteractionHandler,
        ModalInteractionHandler,
        SlashCommandRegistrationService,
        ParamsResolverService,
        DiscordEventManager,
        DiscordEventDiscoveryService,
        {
            provide: ICLIENT_TOKEN,
            useExisting: BotClient
        },
        {
            provide: IINTERACTIONS_MANAGER_TOKEN,
            useExisting: InteractionsManager
        },
        {
            provide: IDISCORD_EVENT_MANAGER_TOKEN,
            useExisting: DiscordEventManager
        },
        // Individual handler tokens for direct injection where needed (e.g. Discovery Services)
        {
            provide: ICOMMAND_HANDLER_TOKEN,
            useExisting: CommandInteractionHandler
        },
        {
            provide: IBUTTON_HANDLER_TOKEN,
            useExisting: ButtonInteractionHandler
        },
        {
            provide: ISELECT_MENU_HANDLER_TOKEN,
            useExisting: SelectMenuInteractionHandler
        },
        {
            provide: IMODAL_HANDLER_TOKEN,
            useExisting: ModalInteractionHandler
        },
        // Multi-provider for the InteractionsManager registry
        {
            provide: IDISCORD_INTERACTION_HANDLERS_TOKEN,
            useExisting: CommandInteractionHandler,
            multi: true
        },
        {
            provide: IDISCORD_INTERACTION_HANDLERS_TOKEN,
            useExisting: ButtonInteractionHandler,
            multi: true
        },
        {
            provide: IDISCORD_INTERACTION_HANDLERS_TOKEN,
            useExisting: SelectMenuInteractionHandler,
            multi: true
        },
        {
            provide: IDISCORD_INTERACTION_HANDLERS_TOKEN,
            useExisting: ModalInteractionHandler,
            multi: true
        }
    ] as Provider[],
    exports: [
        BotClient,
        ICLIENT_TOKEN,
        InteractionsManager,
        IINTERACTIONS_MANAGER_TOKEN,
        ParamsResolverService,
        DiscordEventManager,
        IDISCORD_EVENT_MANAGER_TOKEN,
        ICOMMAND_HANDLER_TOKEN,
        IBUTTON_HANDLER_TOKEN,
        ISELECT_MENU_HANDLER_TOKEN,
        IMODAL_HANDLER_TOKEN
    ]
})
export class ClientModule {}
