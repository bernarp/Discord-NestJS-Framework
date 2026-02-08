# Client

This module implements an abstraction layer over `discord.js` to manage the Discord Gateway connection, REST API interactions, and event routing.

## Dependency Injection (DI Tokens)

Use these tokens to inject dependencies. Do not import concrete classes directly.

| Token | Interface | Purpose |
| :--- | :--- | :--- |
| `ICLIENT_TOKEN` | `IClient` | Lifecycle management (start/stop) and client status. |
| `ICOMMAND_HANDLER_TOKEN` | `ICommandHandler` | Dynamic command registration and execution. |
| `IBUTTON_HANDLER_TOKEN` | `IButtonHandler` | Button interaction registration. |
| `IMODAL_HANDLER_TOKEN` | `IModalHandler` | Modal submission registration. |
| `ISELECT_MENU_HANDLER_TOKEN` | `ISelectMenuHandler` | Select menu interaction registration. |
| `IDISCORD_EVENT_MANAGER_TOKEN` | `IDiscordEventManager` | Discord gateway event subscription management. |

## Slash Commands Implementation

Implement the `ICommand` interface and use the `@CommandSlash` decorator. Metadata is automatically extracted by `SlashCommandRegistrationService` during bootstrap. The framework supports reflection-based parameter injection via decorators.

### Parameter Decorators

| Decorator | Description |
| :--- | :--- |
| `@Option(name)` | Injects a value from command options by name. |
| `@CurrentUser()` | Injects the `User` object of the command caller. |
| `@Interaction()` | Injects the raw `ChatInputCommandInteraction` object. |

### Example

```typescript
import { Injectable } from '@nestjs/common';
import { CommandSlash, SubCommand, Option, CurrentUser, Interaction } from '@/common/decorators';
import { ChatInputCommandInteraction, User } from 'discord.js';
import { ICommand } from '@/client/interfaces';

@Injectable()
@CommandSlash({
  name: 'moderation',
  description: 'Moderation utilities',
  registration: CommandRegistrationType.GUILD
})
export class ModerationCommand implements ICommand {
  public readonly name = 'moderation';

  public async execute(@Interaction() interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Use a subcommand.');
  }

  @SubCommand({
    name: 'ban',
    description: 'Ban a user from the server'
  })
  public async onBan(
    @Option('target') targetUser: User,
    @Option('reason') reason: string,
    @CurrentUser() moderator: User
  ): Promise<void> {
    console.log(`${moderator.tag} is banning ${targetUser.tag} for: ${reason}`);
  }
}
```

## Event Listeners

Use `@On` and `@Once` decorators to handle Discord gateway events declaratively. The `DiscordEventDiscoveryService` automatically discovers and registers these listeners during module initialization.

### Event Decorators

| Decorator | Description |
| :--- | :--- |
| `@On(event)` | Registers a persistent event listener. |
| `@Once(event)` | Registers a one-time event listener. |

### Example

```typescript
import { Injectable } from '@nestjs/common';
import { On, Once } from '@/common/decorators';
import { Events, Message, Client } from 'discord.js';

@Injectable()
export class ChatListener {
  
  @Once(Events.ClientReady)
  public async onReady(client: Client): Promise<void> {
    console.log(`Bot logged in as ${client.user.tag}`);
  }

  @On(Events.MessageCreate)
  public async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    console.log(`Message from ${message.author.tag}: ${message.content}`);
  }
}
```

## Public API Reference

### BotClient Methods (`ICLIENT_TOKEN`)

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `start()` | `Promise<void>` | Initializes the WebSocket connection to the Discord Gateway. |
| `shutdown()` | `Promise<void>` | Terminates the connection and cleans up resources. |
| `getUser()` | `ClientUser | null` | Returns the current bot user instance (available after start). |
| `getPing()` | `number` | Returns the current WebSocket latency (ms). |
| `getStatus()` | `string` | Returns the current connection status string. |
| `registerEventHandler<K>(event, handler)` | `void` | Registers a persistent event handler for the specified event. |
| `registerEventOnce<K>(event, handler)` | `void` | Registers a one-time event handler for the specified event. |

### Handler Registration Methods

Use these methods to register interaction logic dynamically (e.g., in `onModuleInit`).

| Method | Arguments | Description |
| :--- | :--- | :--- |
| `registerCommand` | `instance: ICommand` | Registers a command manually (auto-handled by decorators usually). |
| `registerButton` | `instance: IButton` | Maps a `customId` to a button handler instance. |
| `registerModal` | `instance: IModal` | Maps a `customId` to a modal submission handler. |
| `registerSelectMenu`| `instance: ISelectMenu` | Maps a `customId` to a select menu handler. |

### Execution Flow

1.  **Event Routing**: `InteractionsManager` intercepts `interactionCreate`, generates a `correlationId` (via `RequestContextService`), and routes the event.
2.  **Command Matching**: Routes to `CommandInteractionHandler` based on `commandName`.
3.  **Parameter Injection**: `ParamsResolverService` extracts decorated parameters and injects them into the method.
4.  **Component Matching**: Routes to specific handlers (Button/Modal) based on strict `customId` matching.