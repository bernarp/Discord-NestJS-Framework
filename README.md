# Backend Architecture & Integration Manual

## 1. Architectural Infrastructure & Dependency Injection

Implement the framework using a strict separation of concerns between domain logic and the Discord gateway. Utilize the **NestJS** modular architecture to enforce interface-token decoupling.

### Dependency Injection Strategy

Inject dependencies using specialized `InjectionToken` identifiers rather than concrete class constructors. This ensures testability and hot-swappability of critical services.

**Core Injection Tokens:**

| Token | Interface | Functional Purpose |
| --- | --- | --- |
| `ICLIENT_TOKEN` | `IClient` | Manages lifecycle, connectivity state, and bot presence. |
| `IINTERACTIONS_MANAGER_TOKEN` | `IInteractionsManager` | Entry point for interaction routing and context binding. |
| `IDISCORD_EVENT_MANAGER_TOKEN` | `IDiscordEventManager` | Binds gateway events to internal service methods. |
| `ICOMMAND_HANDLER_TOKEN` | `ICommandHandler` | Registers and executes Slash Commands. |
| `IDISCORD_INTERACTION_HANDLERS_TOKEN` | `IBaseHandler[]` | Aggregates all interaction handlers via `useFactory`. |

**Implementation:**
Register providers within the `ClientModule`. Use the `@Global()` scope for `ConfigModule` and `UIModule` to expose services across the application tree without redundant imports.

```typescript
// Example: Injecting the Client Service
constructor(
  @Inject(ICLIENT_TOKEN) private readonly client: IClient,
  @Inject(IINTERACTIONS_MANAGER_TOKEN) private readonly interactions: IInteractionsManager
) {}

```

---

## 2. BotClient Lifecycle & Gateway Connectivity

Manage the `BotClient` state through a rigid execution sequence. Implement "Fail-fast" validation to prevent partial initialization.

### Configuration & Validation

Validate environment variables using **Zod** schemas before module initialization. Halt the bootstrap process immediately if `DISCORD_TOKEN`, `CLIENT_ID`, or `GUILD_ID` are missing.

### Initialization Sequence

1. **CLI Mode Check:** Evaluate `process.env.APP_CLI_MODE`. Bypass gateway login if `true` to perform maintenance without API rate limits.
2. **Event Registration:** Invoke `_registerBaseEvents()` to bind listeners for shard status and REST limits.
3. **Context Binding:** Execute `_registerInteractionHandler()`. Wrap every execution in a `randomUUID` correlation context for traceability.
4. **Gateway Handshake:** Invoke `start()` to authenticate via the Discord WebSocket.

**Lifecycle Implementation:**

```typescript
public async start(): Promise<void> {
  const { token } = this._config;
  try {
    // Establishes the WebSocket connection
    await this._client.login(token); 
  } catch (error) {
    this._logger.error('Critical Gateway Authorization Failure', error);
    throw error;
  }
}

public async shutdown(): Promise<void> {
  // Graceful termination of the session
  await this._client.destroy();
}

```

---

## 3. Automated Discovery & Interaction Routing

Eliminate manual registration by leveraging metadata reflection. Use the `DiscoveryService` to scan for declarative decorators.

### Discovery Mechanisms

* **Slash Commands:** Apply `@CommandSlash` to provider classes. The `SlashCommandRegistrationService` extracts metadata and synchronizes the schema with the Discord API.
* **Sub-Commands:** Apply `@SubCommand` to methods within a class for granular routing.
* **Event Listeners:** Apply `@On(event)` or `@Once(event)` to bind methods directly to Gateway events via the `DiscordEventManager`.

### Routing Logic

Route incoming payloads through the `InteractionsManager`. Delegate processing to handlers registered under `IDISCORD_INTERACTION_HANDLERS_TOKEN`. Ensure each handler implements a `supports()` check (e.g., `interaction.isButton()`) to isolate logic.

---

## 4. Parameter Injection & Data Pipelines

Resolve method arguments dynamically using **Reflection** (`design:paramtypes`). Apply validation pipes to sanitize input before execution.

### Smart Type Mapping

Map TypeScript types to Discord API objects automatically:

* `User` type -> invokes `options.getUser()`
* `number` type -> invokes `ParseFloatPipe`
* `boolean` type -> invokes `ParseBoolPipe`

### Explicit Validation

Apply `@Option()` with specific pipes for strict validation. Throw a `BotException` on validation failure to trigger the `GlobalExceptionFilter`.

```typescript
@SubCommand({ name: 'ban', description: 'Ban a user' })
public async onBan(
  @Option({ name: 'target', description: 'User to ban' }) target: User, // Smart Mapping
  @Option('days', ParseIntPipe) days: number, // Explicit Pipe validation
  @CurrentUser() moderator: User // Context decorator
): Promise<void> {
  // Logic execution assumes valid types
}

```

---

## 5. UI Construction (Advanced Component Factory)

Construct UI elements using the `ContainerBuilder` pattern via the `AdvancedComponentFactory`. Do not use legacy embed objects.

### Sequential Rendering

Chain methods to define the visual layout. The builder maintains insertion order via an internal counter.

1. **Initialize:** Call `createContainer()`.
2. **Build Components:** Use `createButton` or `createSelectMenu`.
3. **Bind:** Attach components via `addActionRowComponents`.
4. **Attach Files:** Use `addFileFromBuffer` to generate internal `attachment://` URL mappings.

```typescript
const { container, files } = this._uiFactory.createContainer()
  .setColor(0x00FF00)
  .addHeading('System Status', 1)
  .addSeparator()
  .addFields([{ key: 'Gateway', value: 'Connected' }])
  .addActionRowComponents(
    this._uiFactory.createButtonRow([
      this._uiFactory.createButton('refresh', 'Refresh')
    ])
  )
  .build();

```

---

## 6. Event-Driven Architecture (EDA) & Monitoring

Decouple monitoring from the core execution thread using the system `EventBus`.

### Request Context & Traceability

Retrieve the request correlation ID via `EDAContext.getRequestContext()`. This identifier is stored in `AsyncLocalStorage` and links generic logs to specific Gateway interactions.

### System Events

Subscribe to `Events.SYSTEM.ERROR` using the `@Subscribe` decorator. Categorize failures using `DiscordErrorContext`:

* **GatewayError:** Socket connectivity issues.
* **RateLimit:** REST API throttling.
* **InteractionError:** Command execution failures.

---

## 7. Production Configuration & Constraints

Configure the environment using a strict three-tier hierarchy:

1. **Environment Variables (Highest Priority)**
2. `config_mrg/` (Local overrides)
3. `config_df/` (Version-controlled defaults)

### Environment Overrides

Apply the mandatory `APP__` prefix to override settings.

* **Formula:** `APP__{MODULE_KEY}__{PROPERTY_PATH}`
* **Example:** `APP__DISCORD__TOKEN` overrides the token property in the discord module.

### Immutability & Exception Handling

* **State Integrity:** Treat the configuration Proxy as immutable. Runtime mutations will throw a `TypeError`.
* **Exception Filtering:** Implement `GlobalExceptionFilter` to intercept `BotException`. Use `interaction.editReply` to render user-facing error UI instead of generic failures.