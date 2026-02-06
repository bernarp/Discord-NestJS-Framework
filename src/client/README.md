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

## Slash Commands Implementation

Implement the `ICommand` interface and use the `@CommandSlash` decorator. Metadata is automatically extracted by `SlashCommandRegistrationService` during bootstrap. Use `@SubCommand` to handle specific sub-command logic within the same class.

### Interface & Decorators

```typescript
import { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { CommandSlash, SubCommand } from '@/common/decorators';

// 1. Define Command Metadata
@CommandSlash({
  name: 'settings',
  description: 'Manage bot settings',
  registration: CommandRegistrationType.GUILD
})
export class SettingsCommand implements ICommand {
  public readonly name = 'settings';

  // 2. Default Execution Logic
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Logic for top-level command or routing if needed
  }

  // 3. Sub-Command Implementation
  @SubCommand({
    name: 'view',
    description: 'View current settings'
  })
  public async onViewSettings(interaction: ChatInputCommandInteraction): Promise<void> {
    // Logic specifically for '/settings view'
  }

  // 4. Optional Autocomplete
  public async autocomplete?(interaction: AutocompleteInteraction): Promise<void> {
    // Handle autocomplete requests
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
3.  **Component Matching**: Routes to specific handlers (Button/Modal) based on strict `customId` matching.