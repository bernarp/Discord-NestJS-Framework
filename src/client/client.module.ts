import {Global, Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {DiscoveryModule} from '@nestjs/core';
import {BotClient} from './client.js';
import {discordOptionsProvider} from '@client/discord-options-intents.js';
import {ICLIENT_TOKEN} from '@/client/client.token.js';

import {InteractionsManager} from './interactions-manager.js';
import {CommandInteractionHandler} from './interactions/command-interaction.handler.js';
import {ButtonInteractionHandler} from './interactions/button-interaction.handler.js';
import {SelectMenuInteractionHandler} from './interactions/select-menu-interaction.handler.js';
import {ModalInteractionHandler} from './interactions/modal-interaction.handler.js';
import {SlashCommandRegistrationService} from './register-slash-commands.js';
import {
    ICOMMAND_HANDLER_TOKEN,
    IBUTTON_HANDLER_TOKEN,
    ISELECT_MENU_HANDLER_TOKEN,
    IMODAL_HANDLER_TOKEN,
    IINTERACTIONS_MANAGER_TOKEN
} from '@/client/client.token.js';

/**
 * Global module responsible for managing the Discord Client lifecycle.
 * Exports both the BotClient class and the ICLIENT_TOKEN for flexible Dependency Injection.
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
        {
            provide: ICLIENT_TOKEN,
            useExisting: BotClient
        },
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
        {
            provide: IINTERACTIONS_MANAGER_TOKEN,
            useExisting: InteractionsManager
        }
    ],
    exports: [
        BotClient,
        ICLIENT_TOKEN,
        InteractionsManager,
        CommandInteractionHandler,
        ButtonInteractionHandler,
        SelectMenuInteractionHandler,
        ModalInteractionHandler,
        ICOMMAND_HANDLER_TOKEN,
        IBUTTON_HANDLER_TOKEN,
        ISELECT_MENU_HANDLER_TOKEN,
        IMODAL_HANDLER_TOKEN,
        IINTERACTIONS_MANAGER_TOKEN
    ]
})
export class ClientModule {}
