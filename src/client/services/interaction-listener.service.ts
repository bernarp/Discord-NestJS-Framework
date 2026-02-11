import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import * as discord from 'discord.js';
import {Client} from '@/common/decorators/client.decorator.js';
import {IINTERACTIONS_MANAGER_TOKEN} from '@/client/client.token.js';
import type {IClient} from '@/client/interfaces/client.interface.js';
import {IInteractionListener} from '@/client/interfaces/interaction-listener.interface.js';
import {InteractionsManager} from '../interactions-manager.js';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {randomUUID} from 'crypto';

/**
 * Service that listens for and orbits interaction events.
 * Wraps every interaction in a RequestContext for logging and correlation.
 */
@Injectable()
export class InteractionListenerService implements IInteractionListener, OnModuleInit {
    /**
     * @param _client - The low-level Discord client wrapper.
     * @param _interactionsManager - Central manager for interaction routing.
     * @param _requestContext - Service for managing correlation IDs and scope.
     */
    constructor(
        @Client() private readonly _client: IClient,
        @Inject(IINTERACTIONS_MANAGER_TOKEN) private readonly _interactionsManager: InteractionsManager,
        private readonly _requestContext: RequestContextService
    ) {}

    /**
     * NestJS Lifecycle Hook: Attaches interaction listener automatically.
     */
    public onModuleInit(): void {
        this.init();
    }

    /** @inheritdoc */
    public init(): void {
        this._client.instance.on(discord.Events.InteractionCreate, (interaction: discord.Interaction) => {
            const correlationId = randomUUID();
            this._requestContext.run({correlationId}, () => {
                this._interactionsManager.handleInteraction(interaction);
            });
        });
    }
}
