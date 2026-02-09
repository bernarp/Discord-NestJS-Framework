import {Module, Injectable} from '@nestjs/common';
import {z} from 'zod';
import {Config} from './common/decorators/config.decorator.js';

const DeepSchema = z.object({
    serviceName: z.string().describe('The name of the microservice'),
    database: z
        .object({
            host: z.string().default('localhost'),
            port: z.number().max(65535).describe('Standard DB port'),
            options: z
                .object({
                    ssl: z.boolean().default(false),
                    pool: z.number().int().describe('Connection pool size')
                })
                .default({ssl: false, pool: 10})
        })
        .default({host: 'localhost', port: 5432, options: {ssl: false, pool: 10}}),
    tags: z.array(z.string()).describe('List of deployment tags')
});

@Config({
    key: 'module.deep.test',
    schema: DeepSchema
})
@Injectable()
export class DeepTestConfig {}

@Module({
    providers: [DeepTestConfig],
    exports: [DeepTestConfig]
})
export class DeepTestConfigModule {}
