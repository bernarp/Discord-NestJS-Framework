import {Module, Injectable} from '@nestjs/common';
import {z} from 'zod';
import {Config} from './common/decorators/config.decorator.js';

const TestSchema = z.object({
    enabled: z.boolean().default(true),
    retryCount: z.number().int().min(1).max(10).default(3),
    timeout: z.number().positive().default(5000).describe('Request timeout in ms'),
    batchSize: z.number().multipleOf(10).default(50),
    apiKey: z.string().length(32).optional().describe('System API Key'),
    endpoint: z.string().url().default('https://api.example.com'),
    adminEmail: z.string().email().describe('Primary admin contact'),
    traceId: z.string().uuid().optional().describe('Correlation trace ID'),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    tags: z.array(z.string()).min(1).max(5).default(['default']),
    nested: z
        .object({
            value: z.string().min(2).max(50).default('hello')
        })
        .default({value: 'hello'})
});

@Config({
    key: 'module.discord.logging.interaction',
    schema: TestSchema
})
@Injectable()
export class TestConfig {}

@Module({
    providers: [TestConfig],
    exports: [TestConfig]
})
export class TestConfigModule {}
