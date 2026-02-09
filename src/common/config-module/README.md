# Distributed Configuration Engine

The `Distributed Configuration Engine` (DCE) provides a decentralized, type-safe, and reactive configuration management system for NestJS applications. It ensures **Fail-fast** validation during startup and supports **Hot Reloading** of parameters at runtime without process restarts.

## Architectural Principles

The system implements a **Layered Configuration** pattern with the following merging priority (from bottom to top):

1.  **Immutable Defaults (`config_df/*.yaml`)**: Base values bundled with the source code. These define the configuration contract for each module.
2.  **Mutable Overrides (`config_mrg/*.yaml`)**: Environment-specific overrides (Dev/Stage/Prod). These files are excluded from Version Control (VCS).
3.  **Environment Variables (`process.env`)**: Orchestrator-level injections (Docker/K8s). This level has the highest priority.

## Integration and Definition

### 1. Schema Declaration
Use the `@Config` decorator to bind a Zod schema to a specific configuration key. Place this definition within the consumer module or a dedicated config class.

```typescript
import { Config } from '@/common/decorators/config.decorator.js';
import { z } from 'zod';

const DatabaseSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().int().default(5432),
  options: z.object({
    timeout: z.number().default(5000)
  }).default({}) // CRITICAL: Always provide defaults for nested objects
});

@Config({
  key: 'module.database',
  schema: DatabaseSchema
})
export class DatabaseConfigDefinition {}
```

### 2. Module Registration
The engine utilizes the `DiscoveryService` to scan for metadata. Explicitly adding the definition class to a module's `providers` array is sufficient for discovery.

```typescript
@Module({
  providers: [DatabaseConfigDefinition],
  // ...
})
export class DatabaseModule {}
```

## Static Analysis & Type Generation

To ensure absolute type safety (`ConfigService.get<T>`) and full IDE IntelliSense, the system includes a CLI utility. It scans application metadata, translates Zod schemas into TypeScript interfaces, and generates a nested `ConfigKey` mapping.

**Run Generation:**
```bash
npm run config:validate
```

**Artifact:** `src/common/config-module/types/config.generated.ts`.  
Use the generated `ConfigKey` object and interfaces to avoid "magic strings" and type errors.

## Consumption Patterns

### Access Pattern 1: Static Snapshot
Use this to retrieve values at the moment of execution. This is the simplest way but does not automatically reflect changes if the configuration is hot-reloaded.

```typescript
constructor(private readonly configService: ConfigService) {}

connect() {
  const dbConfig = this.configService.get<ModuleDatabaseConfig>(ConfigKey.Module.Database);
  this.driver.connect(dbConfig.host);
}
```

### Access Pattern 2: Reactive Proxy
Use this for parameters (timeouts, feature flags, limits) that must update in real-time without restarting services.

**⚠️ WARNING:** Never destructure a Proxy object. Destructuring breaks the reference, "freezing" the value at the time of calling.

```typescript
// BAD: Reactivity lost
const { timeout } = this.configService.getProxy(ConfigKey.Module.Database);

// GOOD: Access via proxy property on every call
const proxy = this.configService.getProxy<ModuleDatabaseConfig>(ConfigKey.Module.Database);

if (Date.now() - start > proxy.options.timeout) { 
    throw new TimeoutError(); 
}
```

### Access Pattern 3: Event-Driven Reconfiguration
Ideal for **Stateful Components** (DB Pools, gRPC Clients) that require a full re-initialization (e.g., reconnecting) when specific configurations change.

```typescript
@Subscribe(Events.SYSTEM.CONFIG_UPDATED)
onConfigUpdate(event: ConfigUpdatedEvent) {
  if (event.payload.key === ConfigKey.Module.Database) {
    this.connection.reconnect(event.payload.value);
  }
}
```

## Lifecycle and Hot Reload

*   **Watcher Service:** `ConfigWatcherService` uses `chokidar` to monitor the `config_mrg` directory for changes.
*   **Validation Guard:** When a file changes, the engine performs a full re-validation via Zod. If the new config is invalid, the update is rejected, and the application continues to run on the last known valid state. Errors are reported via the Internal Logger.
*   **CLI Mode:** When running the validation tool, the system sets `APP_CLI_MODE=true`, which automatically disables Discord Gateway connections, Command Registrations, and File Logging to ensure a lightweight and safe execution.

### Zod Best Practice
When using `z.object()` inside a schema, **always** append `.default({})`. Without this, if the section is missing from the YAML file, Zod will throw an `expected object, received undefined` error, preventing the application from falling back to internal default values of nested fields.
