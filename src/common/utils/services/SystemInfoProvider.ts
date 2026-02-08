import { Injectable } from '@nestjs/common';
import { ISystemInfoProvider } from '../interfaces/ISystemInfoProvider.js';

/**
 * Service responsible for gathering system environment details.
 */
@Injectable()
export class SystemInfoProvider implements ISystemInfoProvider {
    /**
     * @inheritdoc
     */
    public getNodeVersion(): string {
        return process.version;
    }

    /**
     * @inheritdoc
     */
    public getPlatform(): string {
        return process.platform;
    }

    /**
     * @inheritdoc
     */
    public getMemoryUsage(): string {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        return `${Math.round(used * 100) / 100} MB`;
    }
}
