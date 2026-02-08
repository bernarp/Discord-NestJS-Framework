# Client

This module implements an abstraction layer over `discord.js` to manage the Discord Gateway connection, REST API interactions, and event routing.

## Dependency Injection (DI Tokens)

Use these tokens to inject dependencies. Do not import concrete classes directly.

| Token                        | Interface               | Purpose                                                 |
| :--------------------------- | :---------------------- | :------------------------------------------------------ |
| `ICLIENT_TOKEN`              | `IClient`               | Lifecycle management (start/stop) and client status.    |
| `ICOMMAND_HANDLER_TOKEN`     | `ICommandHandler`       | Dynamic command registration and execution.             |
| `IBUTTON_HANDLER_TOKEN`      | `IButtonHandler`        | Button interaction registration.                        |
| `IMODAL_HANDLER_TOKEN`       | `IModalHandler`         | Modal submission registration.                          |
| `ISELECT_MENU_HANDLER_TOKEN` | `ISelectMenuHandler`    | Select menu interaction registration.                   |
| `IDISCORD_EVENT_MANAGER_TOKEN`| `IDiscordEventManager`  | Discord gateway event subscription management.          |

## Slash Commands Implementation

Implement the `ICommand` interface and use the `@CommandSlash` decorator. Metadata is automatically extracted by `SlashCommandRegistrationService` during bootstrap. The framework supports reflection-based parameter injection via decorators and data validation via Pipes.

### Parameter Decorators

| Decorator | Description |
| :--- | :--- |
| `@Option(options, ...pipes)` | Injects a value/object from command options. Supports auto-discovery. |
| `@CurrentUser()` | Injects the `User` object of the command caller. |
| `@CurrentMember()` | Injects the `GuildMember` object of the command caller (Guild only). |
| `@CurrentChannel()` | Injects the `TextChannel` (or other channel type) where the command was used. |
| `@CurrentGuild()` | Injects the `Guild` object where the command was used. |
| `@Client()` | Injects the `Client` instance of the bot. |
| `@Interaction()` | Injects the raw `Interaction` object. |

#### Declarative Option Discovery
The framework uses **Reflection** and **Metadata Scraping** to automatically register slash command options. You no longer need to manually define the `options` array in `@SubCommand`.

- **Auto-Discovery**: `@SubCommand` scans parameters decorated with `@Option` and builds the Discord API schema.
- **Smart Type Mapping**: Based on TypeScript `metatype`, the framework automatically identifies `User`, `Role`, `Attachment`, and `Channel` types.
- **Automatic Sorting**: Discord requires all mandatory options to be placed **before** optional ones. The framework handles this sorting automatically, allowing you to arrange arguments in any order.

#### Option Configuration
The `@Option` decorator accepts either a string (name) or a configuration object:
```typescript
// Simple name only (auto-discovery for type)
@Option('target') user: User

// Full configuration
@Option({
    name: 'count',
    description: 'Number of items',
    required: false,
    type: OptionType.Integer // Explicit type forcing
}) count?: number
```

### Data Transformation & Validation (Pipes)

Pipes are used to transform input data and validate it before it reaches your method. They are asynchronous and support Dependency Injection patterns.

#### Automatic Smart Resolution
If `emitDecoratorMetadata` is enabled, the framework automatically resolves complex objects from the Discord cache/API:
- `User`, `GuildMember`, `Role`, `Attachment` -> Automatically resolved as objects.
- `BaseChannel` (and subclasses) -> Automatically resolved as channel instances.
- `number` -> Automatically applies `ParseFloatPipe`.
- `boolean` -> Automatically applies `ParseBoolPipe`.

#### Built-in Pipes

| Pipe              | Description                                                                 |
| :---------------- | :-------------------------------------------------------------------------- |
| `ParseIntPipe`    | Converts a string/number to an integer. Throws `BotException` on failure.   |
| `ParseFloatPipe`  | Converts a string/number to a float. Throws `BotException` on failure.      |
| `ParseBoolPipe`   | Converts 1/0, "true"/"false" to boolean. Throws `BotException` on failure.  |

### Lifecycle Decorators

Manage the interaction lifecycle (replying, deferring) declaratively.

| Decorator          | Description                                                                          |
| :----------------- | :----------------------------------------------------------------------------------- |
| `@Defer(options?)` | Automatically calls `interaction.deferReply()`. Options: `{ ephemeral: boolean }`. |
| `@Ephemeral()`      | Marks the command or subcommand as ephemeral. Affects `@Defer` and future auto-replies. |

### Advanced Example

```typescript
import {Injectable, Inject} from '@nestjs/common';
import {ChatInputCommandInteraction, User, Guild, GuildMember, TextChannel, Role, Attachment} from 'discord.js';
import {ICommand} from '@/client/interfaces/command.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {OptionType} from '@/client/enums/command-option.enum.js';
import {
    CommandSlash,
    SubCommand,
    Option,
    CurrentUser,
    Interaction,
    CurrentMember,
    CurrentGuild,
    CurrentChannel,
    Defer,
    Ephemeral
} from '@/common/decorators/index.js';

@Injectable()
@CommandSlash({
    name: 'moderation',
    description: 'Server moderation tools',
    registration: CommandRegistrationType.GUILD
})
export class ModerationCommand implements ICommand {
    public readonly name = 'moderation';

    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Options are discovered automatically from @Option decorators.
     * TypeScript types (User, Role, etc.) are resolved into Discord objects.
     */
    @SubCommand({
        name: 'ban',
        description: 'Ban a user from the server'
    })
    public async onBan(
        @Option({name: 'target', description: 'User to ban'}) target: User,
        @Option({name: 'reason', description: 'Ban reason', required: false}) reason?: string,
        @Option({name: 'days', description: 'Delete message history'}) days?: number,
        @Interaction() interaction: ChatInputCommandInteraction
    ): Promise<void> {
        // Logic here...
    }

    /**
     * Example with smart channel and attachment resolution.
     */
    @Defer()
    @SubCommand({
        name: 'announce',
        description: 'Post an announcement'
    })
    public async onAnnounce(
        @Option({name: 'channel', description: 'Target channel'}) channel: TextChannel,
        @Option({name: 'text', description: 'Announcement text'}) text: string,
        @Option({name: 'image', description: 'Optional image', required: false}) image?: Attachment,
        @Interaction() interaction: ChatInputCommandInteraction
    ): Promise<void> {
        // Logic here...
    }
}
```

