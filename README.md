Here is the updated **README.md** in English, with the specific section removed as requested.

```markdown
# Enterprise NestJS Discord Framework

Architectural framework for building scalable Discord applications using NestJS. Implements Dependency Injection, Event-Driven Architecture, and Distributed Configuration Management on top of the Node.js and TypeScript ecosystem.

## Global Architecture

The system follows the **Modular Monolith** principle. Cross-domain interaction occurs strictly via Dependency Injection (DI) and the Event Bus. Direct imports of controllers or services between domain modules are prohibited.

### Core Patterns
1.  **Strict Inversion of Control (IoC):** All components (Handlers, Services, Repositories) are registered in the NestJS DI container. Use tokens (e.g., `ICLIENT_TOKEN`) to inject interfaces rather than concrete implementations.
2.  **Metadata-Driven Development:** Registration of commands, events, and configurations is performed declaratively via decorators (`@CommandSlash`, `@On`, `@Config`). Metadata scanning occurs during the Bootstrap phase.
3.  **Traceability:** End-to-end logging is implemented via `AsyncLocalStorage`. Each incoming Interaction is assigned a unique `correlationId`, accessible across all processing layers.

---

## Distributed Configuration Engine (DCE)

The configuration subsystem implements a **Layered Loading** strategy with bottom-up merge priority. It ensures strong typing via Zod, startup validation (Fail-fast), and reactive parameter updates (Hot Reload).

### Merge Hierarchy
Configuration is constructed through Deep Merge of three sources:

1.  **Immutable Defaults (`config_df/*.yaml`)**: Base values shipped with source code. Defines the configuration contract. **Must be committed to VCS.**
2.  **Mutable Overrides (`config_mrg/*.yaml`)**: Local overrides for specific environments. **Excluded from VCS.**
3.  **Environment Variables (`process.env`)**: Orchestrator-level injections (Docker/K8s). Highest priority. Mapping format: `APP__{MODULE_KEY}__{PROPERTY}`.

### Module Configuration Implementation

#### 1. Schema Definition
Define the configuration structure within the module using Zod. Inherit from `BaseConfigSchema` for standardization (enabled/debug flags).

```typescript
import { Config } from '@/common/decorators/config.decorator';
import { z } from 'zod';

const DatabaseConfigSchema = z.object({
  host: z.string().default('localhost'),
  poolSize: z.number().int().min(1).default(10),
  options: z.object({
    ssl: z.boolean().default(false)
  }).default({}) // Default for nested objects is mandatory
});

@Config({
  key: 'module.database',
  schema: DatabaseConfigSchema
})
export class DatabaseConfigDefinition {}
```

#### 2. Artifact Generation
Execute the built-in CLI tool to generate TypeScript interfaces and YAML skeletons. This guarantees synchronization between types and data files.

```bash
# Run configuration generator
npm run config:validate
```
*   **Output:**
    *   Updates `src/common/config-module/types/config.generated.ts`.
    *   Generates/Updates `config_df/module.database.yaml`.

#### 3. Consumption
Use `ConfigService` to access data. Select the access pattern based on reactivity requirements.

*   **Static Snapshot (Stateless):** For connection initialization.
    ```typescript
    const config = this.configService.get<DatabaseConfig>('module.database');
    ```
*   **Reactive Proxy (Stateful):** For runtime-mutable parameters (Feature Flags, Timeouts).
    ```typescript
    // Warning: Do not destructure the proxy object to maintain the reactive link
    const proxy = this.configService.getProxy<DatabaseConfig>('module.database');
    if (proxy.enabled) { ... }
    ```

---

## Event Bus & Messaging

Inter-module communication is implemented via `EventBusService`. This eliminates tight coupling between domains.

### Event Publishing
Create event classes inheriting from `BaseEvent`. Encapsulate the payload in a typed object.

```typescript
// 1. Event Definition
export class UserLevelUpEvent extends BaseEvent<{ userId: string; newLevel: number }> {}

// 2. Publication (in source service)
await this.eventBus.publish(new UserLevelUpEvent({ userId: '123', newLevel: 5 }));
```

### Event Subscription
Use the `@Subscribe` decorator in consumer services.

```typescript
@Injectable()
export class AchievementService {
  @Subscribe(Events.USER.LEVEL_UP)
  async onLevelUp(event: UserLevelUpEvent): Promise<void> {
    const { userId, newLevel } = event.payload;
    // Achievement logic
  }
}
```

---

## Discord Interaction Layer

The Discord API interaction layer is abstracted from business logic. Use decorators to register handlers.

### Slash Command Registration
Implement the `ICommand` interface. Use `@CommandSlash`, `@SubCommand`, and `@Option` decorators to declaratively describe the command structure. The framework automatically generates the JSON schema for the Discord API based on TypeScript metadata.

```typescript
@Injectable()
@CommandSlash({
  name: 'moderation',
  description: 'Moderation toolset',
  registration: CommandRegistrationType.GUILD
})
export class ModerationCommand implements ICommand {
  @SubCommand({ name: 'ban', description: 'Ban a user' })
  async execute(
    @Option({ name: 'target', description: 'User to ban' }) target: User,
    @Option({ name: 'reason', required: false }) reason: string = 'No reason'
  ): Promise<void> {
    // Implementation
  }
}
```

### UI Composition (Components V2)
Use `AdvancedComponentFactory` to build interfaces. Apply the **Composite** pattern to assemble complex UI elements from atomic widgets. Avoid manually creating JSON objects for Embeds or Components.

```typescript
const { container } = this.uiFactory.createContainer()
  .setColor(Colors.Red)
  .addHeading('System Alert', 1)
  .addFields([{ key: 'Status', value: 'Critical' }])
  .addActionRowComponents(this.createControlButtons())
  .build();
```

---

## Logging & Observability

The logging system (`LoggerModule`) is integrated with DI and the request context.

*   **Usage:** Inject `ILogger` via the `LOG.LOGGER` token.
*   **Context:** The logger automatically enriches entries with metadata (`correlationId`, class, method) via `LogContextResolver`.
*   **Levels:** Use semantic methods: `log`, `warn`, `error`, `debug`, `verbose`.

```typescript
try {
  // ... dangerous operation
} catch (error) {
  // Automatically captures Stack Trace and Correlation ID
  this.logger.error('Failed to process transaction', error);
}
```

---

## Development Workflow

### Environment Initialization
1.  **Install dependencies:** `npm install`
2.  **Generate configurations:** `npm run config:validate`
3.  **Start in dev mode:** `npm run start:dev`

### Project Structure
```text
src/
├── client/                 # Discord.js Adapter (Gateway, REST)
│   ├── interactions/       # Command, button, modal handlers
│   └── ui/                 # Component and widget factories
├── common/                 # Shared Kernel
│   ├── config-module/      # Configuration Engine
│   ├── event-bus/          # Event Bus
│   └── _logger/            # Logging System
└── modules/                # Domain Modules (Business Logic)
    ├── economy/
    └── moderation/
```
```