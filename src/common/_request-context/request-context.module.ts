import {Global, Module} from '@nestjs/common';
import {RequestContextService} from './services/RequestContext.service.js';

@Global()
@Module({
    providers: [RequestContextService],
    exports: [RequestContextService]
})
export class RequestContextModule {}