## Event Listeners

Use `@On` and `@Once` decorators to handle Discord gateway events declaratively. The `DiscordEventDiscoveryService` automatically discovers and registers these listeners during module initialization.

### Event Decorators

| Decorator   | Description                             |
| :---------- | :-------------------------------------- |
| `@On(event)`| Registers a persistent event listener.  |
| `@Once(event)`| Registers a one-time event listener.  |

### Example

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { On, Once } from '@/common/decorators/index.js';
import { Events, Message, Client } from 'discord.js';
import { LOG } from '@/common/_logger/constants/LoggerConfig.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';

@Injectable()
export class ChatListener {
  constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

  @Once(Events.ClientReady)
  public async onReady(client: Client): Promise<void> {
    this._logger.log(`Bot logged in as ${client.user.tag}`);
  }

  @On(Events.MessageCreate)
  public async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    this._logger.debug(`Message in ${message.guild?.name}: ${message.content}`);
  }
}
```

## Public API Reference

### BotClient Methods (`ICLIENT_TOKEN`)

| Method                                      | Return Type           | Description                                                        |
| :------------------------------------------ | :-------------------- | :----------------------------------------------------------------- |
| `isReady` (getter)                          | `boolean`             | Returns `true` if the client is connected and ready.               |
| `start()`                                   | `Promise<void>`       | Initializes the WebSocket connection to the Discord Gateway.        |
| `shutdown()`                                | `Promise<void>`       | Terminates the connection and cleans up resources.                  |
| `getUser()`                                 | `ClientUser \| null`   | Returns the current bot user instance (available after start).      |
| `getPing()`                                 | `number`              | Returns the current WebSocket latency (ms).                        |
| `getStatus()`                               | `string`              | Returns the current connection status string.                      |
| `getInternalUptime()`                       | `number`              | Returns the Discord session uptime in milliseconds.                |
| `setActivity(name, type)`                   | `void`                | Updates the bot's activity (e.g., Playing, Watching).              |
| `setStatus(status)`                         | `void`                | Updates the bot's online status (online, dnd, idle).               |
| `setGlobalErrorHandler(handler)`            | `void`                | Registers a global system error/rate limit interceptor.            |
| `registerEventHandler<K>(event, handler)`   | `void`                | Registers a persistent event handler for the specified event.      |
| `registerEventOnce<K>(event, handler)`      | `void`                | Registers a one-time event handler for the specified event.        |

### Presence & Status Management

You can dynamically manage the bot's appearance through the `IClient` interface.

```typescript
// Set activity to "Watching the server"
client.setActivity('the server', ActivityType.Watching);

// Set status to Do Not Disturb
client.setStatus('dnd');

// Check connectivity
if (client.isReady) {
    console.log(`Uptime: ${client.getInternalUptime()}ms`);
}
```

### Global System Hooks

The framework provides a centralized way to intercept critical system events such as Gateway errors and REST Rate Limits.

```typescript
client.setGlobalErrorHandler((error, context) => {
    console.error(`[System Hook] Context: ${context}`, error);
    
    if (context === 'RateLimit') {
        // Handle rate limit (e.g., notify monitoring, backoff logic)
    }
});
```

**Context Types:**
- `GatewayError`: Critical socket errors or connection failures.
- `GatewayWarning`: Non-fatal gateway warnings.
- `RateLimit`: Discord API rate limit triggers (REST).

### Handler Registration Methods

Use these methods to register interaction logic dynamically (e.g., in `onModuleInit`).

| Method               | Arguments            | Description                                                     |
| :------------------- | :------------------- | :-------------------------------------------------------------- |
| `registerCommand`    | `instance: ICommand` | Registers a command manually (auto-handled by decorators usually). |
| `registerButton`     | `instance: IButton`  | Maps a `customId` to a button handler instance.                |
| `registerModal`      | `instance: IModal`   | Maps a `customId` to a modal submission handler.                 |
| `registerSelectMenu` | `instance: ISelectMenu`| Maps a `customId` to a select menu handler.                  |

### Execution Flow

1.  **Event Routing**: `InteractionsManager` intercepts `interactionCreate`, generates a `correlationId`, and routes the event.
2.  **Handler Selection**: Registry pattern finds the appropriate handler (Command, Button, etc.) via `supports()` check.
3.  **Parameter Injection**: `ParamsResolverService` extracts decorated parameters.
4.  **Pipes Pipeline**: Input data is passed through a chain of asynchronous Pipes (automatic transformation + manual pipes).
5.  **Method Invocation**: The target class method is invoked with resolved and validated arguments.