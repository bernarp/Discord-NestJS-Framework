import { Injectable } from '@nestjs/common';
import { IUptimeProvider } from '../interfaces/IUptimeProvider.js';

/**
 * Service responsible for calculating and formatting bot uptime.
 */
@Injectable()
export class UptimeProvider implements IUptimeProvider {
    /**
     * @inheritdoc
     */
    public getUptimeSeconds(): number {
        return process.uptime();
    }

    /**
     * @inheritdoc
     */
    public getFormattedUptime(): string {
        const uptime = this.getUptimeSeconds();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        return `${hours}h ${minutes}m ${seconds}s`;
    }
}
