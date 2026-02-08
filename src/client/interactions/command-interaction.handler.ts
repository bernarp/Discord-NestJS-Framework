import { Injectable, Inject } from '@nestjs/common';
import { ChatInputCommandInteraction, AutocompleteInteraction, Interaction } from 'discord.js';
import { AbstractInteractionHandler } from './base/abstract-interaction.handler.js';
import { ICommandHandler } from '../interfaces/command-handler.interface.js';
import { ICommand } from '../interfaces/command.interface.js';
import { LOG } from '@/common/_logger/constants/LoggerConfig.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';
import { ParamsResolverService } from './params-resolver.service.js';
import { InteractionMethod } from '../enums/interaction-method.enum.js';
import { SUBCOMMAND_METADATA, DEFER_METADATA, EPHEMERAL_METADATA } from '@/common/decorators/keys.js';
import type { DeferOptions } from '@/common/decorators/defer.decorator.js';

/**
 * @class CommandInteractionHandler
 * @extends AbstractInteractionHandler
 * @implements ICommandHandler
 * @description Specialized handler for processing all Discord application commands (slash commands).
 * Handles command discovery, registration, lifecycle management (defer/ephemeral),
 * automatic subcommand routing, and parameter injection.
 */
@Injectable()
export class CommandInteractionHandler extends AbstractInteractionHandler<ChatInputCommandInteraction | AutocompleteInteraction, ICommand> implements ICommandHandler {
    /**
     * @private
     * @readonly
     * @type {Map<string, Map<string, string>>}
     * @description Cached map of command names to their subcommand-to-method mappings.
     */
    private readonly _subCommandMaps = new Map<string, Map<string, string>>();

    /**
     * @constructor
     * @param {ILogger} logger - Custom logger instance.
     * @param {ParamsResolverService} _paramsResolver - Service for resolving decorated method arguments.
     */
    constructor(
        @Inject(LOG.LOGGER) logger: ILogger,
        private readonly _paramsResolver: ParamsResolverService
    ) {
        super(logger);
    }

    /**
     * @public
     * @param {Interaction} interaction - The Discord interaction object.
     * @returns {boolean} True if the interaction is a slash command or autocomplete request.
     * @description Determines if this handler can process the given interaction.
     */
    public supports(interaction: Interaction): boolean {
        return interaction.isChatInputCommand() || interaction.isAutocomplete();
    }

    /**
     * @public
     * @override
     * @param {ChatInputCommandInteraction | AutocompleteInteraction} interaction - The command interaction.
     * @returns {Promise<void>}
     * @description Orchestrates the execution of a command or autocomplete request.
     */
    public override async execute(interaction: ChatInputCommandInteraction | AutocompleteInteraction): Promise<void> {
        if (interaction.isAutocomplete()) {
            await this.handleAutocomplete(interaction);
            return;
        }
        await super.execute(interaction as ChatInputCommandInteraction);
    }

    /**
     * @public
     * @param {ICommand} command - The command entity to register.
     * @returns {void}
     * @description Registers a command in the framework registry and scans it for subcommand metadata.
     */
    public registerCommand(command: ICommand): void {
        this.register(command);
        const subCommandMap = new Map<string, string>();
        const prototype = Object.getPrototypeOf(command);
        const propertyNames = Object.getOwnPropertyNames(prototype);
        for (const methodName of propertyNames) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
            if (!descriptor || typeof descriptor.value !== 'function' || methodName === 'constructor') {
                continue;
            }
            const subCommandMeta = Reflect.getMetadata(SUBCOMMAND_METADATA, command.constructor, methodName);
            if (subCommandMeta && subCommandMeta.name) {
                subCommandMap.set(subCommandMeta.name, methodName);
            }
        }
        if (subCommandMap.size > 0) {
            this._subCommandMaps.set(command.name, subCommandMap);
        }
        this._logger.debug(`Registered entity command: ${command.name}${subCommandMap.size > 0 ? ` with ${subCommandMap.size} subcommands` : ''}`);
    }

    /**
     * @protected
     * @override
     * @param {ICommand} command - The command entity.
     * @returns {string} The name of the command.
     * @description Returns the key used for command registration.
     */
    protected getEntityKey(command: ICommand): string {
        return command.name;
    }

    /**
     * @protected
     * @override
     * @param {ChatInputCommandInteraction | AutocompleteInteraction} interaction - The interaction.
     * @returns {string} The name of the command triggered by Discord.
     * @description Returns the key from the interaction to match against the registry.
     */
    protected getInteractionKey(interaction: ChatInputCommandInteraction | AutocompleteInteraction): string {
        return interaction.commandName;
    }

    /**
     * @protected
     * @override
     * @param {ChatInputCommandInteraction | AutocompleteInteraction} interaction - The interaction.
     * @param {ICommand} command - The matched command instance.
     * @returns {Promise<void>}
     * @description Hook executed before the main command logic. Handles automatic deferring and ephemeral responses.
     */
    protected override async preExecute(interaction: ChatInputCommandInteraction | AutocompleteInteraction, command: ICommand): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        const subCommandName = interaction.options.getSubcommand(false);
        const methodName = this.resolveMethodName(interaction.commandName, subCommandName);
        const isEphemeral = Reflect.getMetadata(EPHEMERAL_METADATA, command.constructor, methodName) === true || Reflect.getMetadata(EPHEMERAL_METADATA, command.constructor) === true;
        const deferOptions: DeferOptions | undefined = Reflect.getMetadata(DEFER_METADATA, command.constructor, methodName);
        if (deferOptions) {
            await interaction.deferReply({
                ephemeral: deferOptions.ephemeral ?? isEphemeral
            });
        }
    }

    /**
     * @protected
     * @override
     * @param {ChatInputCommandInteraction | AutocompleteInteraction} interaction - The interaction.
     * @param {ICommand} command - The command instance.
     * @returns {Promise<void>}
     * @description Main execution hook. Resolves arguments and invokes the target command (or subcommand) method.
     */
    protected override async processEntity(interaction: ChatInputCommandInteraction | AutocompleteInteraction, command: ICommand): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        const subCommandName = interaction.options.getSubcommand(false);
        const methodName = this.resolveMethodName(interaction.commandName, subCommandName);
        const args = await this._paramsResolver.resolveArguments(command, methodName, interaction);
        await (command as any)[methodName](...args);
    }

    /**
     * @private
     * @param {AutocompleteInteraction} interaction - The autocomplete interaction.
     * @returns {Promise<void>}
     * @description Handles Discord autocomplete requests by delegating to the command's autocomplete method.
     */
    private async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const command = this._registry.get(interaction.commandName);
        if (command && command.autocomplete) {
            const args = await this._paramsResolver.resolveArguments(command, InteractionMethod.AUTOCOMPLETE, interaction);
            await command.autocomplete(...args);
        }
    }

    /**
     * @private
     * @param {string} commandName - The root command name.
     * @param {string | null} subCommandName - The subcommand name if present.
     * @returns {string} The name of the method to be invoked.
     * @description Resolves the actual class method name for a given command/subcommand combination.
     */
    private resolveMethodName(commandName: string, subCommandName: string | null): string {
        if (subCommandName) {
            const commandMap = this._subCommandMaps.get(commandName);
            if (commandMap && commandMap.has(subCommandName)) {
                return commandMap.get(subCommandName)!;
            }
        }
        return InteractionMethod.EXECUTE;
    }
}
