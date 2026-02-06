import {Module} from '@nestjs/common';
import {TestEvents2Service} from './services/test-events2.service.js';

/**
 * Module B: Intermediate processor for EDA tests.
 */
@Module({
    providers: [TestEvents2Service]
})
export class TemplateTestEvents2Module {
    constructor(private readonly _: TestEvents2Service) {}
}
