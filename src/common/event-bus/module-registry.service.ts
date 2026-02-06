import { Injectable, Inject } from '@nestjs/common';
import { LOG } from '@/common/_logger/constants/LoggerConfig.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Placeholder for ModuleRegistryService.
 * Intended to check if a specific event or module is available.
 */
@Injectable()
export class ModuleRegistryService {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) { }

    /**
     * Checks if the event name is valid and its destination module is active.
     * @param eventName - The name of the event to check.
     */
    public checkAvailability(eventName: string): void {
        this._logger.debug(`Checking availability for event: ${eventName}`);
    }
}
