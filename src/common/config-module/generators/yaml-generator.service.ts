import {Injectable, Inject} from '@nestjs/common';
import {ZodTypeNames} from '../constants/config.constants.js';
import {IYamlGenerator} from '../interfaces/yaml-generator.interface.js';
import {ISCHEMA_ANALYZER_TOKEN} from '../config.token.js';
import type {ISchemaAnalyzer} from '../interfaces/schema-analyzer.interface.js';

/**
 * @class YamlGenerator
 * @description Service for generating YAML skeletons with comments from Zod schemas.
 */
@Injectable()
export class YamlGenerator implements IYamlGenerator {
    constructor(@Inject(ISCHEMA_ANALYZER_TOKEN) private readonly _analyzer: ISchemaAnalyzer) {}

    /**
     * Generates a YAML skeleton string for a given schema.
     * @param schema - The Zod schema to process.
     * @returns Generated YAML string.
     */
    public generate(schema: any): string {
        return this._generateYamlWithComments(schema);
    }

    /**
     * Recursively traverses Zod schema to build a YAML string with placeholders and type comments.
     * @private
     */
    private _generateYamlWithComments(schema: any, indent = ''): string {
        const inner = this._analyzer.unwrap(schema);
        if (!inner || !inner._def) return '';

        if (this._analyzer.isObject(inner)) {
            let result = '';
            const def = inner._def;

            let shape: Record<string, any> = {};
            if (inner.shape && typeof inner.shape === 'object') {
                shape = inner.shape;
            } else if (def.shape) {
                shape = typeof def.shape === 'function' ? def.shape() : def.shape;
            }

            if (!shape) return '';

            for (const key in shape) {
                const field = shape[key];
                if (!field) continue;

                const fieldInner = this._analyzer.unwrap(field);
                if (!fieldInner || !fieldInner._def) continue;

                const fieldDef = fieldInner._def;
                const fieldTypeName = (fieldDef.typeName || fieldDef.type || 'unknown').toLowerCase();
                const description = field.description ? ` # ${field.description}` : '';

                if (fieldTypeName.includes(ZodTypeNames.OBJECT)) {
                    result += `${indent}${key}:${description}\n`;
                    result += this._generateYamlWithComments(fieldInner, indent + '  ');
                } else if (fieldTypeName.includes(ZodTypeNames.ARRAY)) {
                    let itemType = 'unknown';
                    const itemSchema = fieldDef.type instanceof Object && !Array.isArray(fieldDef.type) ? fieldDef.type : fieldDef.innerType || fieldDef.element;

                    if (itemSchema) {
                        const itemInner = this._analyzer.unwrap(itemSchema);
                        if (itemInner && itemInner._def) {
                            const itemDef = itemInner._def;
                            const rawType = itemDef.typeName || itemDef.type || 'unknown';
                            itemType = String(rawType).toLowerCase().replace(/zod/g, '');
                        }
                    }
                    result += `${indent}${key}: [] # List of <${itemType}>${description}\n`;
                } else {
                    let example = 'null';
                    const typeStr = fieldTypeName.replace(/zod/g, '');

                    if (typeStr.includes(ZodTypeNames.STRING)) example = '""';
                    else if (typeStr.includes(ZodTypeNames.NUMBER)) example = '0';
                    else if (typeStr.includes(ZodTypeNames.BOOLEAN)) example = 'false';
                    else if (typeStr.includes(ZodTypeNames.ENUM)) {
                        const values = fieldDef.values ? Object.values(fieldDef.values).join('|') : 'enum';
                        example = `"" # One of: [${values}]`;
                    }

                    result += `${indent}${key}: ${example} ${description ? description : `# <${typeStr}>`}\n`;
                }
            }
            return result;
        }
        return '';
    }
}
