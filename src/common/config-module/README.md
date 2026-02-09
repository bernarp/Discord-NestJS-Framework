# Distributed Configuration Engine (DCE)

The Distributed Configuration Engine provides a type-safe, reactive, and layered configuration management system. It separates framework-level defaults from user-level overrides to ensure stable and predictable state across different environments.

## Layered File System

The engine utilizes a specific directory structure to manage configuration snapshots. Every module registered via `@Config` must have a corresponding YAML file in the directories below.

| Directory | Target Type | Access Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `config_df/` | **Defaults** | Read-Only (Bundled) | Stores base configuration snapshots. These files define the structural contract and default values for each module. Tracked by VCS. |
| `config_mrg/` | **Overrides** | Read-Write (Runtime) | Stores environment-specific overrides (Production, Stage, local). Values in this directory take priority over `config_df`. Ignored by VCS. |

### Merging Hierarchy
The `ConfigOrchestrator` performs a deep recursive merge using the following priority (lowest to highest):
1.  **Zod Schema Defaults**: Internal fallback if no files are present.
2.  **`config_df/*.yaml`**: Project-wide baseline settings.
3.  **`config_mrg/*.yaml`**: Local or environment-specific overrides.
4.  **Environment Variables**: Temporary runtime injections (`APP__{MODULE_KEY}__{PROPERTY}`).

---

## API Reference

| Component / Method | Description |
| :--- | :--- |
| `ConfigService.get<T>(key)` | Returns a static, deeply frozen object snapshot. Use for one-time initialization. |
| `ConfigService.getProxy<T>(key)` | Returns a reactive Proxy. References the latest snapshot in the `ConfigRepository`. Required for parameters that change without process restart. |
| `ConfigService.reload(key)` | Manages the hot-reload lifecycle. Triggers re-reading, merging, and re-validating the configuration pipeline. |
| `ConfigRepository` | Provides the underlying storage for snapshots. Implements mandatory recursive `Object.freeze` on all stored data. |
| `ConfigOrchestrator` | Coordinates the `Read -> Merge -> Validate` pipeline. Segregates IO operations from logic and validation. |

---

## Technical Integration

### 1. Structure Definition
Define the configuration key and Zod schema using the `@Config` decorator.

```typescript
@Config({
  key: 'module.database',
  schema: z.object({
    host: z.string().default('localhost'),
    port: z.number().int().default(5432)
  })
})
export class DatabaseConfig {}
```

### 2. Module Discovery
Register the configuration class in the NestJS module. The engine uses `DiscoveryService` to automatically link metadata to the `ConfigService` registry.

```typescript
@Module({
  providers: [DatabaseConfig],
})
export class DatabaseModule {}
```

---

## Consumption & Reactivity

### Reactive Proxy Pattern
Utilize `getProxy<T>()` to allow real-time parameter updates from `config_mrg` or ENV without restarting the service.

```typescript
// Access latest values from the repository automatically
const config = this.configService.getProxy<IDatabaseConfig>(ConfigKey.Module.Database);
this.logger.debug(`Active Port: ${config.port}`);
```

**⚠️ Immutable Guard:** All data is deeply frozen. Attempts to mutate properties will throw a `TypeError`. **Never destructure** a Proxy object, as this preserves a static snapshot and terminates the reactive link.

---

## Environment Variable Injection
The `EnvProcessor` maps flattened environment variables back to nested configuration objects.
*   **Formula**: `APP__{MODULE_KEY}__{PATH_SEGMENTS}`
*   **Example**: `APP__MODULE_DATABASE__OPTIONS__TIMEOUT` maps to `module.database.options.timeout`.

---

## Type Safety CLI
To prevent magic string collisions and ensure full IntelliSense support, execute the validation tool after any schema modification:

```bash
npm run config:validate
```
Generates typed mappings in: `src/common/config-module/types/config.generated.ts`.
