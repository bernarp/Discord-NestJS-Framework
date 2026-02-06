import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './src/app.module.js';

import { createEarlyLoggerOrFallback } from './src/common/_logger/utils/EarlyLoggerBootstrap.js';

/**
 * Bootstrap function for Standalone Application.
 * Initializes the NestJS DI container without starting an HTTP server.
 */
async function bootstrap() {
    const earlyLogger = await createEarlyLoggerOrFallback();

    try {
        /**
         * Use createApplicationContext for non-HTTP applications (standalone).
         * This will trigger all lifecycle hooks like onModuleInit in your services.
         */
        const app = await NestFactory.createApplicationContext(AppModule, {
            logger: earlyLogger
        });

        app.enableShutdownHooks();

        const logger = await app.resolve(Logger);
        logger.log('Discord Bot application context initialized successfully', 'Bootstrap');
        logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
    } catch (error) {
        console.error('Critical failure during application bootstrap', error);
        process.exit(1);
    }
}


// npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss}"
bootstrap();
