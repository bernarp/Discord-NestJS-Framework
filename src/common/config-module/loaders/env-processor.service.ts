import {Injectable} from '@nestjs/common';
import {IEnvProcessor} from '../interfaces/env-processor.interface.js';
import {ConfigInternal} from '../constants/config.constants.js';

/**
 * Service responsible for extracting configuration overrides from environment variables.
 * Transforms flattened environment variables (e.g. APP__MODULE__PROP) into nested objects.
 */
@Injectable()
export class EnvProcessor implements IEnvProcessor {
    /**
     * Scans process.env for variables matching the pattern {PREFIX}{KEY}__{PROPERTY}.
     *
     * @param key - The module configuration key.
     * @param prefix - The global environment variable prefix (e.g. APP__).
     * @returns {Record<string, any>} A nested object with overrides from ENV.
     */
    public extract(key: string, prefix: string): Record<string, any> {
        const envObj: Record<string, any> = {};
        const fullPrefix = `${prefix}${key.toUpperCase().replace(/[-.]/g, '_')}${ConfigInternal.ENV_DELIMITER}`;

        for (const [envKey, value] of Object.entries(process.env)) {
            if (envKey.startsWith(fullPrefix)) {
                const pathParts = envKey
                    .slice(fullPrefix.length)
                    .split(ConfigInternal.ENV_DELIMITER)
                    .map(p => this._formatEnvKey(p));
                this._setDeep(envObj, pathParts, this._parseEnvValue(value));
            }
        }
        return envObj;
    }

    /**
     * Converts a SCREAMING_SNAKE_CASE string back to camelCase.
     * @private
     */
    private _formatEnvKey(part: string): string {
        return part.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    }

    /**
     * Detects and converts string values from ENV into primitives (number, boolean).
     * @private
     */
    private _parseEnvValue(value: string | undefined): any {
        if (value === undefined) return undefined;
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
        return value;
    }

    /**
     * Helper to set a property value in a deeply nested object by its path.
     * @private
     */
    private _setDeep(obj: any, path: string[], value: any): void {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];
            if (!part) continue;
            if (!(part in current)) current[part] = {};
            current = current[part];
        }
        const lastPart = path[path.length - 1];
        if (lastPart) {
            current[lastPart] = value;
        }
    }
}
