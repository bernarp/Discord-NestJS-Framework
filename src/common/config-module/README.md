# Distributed Configuration Engine (DCE)

The Distributed Configuration Engine provides a decentralized, type-safe, and reactive configuration management system. It implements a multi-stage loading pipeline governed by the Single Responsibility Principle (SRP) to ensure data integrity and system stability.

## Architectural Architecture

The module utilizes a **Pipeline Pattern** for configuration initialization, consisting of the following stages:

1.  **Source Retrieval**: Use `ConfigFileReader` to extract YAML data and `EnvProcessor` to parse environment variables.
2.  **Structural Merging**: Apply `ConfigMerger` (deep merge) to combine framework defaults, user overrides, and ENV injections.
3.  **Schema Validation**: Execute `ConfigValidator` to verify the resulting structure against the defined **Zod schema**.
4.  **Immutable Storage**: Persist the validated snapshot in the `ConfigRepository`, where every object is **deeply frozen** to prevent runtime mutations.

## Core Components

### 1. Registry & Access (`ConfigService`)
Acts as the primary orchestrator for configuration discovery and consumption. Use this service to retrieve snapshots or reactive proxies.

### 2. Pipeline Orchestrator (`ConfigOrchestrator`)
Implements the `Read -> Merge -> Validate` workflow. Delegates specific operations to low-level loaders and validators.

### 3. Data Persistence (`ConfigRepository`)
Encapsulates state management. Implements an in-memory storage with mandatory immutability enforcement via recursive `Object.freeze`.

### 4. Dynamic Watcher (`ConfigWatcherService`)
Monitors the filesystem for changes in specified directories and triggers the `reload` process via the service layer.

## Integration Workflow

### 1. Define Configuration Metadata
Apply the `@Config` decorator to a class to register a module-specific configuration block. Provide a unique key and a Zod schema.

```typescript
import { Config } from '@/common/decorators/config.decorator.js';
import { z } from 'zod';

const ModuleSchema = z.object({
  port: z.number().default(3000),
  host: z.string().default('localhost')
});

@Config({
  key: 'module.name',
  schema: ModuleSchema
})
export class ModuleConfig {}
```

### 2. Register with NestJS
Include the configuration class in the `providers` array of your module. The engine's discovery mechanism will automatically identify and initialize it during boot.

```typescript
@Module({
  providers: [ModuleConfig],
})
export class MyFeatureModule {}
```

## Consumption Patterns

### Reactive State (Proxy)
Use `getProxy<T>(key)` for parameters requiring hot-reloading (e.g., timeouts, switches). The proxy always references the latest valid snapshot in the repository.

**Constraint:** Access properties directly through the proxy instance. Destructuring (`const { val } = proxy`) creates a static copy and breaks reactivity.

```typescript
const config = this.configService.getProxy<IMyConfig>(ConfigKey.MyFeature);
this.logger.log(`Current value: ${config.port}`); // Always reflects latest state
```

### Static State (Snapshot)
Use `get<T>(key)` for one-time initialization where subsequent changes are not required.

## Type Generation & Safety

Maintain type safety by generating interfaces and key mappings from Zod schemas:

1.  Update schemas in the code.
2.  Execute the CLI tool: `npm run config:validate`.
3.  Consume generated artifacts from `src/common/config-module/types/config.generated.ts` and the `ConfigKey` enum.

## Error Handling

The module throws specific domain exceptions for diagnostic precision:
*   `ConfigValidationException`: Indicates structural or type mismatches in configuration sources.
*   `ConfigLoaderException`: Indicates IO failures or malformed source files.
*   `ConfigNotFoundException`: Indicates access attempts to unregistered keys.

## Configuration Hierarchy

Value resolution priority (lowest to highest):
1.  **Zod Schema Defaults** (Internal fallback).
2.  **`config_df/*.yaml`** (Framework/Project defaults).
3.  **`config_mrg/*.yaml`** (Environment-specific overrides).
4.  **Environment Variables** (Runtime overrides: `APP__{KEY}__{PROP}`).
