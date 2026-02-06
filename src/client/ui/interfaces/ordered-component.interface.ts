import {TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, AttachmentBuilder} from 'discord.js';
import {ComponentType} from '../enums/component-type.enum.js';

/**
 * Interface for maintaining the order of components within a container.
 */
export interface IOrderedComponent {
    /**
     * Type of the UI component.
     */
    type: ComponentType;

    /**
     * The actual builder or data for the component.
     */
    component: TextDisplayBuilder | SeparatorBuilder | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder> | {attachment: AttachmentBuilder; url: string};

    /**
     * Order of the component in the final container.
     */
    order: number;
}
