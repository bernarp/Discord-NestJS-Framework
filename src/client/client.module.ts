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
    IDISCORD_INTERACTION_HANDLERS_TOKEN,
    ICLIENT_LIFECYCLE_TOKEN,
    ICLIENT_PRESENCE_TOKEN,
    IGATEWAY_MONITOR_TOKEN,
    IINTERACTION_LISTENER_TOKEN
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
import {ClientLifecycleService} from './services/client-lifecycle.service.js';
import {ClientPresenceService} from './services/client-presence.service.js';
import {GatewayMonitorService} from './services/gateway-monitor.service.js';
import {InteractionListenerService} from './services/interaction-listener.service.js';

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
        ClientLifecycleService,
        ClientPresenceService,
        GatewayMonitorService,
        InteractionListenerService,
        {
            provide: ICLIENT_TOKEN,
            useExisting: BotClient
        },
        {
            provide: ICLIENT_LIFECYCLE_TOKEN,
            useExisting: ClientLifecycleService
        },
        {
            provide: ICLIENT_PRESENCE_TOKEN,
            useExisting: ClientPresenceService
        },
        {
            provide: IGATEWAY_MONITOR_TOKEN,
            useExisting: GatewayMonitorService
        },
        {
            provide: IINTERACTION_LISTENER_TOKEN,
            useExisting: InteractionListenerService
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
        // Primary Registry: Collective interaction handlers array
        {
            provide: IDISCORD_INTERACTION_HANDLERS_TOKEN,
            useFactory: (
                commandHandler: CommandInteractionHandler,
                buttonHandler: ButtonInteractionHandler,
                selectMenuHandler: SelectMenuInteractionHandler,
                modalHandler: ModalInteractionHandler
            ) => {
                return [commandHandler, buttonHandler, selectMenuHandler, modalHandler];
            },
            inject: [CommandInteractionHandler, ButtonInteractionHandler, SelectMenuInteractionHandler, ModalInteractionHandler]
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
        IMODAL_HANDLER_TOKEN,
        ICLIENT_LIFECYCLE_TOKEN,
        ICLIENT_PRESENCE_TOKEN,
        IGATEWAY_MONITOR_TOKEN,
        IINTERACTION_LISTENER_TOKEN
    ]
})
export class ClientModule {}
