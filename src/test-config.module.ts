import {Module, Injectable} from '@nestjs/common';
import {z} from 'zod';
import {Config} from './common/decorators/config.decorator.js';

const TestSchema = z.object({
    enabled: z.boolean().default(true),
    retryCount: z.number().default(3),
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
