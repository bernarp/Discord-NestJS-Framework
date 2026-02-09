import {Injectable} from '@nestjs/common';
import {ZodTypeNames} from '../constants/config.constants.js';
import {ISchemaAnalyzer} from '../interfaces/schema-analyzer.interface.js';

/**
 * @class SchemaAnalyzer
 * @description Utility service for analyzing and unwrapping Zod schemas.
 */
@Injectable()
export class SchemaAnalyzer implements ISchemaAnalyzer {
    /**
     * Recursively unwraps Zod schema wrappers to reach the underlying core type.
     * @param schema - The Zod schema to unwrap.
     * @returns The underlying core Zod schema.
     */
    public unwrap(schema: any): any {
        if (!schema) return schema;
        let current = schema;
        let depth = 0;

        while (depth < 50) {
            if (!current || !current._def) break;
            const def = current._def;
            const typeName = (def.typeName || def.type || '').toLowerCase();

            if (
                [
                    ZodTypeNames.OPTIONAL,
                    ZodTypeNames.NULLABLE,
                    ZodTypeNames.DEFAULT,
                    ZodTypeNames.READONLY,
                    ZodTypeNames.CATCH,
                    'zodoptional',
                    'zodnullable',
                    'zoddefault',
                    'zodreadonly',
                    'zodcatch'
                ].includes(typeName)
            ) {
                current = def.innerType ?? current;
            } else if ([ZodTypeNames.EFFECTS, 'zodeffects'].includes(typeName)) {
                current = def.schema ?? current;
            } else if ([ZodTypeNames.PIPELINE, 'zodpipeline'].includes(typeName)) {
                current = def.in ?? current;
            } else if ([ZodTypeNames.BRANDED, 'zodbranded'].includes(typeName)) {
                current = def.type ?? current;
            } else if ([ZodTypeNames.LAZY, 'zodlazy'].includes(typeName)) {
                current = typeof def.getter === 'function' ? def.getter() : current;
            } else {
                break;
            }
            depth++;
        }
        return current;
    }

    /**
     * Determines if a schema represents a Zod object.
     * @param schema - The schema to check.
     * @returns True if it's an object.
     */
    public isObject(schema: any): boolean {
        const inner = this.unwrap(schema);
        const def = inner?._def;
        if (!def) return false;
        const typeName = (def.typeName || def.type || '').toLowerCase();
        return typeName.includes(ZodTypeNames.OBJECT) || (inner.constructor && inner.constructor.name === 'ZodObject');
    }
}
