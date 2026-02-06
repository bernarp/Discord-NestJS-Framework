import {Injectable} from '@nestjs/common';
import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Colors,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    AttachmentBuilder,
    FileBuilder
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

import {ComponentType} from '../enums/component-type.enum.js';
import {StatusType} from '../enums/status-type.enum.js';
import {IOrderedComponent} from '../interfaces/ordered-component.interface.js';

/**
 * @class ComponentContainerBuilder
 * @description Builder for creating complex component containers with preserved ordering.
 * Supports V2 Discord components.
 */
export class ComponentContainerBuilder {
    private _container: ContainerBuilder;
    private _orderedComponents: IOrderedComponent[] = [];
    private _orderCounter: number = 0;

    constructor() {
        this._container = new ContainerBuilder();
    }

    /**
     * Sets the accent color of the container.
     * @param {number} color - Color code.
     * @returns {this}
     */
    public setColor(color: number): this {
        this._container.setAccentColor(color);
        return this;
    }

    /**
     * Adds a header (Markdown heading).
     * @param {string} text - Header text.
     * @param {1 | 2 | 3} [level=1] - Heading level.
     * @returns {this}
     */
    public addHeading(text: string, level: 1 | 2 | 3 = 1): this {
        const prefix = '#'.repeat(level);
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`${prefix} ${text}`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds simple text.
     * @param {string} text - The text to add.
     * @returns {this}
     */
    public addText(text: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(text),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds bold text.
     * @param {string} text - The text to add.
     * @returns {this}
     */
    public addBoldText(text: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`**${text}**`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds italic text.
     * @param {string} text - The text to add.
     * @returns {this}
     */
    public addItalicText(text: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`*${text}*`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds strikethrough text.
     * @param {string} text - The text to add.
     * @returns {this}
     */
    public addStrikethroughText(text: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`~~${text}~~`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds underlined text.
     * @param {string} text - The text to add.
     * @returns {this}
     */
    public addUnderlineText(text: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`__${text}__`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a list (ordered or unordered).
     * @param {string[]} items - List items.
     * @param {boolean} [ordered=false] - Whether the list should be numbered.
     * @returns {this}
     */
    public addList(items: string[], ordered: boolean = false): this {
        const listContent = items
            .map((item, index) => {
                const prefix = ordered ? `${index + 1}.` : '-';
                return `${prefix} ${item}`;
            })
            .join('\n');
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(listContent),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a separator component.
     * @param {SeparatorSpacingSize} [spacing=SeparatorSpacingSize.Small] - Vertical spacing.
     * @param {boolean} [divider=true] - Whether to show a visual line.
     * @returns {this}
     */
    public addSeparator(spacing: SeparatorSpacingSize = SeparatorSpacingSize.Small, divider: boolean = true): this {
        this._orderedComponents.push({
            type: ComponentType.SEPARATOR,
            component: new SeparatorBuilder().setSpacing(spacing).setDivider(divider),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Alias for adding a divider separator.
     * @param {SeparatorSpacingSize} [spacing=SeparatorSpacingSize.Small] - Vertical spacing.
     * @returns {this}
     */
    public addDivider(spacing: SeparatorSpacingSize = SeparatorSpacingSize.Small): this {
        return this.addSeparator(spacing, true);
    }

    /**
     * Adds a field (key-value pair).
     * @param {string} key - Field label.
     * @param {string} value - Field value.
     * @returns {this}
     */
    public addField(key: string, value: string): this {
        const content = `**${key}**\n${value}`;
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(content),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds multiple fields.
     * @param {Array<{key: string; value: string}>} fields - List of fields.
     * @returns {this}
     */
    public addFields(fields: Array<{key: string; value: string}>): this {
        const content = fields.map(field => `**${field.key}**\n${field.value}`).join('\n\n');
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(content),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a code block.
     * @param {string} code - Code content.
     * @param {string} [language=''] - Code language for syntax highlighting.
     * @returns {this}
     */
    public addCodeBlock(code: string, language: string = ''): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`\`\`\`${language}\n${code}\n\`\`\``),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds inline code.
     * @param {string} code - The code snippet.
     * @returns {this}
     */
    public addInlineCode(code: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`\`${code}\``),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a Markdown link.
     * @param {string} text - Link text.
     * @param {string} url - Target URL.
     * @returns {this}
     */
    public addLink(text: string, url: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`[${text}](${url})`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a role mention.
     * @param {string} roleId - Discord Role ID.
     * @param {string} [additionalText] - Text to append after mention.
     * @returns {this}
     */
    public addRoleMention(roleId: string, additionalText?: string): this {
        const content = additionalText ? `<@&${roleId}> ${additionalText}` : `<@&${roleId}>`;
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(content),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a user mention.
     * @param {string} userId - Discord User ID.
     * @param {string} [additionalText] - Text to append after mention.
     * @returns {this}
     */
    public addUserMention(userId: string, additionalText?: string): this {
        const content = additionalText ? `<@${userId}> ${additionalText}` : `<@${userId}>`;
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(content),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds text with an emoji prefix.
     * @param {string} emoji - The emoji to add.
     * @param {string} text - The text to add.
     * @returns {this}
     */
    public addTextWithEmoji(emoji: string, text: string): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`${emoji} ${text}`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a formatted Discord timestamp.
     * @param {Date} timestamp - The date object.
     * @param {'t' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'} [format='F'] - Discord timestamp format.
     * @returns {this}
     */
    public addTimestamp(timestamp: Date, format: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R' = 'F'): this {
        const unixTime = Math.floor(timestamp.getTime() / 1000);
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent(`<t:${unixTime}:${format}>`),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds an empty line for spacing.
     * @returns {this}
     */
    public addEmptyLine(): this {
        this._orderedComponents.push({
            type: ComponentType.TEXT,
            component: new TextDisplayBuilder().setContent('\u200B'),
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds an ActionRow containing buttons.
     * @param {ActionRowBuilder<ButtonBuilder>} actionRow - The row to add.
     * @returns {this}
     */
    public addActionRowComponents(actionRow: ActionRowBuilder<ButtonBuilder>): this {
        this._orderedComponents.push({
            type: ComponentType.ACTION_ROW,
            component: actionRow,
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds an ActionRow containing a select menu.
     * @param {ActionRowBuilder<StringSelectMenuBuilder>} actionRow - The row to add.
     * @returns {this}
     */
    public addSelectMenuRow(actionRow: ActionRowBuilder<StringSelectMenuBuilder>): this {
        this._orderedComponents.push({
            type: ComponentType.SELECT_MENU,
            component: actionRow,
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a file from a Buffer.
     * @param {Buffer} buffer - File content.
     * @param {string} filename - Output filename.
     * @param {string} [description] - File description.
     * @returns {this}
     */
    public addFileFromBuffer(buffer: Buffer, filename: string, description?: string): this {
        const attachment = new AttachmentBuilder(buffer, {
            name: filename,
            description
        });

        const url = `attachment://${filename}`;

        this._orderedComponents.push({
            type: ComponentType.FILE,
            component: {attachment, url},
            order: this._orderCounter++
        });
        return this;
    }

    /**
     * Adds a file from a local path.
     * @param {string} filePath - Path to file.
     * @param {string} [filename] - Output filename.
     * @param {string} [description] - File description.
     * @returns {this}
     */
    public addFileFromPath(filePath: string, filename?: string, description?: string): this {
        const actualFilename = filename || path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);

        return this.addFileFromBuffer(fileContent, actualFilename, description);
    }

    /**
     * Adds a file from a string content.
     * @param {string} content - Text content.
     * @param {string} filename - Output filename.
     * @param {string} [description] - File description.
     * @returns {this}
     */
    public addFileFromString(content: string, filename: string, description?: string): this {
        const buffer = Buffer.from(content, 'utf-8');
        return this.addFileFromBuffer(buffer, filename, description);
    }

    /**
     * Builds the final container and attachment list.
     * @returns {{container: ContainerBuilder; files: AttachmentBuilder[]}}
     */
    public build(): {container: ContainerBuilder; files: AttachmentBuilder[]} {
        const sorted = [...this._orderedComponents].sort((a, b) => a.order - b.order);
        let currentTextBatch: TextDisplayBuilder[] = [];
        const files: AttachmentBuilder[] = [];

        for (const item of sorted) {
            if (item.type === ComponentType.TEXT) {
                currentTextBatch.push(item.component as TextDisplayBuilder);
            } else {
                if (currentTextBatch.length > 0) {
                    this._container.addTextDisplayComponents(...currentTextBatch);
                    currentTextBatch = [];
                }

                if (item.type === ComponentType.FILE) {
                    const fileData = item.component as {attachment: AttachmentBuilder; url: string};
                    files.push(fileData.attachment);
                    this._container.addFileComponents(new FileBuilder().setURL(fileData.url));
                } else if (item.type === ComponentType.SEPARATOR) {
                    this._container.addSeparatorComponents(item.component as SeparatorBuilder);
                } else if (item.type === ComponentType.ACTION_ROW) {
                    this._container.addActionRowComponents(item.component as ActionRowBuilder<ButtonBuilder>);
                } else if (item.type === ComponentType.SELECT_MENU) {
                    // Type casting for V2 compatibility
                    this._container.addActionRowComponents(item.component as any as ActionRowBuilder<ButtonBuilder>);
                }
            }
        }

        if (currentTextBatch.length > 0) {
            this._container.addTextDisplayComponents(...currentTextBatch);
        }

        return {container: this._container, files};
    }

    /**
     * Resets the builder state.
     * @returns {this}
     */
    public reset(): this {
        this._container = new ContainerBuilder();
        this._orderedComponents = [];
        this._orderCounter = 0;
        return this;
    }
}

/**
 * @class AdvancedComponentFactory
 * @description Advanced factory for creating Discord V2 components using the Builder pattern.
 */
@Injectable()
export class AdvancedComponentFactory {
    /**
     * @method createContainer
     * @description Creates a new ComponentContainerBuilder instance.
     * @returns {ComponentContainerBuilder}
     */
    public createContainer(): ComponentContainerBuilder {
        return new ComponentContainerBuilder();
    }

    /**
     * @method createSimpleContainer
     * @description Quickly creates a simple text container.
     * @param {string} text - Message text.
     * @param {number} [color] - Accent color.
     * @returns {{container: ContainerBuilder; files: AttachmentBuilder[]}}
     */
    public createSimpleContainer(text: string, color?: number): {container: ContainerBuilder; files: AttachmentBuilder[]} {
        const builder = this.createContainer().addText(text);
        if (color !== undefined) builder.setColor(color);
        return builder.build();
    }

    /**
     * @method createStatusContainer
     * @description Creates a status notification container.
     * @param {StatusType} type - Notification type.
     * @param {string} message - Content message.
     * @returns {{container: ContainerBuilder; files: AttachmentBuilder[]}}
     */
    public createStatusContainer(type: StatusType, message: string): {container: ContainerBuilder; files: AttachmentBuilder[]} {
        const config = {
            [StatusType.SUCCESS]: {emoji: '✅', color: Colors.Green},
            [StatusType.ERROR]: {emoji: '❌', color: Colors.Red},
            [StatusType.WARNING]: {emoji: '⚠️', color: Colors.Orange},
            [StatusType.INFO]: {emoji: 'ℹ️', color: Colors.Blue}
        };

        const {emoji, color} = config[type];
        return this.createContainer().setColor(color).addTextWithEmoji(emoji, message).build();
    }

    /**
     * @method createButton
     * @description Creates a configured ButtonBuilder.
     * @param {string} customId - Button identifier.
     * @param {string} label - Button label.
     * @param {ButtonStyle} [style=ButtonStyle.Primary] - Button style.
     * @param {object} [options] - Additional options.
     * @param {string} [options.emoji] - Button emoji.
     * @param {boolean} [options.disabled] - Whether button is disabled.
     * @returns {ButtonBuilder}
     */
    public createButton(customId: string, label: string, style: ButtonStyle = ButtonStyle.Primary, options?: {emoji?: string; disabled?: boolean}): ButtonBuilder {
        const button = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
        if (options?.emoji) button.setEmoji(options.emoji);
        if (options?.disabled) button.setDisabled(options.disabled);
        return button;
    }

    /**
     * @method createLinkButton
     * @description Creates a link ButtonBuilder.
     * @param {string} label - Button label.
     * @param {string} url - Target URL.
     * @param {string} [emoji] - Button emoji.
     * @returns {ButtonBuilder}
     */
    public createLinkButton(label: string, url: string, emoji?: string): ButtonBuilder {
        const button = new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(url);
        if (emoji) button.setEmoji(emoji);
        return button;
    }

    /**
     * @method createButtonRow
     * @description Creates an ActionRow with buttons.
     * @param {ButtonBuilder[]} buttons - Array of buttons.
     * @returns {ActionRowBuilder<ButtonBuilder>}
     */
    public createButtonRow(buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
    }

    /**
     * @method createButtonRows
     * @description Creates multiple ActionRows with buttons, split by buttonsPerRow.
     * @param {ButtonBuilder[]} buttons - Array of buttons.
     * @param {number} [buttonsPerRow=5] - Maximum buttons per row.
     * @returns {ActionRowBuilder<ButtonBuilder>[]}
     */
    public createButtonRows(buttons: ButtonBuilder[], buttonsPerRow: number = 5): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        for (let i = 0; i < buttons.length; i += buttonsPerRow) {
            const chunk = buttons.slice(i, i + buttonsPerRow);
            rows.push(this.createButtonRow(chunk));
        }
        return rows;
    }

    /**
     * @method createSelectMenu
     * @description Creates an ActionRow with a Select Menu.
     * @param {string} customId - Menu identifier.
     * @param {string} placeholder - Menu placeholder text.
     * @param {Array<{label: string; value: string; description?: string; emoji?: string}>} options - Menu options.
     * @returns {ActionRowBuilder<StringSelectMenuBuilder>}
     */
    public createSelectMenu(customId: string, placeholder: string, options: Array<{label: string; value: string; description?: string; emoji?: string}>): ActionRowBuilder<StringSelectMenuBuilder> {
        const selectOptions = options.map(opt => {
            const option = new StringSelectMenuOptionBuilder().setLabel(opt.label).setValue(opt.value);
            if (opt.description) option.setDescription(opt.description);
            if (opt.emoji) option.setEmoji(opt.emoji);
            return option;
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .addOptions(...selectOptions);
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    }

    /**
     * @method createFileComponent
     * @description Creates a FileBuilder component.
     * @param {string} attachmentUrl - URL of the attachment.
     * @returns {FileBuilder}
     */
    public createFileComponent(attachmentUrl: string): FileBuilder {
        return new FileBuilder().setURL(attachmentUrl);
    }

    /**
     * @method createAttachment
     * @description Creates an AttachmentBuilder.
     * @param {Buffer | string} data - File content.
     * @param {string} name - Filename.
     * @param {object} [options] - Additional options.
     * @param {string} [options.description] - File description.
     * @returns {AttachmentBuilder}
     */
    public createAttachment(data: Buffer | string, name: string, options?: {description?: string}): AttachmentBuilder {
        const attachment = new AttachmentBuilder(data, {name});
        if (options?.description) attachment.setDescription(options.description);
        return attachment;
    }
}
