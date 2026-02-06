# UI Module

The UI Module provides a high-level abstraction layer over `discord.js` for constructing **Discord Components V2** interfaces. It exports the `AdvancedComponentFactory` service, which utilizes the Builder pattern to ensure the sequential rendering of message components.

## Installation

The module is global (`@Global`). Inject `AdvancedComponentFactory` via the constructor in your services.

```typescript
import { AdvancedComponentFactory } from '@/client/ui/services/advanced-component-factory.service';

@Injectable()
export class YourService {
  constructor(private readonly _uiFactory: AdvancedComponentFactory) {}
}
```

## Usage

### 1. Complex Message Construction

Use `createContainer()` to initialize a `ComponentContainerBuilder`. Methods execute in the order called, preserving the visual layout.

```typescript
import { SeparatorSpacingSize } from 'discord.js';

public createReport(data: any) {
  const { container, files } = this._uiFactory.createContainer()
    .setColor(0x00FF00)
    .addHeading('System Report', 1)
    .addText('Below is the summary of the daily operation.')
    .addSeparator(SeparatorSpacingSize.Small)
    .addFields([
      { key: 'Status', value: 'Online' },
      { key: 'Uptime', value: '24h' }
    ])
    .addCodeBlock(JSON.stringify(data), 'json')
    .build();

  return { 
    components: [container], 
    files: files 
  };
}
```

### 2. Interactive Components

Buttons and Select Menus are created via factory methods and attached to the container.

```typescript
import { ButtonStyle } from 'discord.js';

public createMenu() {
  const btn = this._uiFactory.createButton('id_1', 'Confirm', ButtonStyle.Success);
  const row = this._uiFactory.createButtonRow([btn]);

  const { container } = this._uiFactory.createContainer()
    .addText('Please confirm action:')
    .addActionRowComponents(row)
    .build();

  return { components: [container] };
}
```

### 3. File Attachments

The builder manages `AttachmentBuilder` instances internally and links them to the message components using `attachment://` URLs.

```typescript
const { container, files } = this._uiFactory.createContainer()
  .addHeading('Logs', 2)
  .addFileFromPath('./logs/error.log', 'error.log', 'Error Logs')
  .build();
```

---

## API Reference: ComponentContainerBuilder

The `ComponentContainerBuilder` class implements a fluent interface. All methods (except `build`) return `this`.

### Text & Formatting

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `addHeading` | `text: string`<br>`level: 1\|2\|3` (default: 1) | Adds a Markdown header (`#`, `##`, `###`). |
| `addText` | `text: string` | Adds a standard text block. |
| `addBoldText` | `text: string` | Adds text wrapped in `**`. |
| `addItalicText` | `text: string` | Adds text wrapped in `*`. |
| `addStrikethroughText` | `text: string` | Adds text wrapped in `~~`. |
| `addUnderlineText` | `text: string` | Adds text wrapped in `__`. |
| `addList` | `items: string[]`<br>`ordered: boolean` (default: false) | Creates a bulleted (`-`) or ordered (`1.`) list. |
| `addCodeBlock` | `code: string`<br>`language: string` (optional) | Encapsulates text in a multiline code block (\`\`\`). |
| `addInlineCode` | `code: string` | Encapsulates text in an inline code block (\`). |
| `addLink` | `text: string`, `url: string` | Creates a Markdown link `[text](url)`. |
| `addTextWithEmoji` | `emoji: string`, `text: string` | Prepends an emoji to the text string. |
| `addTimestamp` | `timestamp: Date`<br>`format` (default: 'F') | Adds a Discord timestamp (e.g., `<t:1234:F>`). |
| `addEmptyLine` | - | Adds a block containing a zero-width space (`\u200B`). |

### Structure & Layout

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `setColor` | `color: number` | Sets the accent color (sidebar) of the container. |
| `addSeparator` | `spacing: SeparatorSpacingSize`<br>`divider: boolean` | Adds a vertical spacer or visible divider line. |
| `addDivider` | `spacing: SeparatorSpacingSize` | Shorthand for `addSeparator(spacing, true)`. |
| `addField` | `key: string`, `value: string` | Adds a key-value pair formatted as `**Key**\nValue`. |
| `addFields` | `fields: Array<{key, value}>` | Adds multiple key-value pairs sequentially. |

### Mentions

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `addRoleMention` | `roleId: string`<br>`additionalText?: string` | Adds `<@&roleId>` optionally followed by text. |
| `addUserMention` | `userId: string`<br>`additionalText?: string` | Adds `<@userId>` optionally followed by text. |

### Interaction & Components

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `addActionRowComponents` | `actionRow: ActionRowBuilder` | Appends a row of interactive components (Buttons). |
| `addSelectMenuRow` | `actionRow: ActionRowBuilder` | Appends a row containing a Select Menu. |

### Files & Attachments

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `addFileFromBuffer` | `buffer: Buffer`, `filename: string`<br>`description?: string` | Creates an attachment from a buffer. |
| `addFileFromPath` | `filePath: string`, `filename?: string`<br>`description?: string` | Reads a file from the disk and creates an attachment. |
| `addFileFromString` | `content: string`, `filename: string`<br>`description?: string` | Converts a string to a buffer and creates an attachment. |

### Lifecycle

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `build` | - | Compiles the builder state. Returns `{ container: ContainerBuilder, files: AttachmentBuilder[] }`. |
| `reset` | - | Clears all components and resets the internal order counter. |