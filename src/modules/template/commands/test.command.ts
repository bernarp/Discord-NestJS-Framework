import {ChatInputCommandInteraction, User, Role, BaseChannel, MessageFlags, Attachment} from 'discord.js';
import {OptionType} from '@client/enums/command-option.enum.js';
import {CommandSlash, SubCommand, Option, Interaction} from '@/common/decorators/index.js';
import {ICommand} from '@/client/interfaces/command.interface.js';
import {CommandRegistrationType} from '@/client/enums/command-registration-type.enum.js';
import {Injectable} from '@nestjs/common';

/**
 * Command for testing Smart Option resolution and architectural patterns.
 */
@Injectable()
@CommandSlash({
    name: 'test',
    description: 'Architecture test commands',
    registration: CommandRegistrationType.GUILD
})
export class TestCommand implements ICommand {
    public readonly name = 'test';

    /**
     * Entry point for /test command.
     */
    public async execute(@Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: 'Use `/test smart` to test smart options.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    /**
     * Tests automatic object resolution for complex Discord types.
     * OPTIONS ARE DISCOVERED AUTOMATICALLY! No manual 'options' array needed.
     */
    @SubCommand({
        name: 'smart',
        description: 'Test automatic object resolution with auto-discovery'
    })
    public async onSmart(
        @Option({name: 'user', description: 'Target user', required: false}) user?: User,
        @Option({name: 'role', description: 'Target role', required: false}) role?: Role,
        @Option({name: 'channel', description: 'Target channel', required: false}) channel?: BaseChannel,
        @Option({name: 'file', description: 'Target file', required: false}) file?: Attachment,
        @Option({name: 'count', description: 'Simple number', type: OptionType.Integer, required: false}) count?: number,
        @Interaction() interaction?: ChatInputCommandInteraction
    ): Promise<void> {
        const results = [
            `**Smart Auto-Discovery Results:**`,
            `- User: ${user ? `${user.tag} (${user.id})` : 'N/A'}`,
            `- Role: ${role ? `${role.name} (${role.id})` : 'N/A'}`,
            `- Channel: ${channel ? `${(channel as any).name ?? 'Unknown'} (${channel.type})` : 'N/A'}`,
            `- File: ${file ? `${file.name} (${file.size} bytes)` : 'N/A'}`,
            `- Count: ${count !== undefined ? count : 'N/A'} (Type: ${typeof count})`
        ];
        if (!interaction) return;
        await interaction.reply({
            content: results.join('\n'),
            flags: [MessageFlags.Ephemeral]
        });
    }
}
