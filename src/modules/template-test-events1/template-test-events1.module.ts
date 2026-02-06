import {Module} from '@nestjs/common';
import {TestEvents1Service} from './services/test-events1.service.js';
import {TestEvtCommand} from './commands/test-evt.command.js';

/**
 * Module A: Entry point for EDA tests.
 */
@Module({
    providers: [TestEvents1Service, TestEvtCommand]
})
export class TemplateTestEvents1Module {
    constructor(private readonly _: TestEvents1Service) {}
}
