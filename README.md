# NestJS Discord Bot Architecture

This project is a server-side application for a Discord bot built with **NestJS**. The architecture is based on **Event-Driven Architecture (EDA)**, **Domain-Driven Design (DDD)** principles, and a modular monolith structure.

## Tech Stack

*   **Runtime:** Node.js (v20+)
*   **Framework:** NestJS
*   **Discord Library:** discord.js v14
*   **Event Bus:** RxJS / EventEmitter2
*   **Validation:** Zod
*   **Logging:** Custom Logger (File + Console)

## Setup & Running

### 1. Environment Configuration
Create a `.env` file in the project root. Refer to the example configuration:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_development_guild_id

# Logging
LOG_LEVEL=DEBUG
LOG_FILES_PATH=./logs
```

### 2. Installation & Execution

```bash
# Install dependencies
pnpm install

# Run in Development mode (Watch mode)
pnpm start:dev

# Build and Run in Production
pnpm build
pnpm start:prod
```

---

## Architectural Highlights

### 1. Event-Driven Architecture (EDA) & Topology
Modules interact asynchronously via the `EventBusService`. Direct coupling between feature services is minimized.

*   **`@Emits(eventName)`**: Decorator for Service/Controller methods. It intercepts the return value, wraps it in a payload, and emits it to the Event Bus.
*   **`@Subscribe(eventName)`**: Decorator for event handlers. It automatically restores the execution context (Correlation ID).
*   **Topology Graph**: On startup, the `TopologyBuilderService` scans metadata to build a dependency graph of events (`Producer -> Event -> Consumer`). It warns about "orphan" events (emitted but not listened to) or broken chains.

### 2. Request Context & Traceability
A `RequestContext` mechanism based on `AsyncLocalStorage` is implemented.
*   Every interaction (Slash Command) or Event generates a unique `correlationId`.
*   This ID is automatically propagated through the entire call chain (Controller -> Service -> EventBus -> Subscriber).
*   The Logger automatically attaches this ID to every log entry, ensuring full traceability across asynchronous flows.

### 3. Global Exception Handling
*   **Global Filter:** A `GlobalExceptionFilter` catches all errors.
*   **Interaction Safety:** The filter checks the state of the Discord Interaction (`deferred` vs `replied`) to prevent "Interaction Already Replied" errors.
*   **Domain Exceptions:** Use `BotException` for logical errors that should be displayed to the user. System errors are masked in production.

---

## Development Guide

### Creating a Slash Command

Commands are registered declaratively using the `@CommandSlash` decorator.

```typescript
@Injectable()
@CommandSlash({
  name: 'ping',
  description: 'Checks bot latency',
  registration: CommandRegistrationType.GUILD
})
export class PingCommand implements ICommand {
  constructor(private readonly service: PingService) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Ideally, delegate logic to a Service
    await this.service.handlePing(interaction);
  }
}
```

### Using the Event Bus

To maintain type safety and traceability, follow these steps when implementing EDA:

#### 1. Define the Event Key
Always use the central dictionary. **Do not use magic strings.**

*File: `src/common/event-bus/events.dictionary.ts`*
```typescript
export const Events = {
  USER_CREATED: 'user.created',
  // ...
} as const;
```

#### 2. Create the Event Class
The payload **must** extend `BaseEvent`. This ensures the `correlationId` and `timestamp` are handled correctly by the infrastructure.

*File: `src/modules/users/events/user-created.event.ts`*
```typescript
import { BaseEvent } from '@/common/event-bus/base.event';

export class UserCreatedEvent extends BaseEvent {
  constructor(public readonly userId: string, public readonly email: string) {
    super(); 
    // The BaseEvent constructor handles timestamp. 
    // The EventBus service will inject the correlationId automatically.
  }
}
```

#### 3. Emitting an Event (Producer)
Use the `@Emits` decorator. The return value of the method will be used as the event payload.

```typescript
import { Events } from '@/common/event-bus/events.dictionary';

@Injectable()
export class UserService {
  
  @Emits(Events.USER_CREATED)
  async createUser(dto: CreateUserDto) {
    // ... business logic ...
    const user = await this.repo.save(dto);
    
    // Return the specific Event class instance
    return new UserCreatedEvent(user.id, user.email);
  }
}
```

#### 4. Handling an Event (Consumer)
Use the `@Subscribe` decorator. The `EventContextInterceptor` will ensure the logger works correctly within this asynchronous context.

```typescript
import { Events } from '@/common/event-bus/events.dictionary';

@Injectable()
export class NotificationService {
  
  @Subscribe(Events.USER_CREATED)
  async onUserCreated(event: UserCreatedEvent) {
    // event.correlationId is available here and matches the ID from UserService!
    this.logger.log(`Sending welcome email to ${event.email}`);
  }
}
```

## Project Structure

```text
src/
├── client/             # Discord specific logic (Gateway, Interactions Manager)
├── common/             # Shared kernel (Logger, EventBus, Decorators, Filters)
│   ├── event-bus/      # Core EDA implementation & Topology
│   ├── decorators/     # @Emits, @Subscribe, @CommandSlash
│   └── filters/        # Global exception handling
├── modules/            # Domain features (Feature Modules)
└── main.ts             # Entry point
```
