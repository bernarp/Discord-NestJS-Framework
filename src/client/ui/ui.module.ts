import {Module, Global} from '@nestjs/common';
import {AdvancedComponentFactory} from './services/advanced-component-factory.service.js';

/**
 * Module providing UI infrastructure for Discord interactions.
 * Marks AdvancedComponentFactory as global for convenient usage across the bot.
 */
@Global()
@Module({
    providers: [AdvancedComponentFactory],
    exports: [AdvancedComponentFactory]
})
export class UIModule {}
