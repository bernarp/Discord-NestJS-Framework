import {Injectable} from '@nestjs/common';
import * as stackTrace from 'stack-trace';
import * as path from 'path';
import * as ICustomLogger from '../interfaces/ICustomLogger.js';
import {ILogContext} from '../interfaces/ILogEntry.js';
import {LOGGER_CONFIG} from '../constants/LoggerConfig.js';

type CallSite = ReturnType<typeof stackTrace.get>[number];

/**
 * @service LogContextResolver
 * @description Service for determining contextual information about the logger's call site.
 */
@Injectable()
export class LogContextResolver implements ICustomLogger.ILogContextResolver {
    private readonly _contextCache = new Map<string, ILogContext>();
    private readonly _projectRoot: string;

    constructor() {
        this._projectRoot = process.cwd();
    }

    public resolveContext(stackDepth?: number): ILogContext {
        try {
            const trace = stackTrace.get();
            const callerDepth = stackDepth ?? LOGGER_CONFIG.SYSTEM.STACK_TRACE_CALLER_DEPTH;

            let callSite = trace[callerDepth];
            for (let i = 1; i < trace.length && i < LOGGER_CONFIG.PERFORMANCE.STACK_TRACE_DEPTH; i++) {
                const site = trace[i];
                if (site && this._isNotLoggerCall(site.getFileName())) {
                    callSite = site;
                    break;
                }
            }

            if (!callSite) {
                return this._createUnknownContext();
            }

            const filePath = callSite.getFileName() || LOGGER_CONFIG.DEFAULTS.CONTEXT_UNKNOWN;
            const cacheKey = this._createCacheKey(filePath, callSite.getLineNumber() || 0);

            const cached = this._contextCache.get(cacheKey);
            if (cached) {
                return cached;
            }

            const context = this._createContextFromCallSite(callSite);
            this._contextCache.set(cacheKey, context);

            return context;
        } catch (error) {
            return this._createUnknownContext();
        }
    }

    public clearCache(): void {
        this._contextCache.clear();
    }

    /**
     * Creates context from a CallSite object.
     * @private
     * @param {CallSite} callSite - CallSite object from stack-trace.
     * @returns {ILogContext} Created context.
     */
    // FIX: Using our robust CallSite type alias
    private _createContextFromCallSite(callSite: CallSite): ILogContext {
        const filePath = callSite.getFileName() || LOGGER_CONFIG.DEFAULTS.CONTEXT_UNKNOWN;
        const lineNumber = callSite.getLineNumber() || 0;
        const methodName = callSite.getMethodName() || callSite.getFunctionName();
        const typeName = callSite.getTypeName();

        return {
            filePath,
            relativeFilePath: this._getRelativePath(filePath),
            lineNumber,
            methodName: methodName || undefined,
            className: typeName || undefined
        };
    }

    private _createUnknownContext(): ILogContext {
        return {
            filePath: LOGGER_CONFIG.DEFAULTS.CONTEXT_UNKNOWN,
            relativeFilePath: LOGGER_CONFIG.DEFAULTS.CONTEXT_UNKNOWN,
            lineNumber: 0,
            methodName: undefined,
            className: undefined
        };
    }

    private _isNotLoggerCall(fileName: string | null): boolean {
        if (!fileName) return false;
        // Normalize path and remove 'file://' prefix for consistent checking
        const normalizedPath = fileName
            .replace(/^file:[\\/]+/, '')
            .replace(/\\/g, '/')
            .toLowerCase();
        // Exclude all files within the logger's directory
        return !normalizedPath.includes('common/_logger');
    }

    private _getRelativePath(filePath: string): string {
        try {
            // Remove 'file://' prefix before calculating relative path
            const cleanPath = filePath.replace(/^file:[\\/]+/, '');
            // Convert to relative path from project root
            let relativePath = path.relative(this._projectRoot, cleanPath);

            // If we are running from 'dist', try to make it cleaner
            if (relativePath.startsWith('dist' + path.sep)) {
                // If it's in dist/src, we can optionally strip dist/src to show original structure
                // relativePath = relativePath.replace(/^dist[\\/]src[\\/]/, '');
            }

            return relativePath || cleanPath;
        } catch {
            return filePath;
        }
    }

    private _createCacheKey(filePath: string, lineNumber: number): string {
        return `${filePath}:${lineNumber}`;
    }
}
