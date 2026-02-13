import {Module, Injectable} from '@nestjs/common';
import {z} from 'zod';
import {Config} from './common/decorators/config.decorator.js';

const TestSchema = z.object({
    enabled: z.boolean().default(true),
    retryCount: z.number().int().default(3),
    timeout: z.number().default(5000).describe('Request timeout in ms'),
    batchSize: z.number().default(50),
    apiKey: z.string().optional().describe('System API Key'),
    endpoint: z.string().default('https://api.example.com'),
    adminEmail: z.string().optional().describe('Primary admin contact'),
    traceId: z.string().optional().describe('Correlation trace ID'),
    logLevel: z.preprocess(val => (val === '' ? undefined : val), z.enum(['debug', 'info', 'warn', 'error'])).default('info'),
    tags: z.array(z.string()).default(['default']),
    nested: z
        .object({
            value: z.string().default('hello')
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
