import {NestFactory} from '@nestjs/core';
import {Logger} from '@nestjs/common';
import {AppModule} from './src/app.module.js';

/**
 * Bootstrap function for Standalone Application.
 * Initializes the NestJS DI container without starting an HTTP server.
 */
async function bootstrap() {
    const logger = new Logger('Bootstrap');

    try {
        /**
         * Use createApplicationContext for non-HTTP applications (standalone).
         * This will trigger all lifecycle hooks like onModuleInit in your services.
         */
        const app = await NestFactory.createApplicationContext(AppModule);
        app.enableShutdownHooks();
        logger.log('Discord Bot application context initialized successfully');
        logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
        logger.error('Critical failure during application bootstrap', error);
        process.exit(1);
    }
}

// npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss}"
bootstrap();
