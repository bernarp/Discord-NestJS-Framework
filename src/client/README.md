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

| Decorator          | Description                                                                     |
| :----------------- | :------------------------------------------------------------------------------ |
| `@Option(name, ...pipes)` | Injects a value from command options. Supports transformation/validation Pipes. |
| `@CurrentUser()`    | Injects the `User` object of the command caller.                                |
| `@CurrentMember()`  | Injects the `GuildMember` object of the command caller (Guild only).            |
| `@CurrentChannel()` | Injects the `TextChannel` (or other channel type) where the command was used.     |
| `@CurrentGuild()`   | Injects the `Guild` object where the command was used.                          |
| `@Client()`         | Injects the `Client` instance of the bot.                                       |
| `@Interaction()`    | Injects the raw `Interaction` object.                                           |

### Data Transformation & Validation (Pipes)

Pipes are used to transform input data and validate it before it reaches your method. They are asynchronous and support Dependency Injection patterns.

#### Automatic Type Transformation
If `emitDecoratorMetadata` is enabled in `tsconfig`, the framework automatically applies basic parsing based on the TypeScript type of the parameter:
- `number` -> Automatically applies `ParseFloatPipe`.
- `boolean` -> Automatically applies `ParseBoolPipe`.
- `string` -> Ensures the value is a string.

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
import { Injectable, Inject } from '@nestjs/common';
import { ChatInputCommandInteraction, User, Guild, GuildMember, TextChannel } from 'discord.js';
import { ICommand } from '@/client/interfaces/command.interface.js';
import { LOG } from '@/common/_logger/constants/LoggerConfig.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';
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
import { ParseIntPipe } from '@/common/pipes/index.js';

@Injectable()
@CommandSlash({
  name: 'economy',
  description: 'Server economy management',
  registration: CommandRegistrationType.GUILD
})
export class EconomyCommand implements ICommand {
  public readonly name = 'economy';

  constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

  /**
   * Complex example with automatic and manual pipes.
   */
  @SubCommand({
    name: 'transfer',
    description: 'Transfer coins to another user'
  })
  public async onTransfer(
    @Option('target') recipient: User,
    @Option('amount', ParseIntPipe) amount: number, // Explicit pipe usage
    @Option('silent') silent: boolean,              // Automatic ParseBoolPipe
    @CurrentUser() sender: User,
    @CurrentMember() member: GuildMember,
    @CurrentGuild() guild: Guild,
    @CurrentChannel() channel: TextChannel,
    @Interaction() interaction: ChatInputCommandInteraction
  ): Promise<void> {
    this._logger.log(`${sender.tag} is sending ${amount} coins to ${recipient.tag} in ${channel.name}`);
    
    // Logic here...
    
    await interaction.reply({
        content: `Transferred **${amount}** to ${recipient.username}`,
        ephemeral: silent
    });
  }

  /**
   * Example of declarative lifecycle management.
   */
  @Ephemeral()
  @Defer()
  @SubCommand({
    name: 'balance',
    description: 'Check your current balance'
  })
  public async onBalance(@CurrentUser() user: User, @Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
    // Simulate long DB query
    await new Promise(r => setTimeout(r, 2000));
    
    await interaction.editReply(`Your balance is **1,000** coins, ${user.username}!`);
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
| `start()`                                   | `Promise<void>`       | Initializes the WebSocket connection to the Discord Gateway.        |
| `shutdown()`                                | `Promise<void>`       | Terminates the connection and cleans up resources.                  |
| `getUser()`                                 | `ClientUser \| null`   | Returns the current bot user instance (available after start).      |
| `getPing()`                                 | `number`              | Returns the current WebSocket latency (ms).                        |
| `getStatus()`                               | `string`              | Returns the current connection status string.                      |
| `registerEventHandler<K>(event, handler)`   | `void`                | Registers a persistent event handler for the specified event.      |
| `registerEventOnce<K>(event, handler)`      | `void`                | Registers a one-time event handler for the specified event.        |

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