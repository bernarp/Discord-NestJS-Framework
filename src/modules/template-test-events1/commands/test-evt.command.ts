import {ChatInputCommandInteraction, MessageFlags} from 'discord.js';
import {Injectable, Inject} from '@nestjs/common';
import {CommandSlash, Emits} from '@/common/decorators/index.js';
import {ICommand} from '@/client/interfaces/command.interface.js';
import {CommandRegistrationType} from '@/client/enums/command-registration-type.enum.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Command to trigger the EDA test flow:
 * Module A -> Module B -> Module A
 */
@CommandSlash({
    name: 'testevt',
    description: 'Test EDA flow: Module A -> Module B -> Module A',
    registration: CommandRegistrationType.GUILD
})
@Injectable()
export class TestEvtCommand implements ICommand {
    public readonly name = 'testevt';

    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Executes the command and emits the initial event.
     * The @Emits decorator will wrap the return value and propagate the Correlation ID.
     */
    @Emits(Events.TEST_INIT)
    public async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        await interaction.reply({
            content: '**EDA Flow Started!** Check the console/logs for the trace.',
            flags: [MessageFlags.Ephemeral]
        });
        return {
            message: 'Hello from Module A!',
            triggeredBy: interaction.user.tag,
            timestamp: Date.now()
        };
    }
}
