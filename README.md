# NestJS Discord Bot Framework

Architecture-centric framework for building Discord applications using NestJS. Implements Event-Driven Architecture (EDA) and Registry patterns for modularity and traceability.

## Core Principles

1.  **Module Decoupling:** Use `EventBusService` for inter-module communication. Prevent direct service dependencies between domain modules.
2.  **Execution Traceability:** Propagate `correlationId` via `AsyncLocalStorage`. Maintain state across asynchronous boundaries including Event Bus and Loggers.
3.  **Strict Inversion of Control:** Access all system components via DI Tokens. Define interfaces for all handlers and services.

---

## Technical Architecture

### 1. Infrastructure Topology Verification
The `TopologyBuilderService` executes during the bootstrap phase to validate the event-driven system integrity.
- **Problem Solved:** Undetected broken event chains and orphan handlers.
- **Behavior:** Scans `@Emits` and `@Subscribe` metadata. Generates a internal graph.
- **Constraints:** Detects only metadata-defined events. Logic-based `EventEmitter` calls are not tracked.

### 2. Interaction Registry (Open/Closed Principle)
The `InteractionsManager` delivers events to specialized handlers registered via `IDISCORD_INTERACTION_HANDLERS_TOKEN` multi-providers.
- **Extension:** Add new interaction types (Buttons, Modals, Menus) by implementing `IBaseHandler` and registering the provider. No modification to core delivery logic required.
- **Conflict Resolution:** Handlers must implement `supports(interaction)` for targeted routing.

### 3. Asynchronous Pipes Pipeline
Data validation and transformation logic resides in the Pipes layer.
- **Automated Transformation:** Resolves `number`, `boolean`, and `string` primitives based on method signatures via `design:paramtypes` reflection.
- **Manual Validation:** Implement `IDiscordPipe` for complex checks (e.g., database entity existence).
- **Execution:** Pipes execute asynchronously before the target method invocation. Throws `BotException` on failure.

### 4. Contextual Logging
The logger utilizes the current `RequestContext` to attach a unique `correlationId` to every entry. Ensure all asynchronous operations maintain the context to prevent trace fragmentation.

---

## Implementation Guide

### Command Definition

Integrate commands by implementing the `ICommand` interface and applying decorators for metadata and parameter resolution.

```typescript
@Injectable()
@CommandSlash({
  name: 'economy',
  description: 'Manage economy state',
  registration: CommandRegistrationType.GUILD
})
export class EconomyCommand implements ICommand {
  
  @Ephemeral()
  @Defer()
  @SubCommand({ name: 'transfer', description: 'Modify balance' })
  public async onTransfer(
    @Option('target') recipient: User,
    @Option('amount', ParseIntPipe) amount: number,
    @CurrentUser() sender: User,
    @Interaction() interaction: ChatInputCommandInteraction
  ): Promise<void> {
    // Parameters are validated and cast to Typescript types.
    // correlationId is preserved in the current execution context.
    
    await interaction.editReply(`Operation complete: ${amount} transferred.`);
  }
}
```

---

## Configuration and Deployment

### 1. Environment Requirements
Define variables in the root `.env` file:
```env
DISCORD_TOKEN=EXACT_BOT_TOKEN
CLIENT_ID=APPLICATION_ID
GUILD_ID=DEV_GUILD_ID
LOG_LEVEL=DEBUG | INFO | WARN | ERROR
```

### 2. Execution Flow
Install dependencies and initiate the development or production lifecycle:
```bash
# Setup
npm install

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Project Structure

```text
src/
├── client/             # Delivery Layer: Handlers, Registry, Pipes
├── common/             # Infrastructure Layer: EventBus, Logger, Topology, Context
├── modules/            # Domain Layer: Feature-specific business logic
└── main.ts             # Application Bootstrap
```
