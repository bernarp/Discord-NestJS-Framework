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
                    const itemSchema = fieldDef.element || fieldDef.innerType || (fieldDef.type instanceof Object && !Array.isArray(fieldDef.type) ? fieldDef.type : null);
                    if (itemSchema) {
                        const itemInner = this._analyzer.unwrap(itemSchema);
                        if (itemInner && itemInner._def) {
                            const itemDef = itemInner._def;
                            const rawType = itemDef.typeName || itemDef.type || 'unknown';
                            itemType = String(rawType).toLowerCase().replace(/zod/g, '');
                        }
                    }
                    const arrayBag = (fieldInner as any)?._zod?.bag;
                    const arrayConstraints: string[] = [];
                    if (arrayBag) {
                        if (arrayBag.length !== undefined) {
                            arrayConstraints.push(`len:${arrayBag.length}`);
                        } else {
                            if (arrayBag.minimum !== undefined) arrayConstraints.push(`min:${arrayBag.minimum}`);
                            if (arrayBag.maximum !== undefined) arrayConstraints.push(`max:${arrayBag.maximum}`);
                        }
                    }
                    const arrayConstraintStr = arrayConstraints.length > 0 ? ` [${arrayConstraints.join(', ')}]` : '';
                    result += `${indent}${key}: [] # List of <${itemType}>${arrayConstraintStr}${description}\n`;
                } else {
                    let example = 'null';
                    const typeStr = fieldTypeName.replace(/zod/g, '');
                    const constraints: string[] = [];
                    const bag = (fieldInner as any)?._zod?.bag;
                    if (bag) {
                        const isSafeInt = bag.format === 'safeint';
                        if (bag.length !== undefined) {
                            constraints.push(`len:${bag.length}`);
                        } else {
                            if (bag.minimum !== undefined && !(isSafeInt && Math.abs(bag.minimum) > 1e15)) {
                                constraints.push(`min:${bag.minimum}`);
                            }
                            if (bag.maximum !== undefined && !(isSafeInt && Math.abs(bag.maximum) > 1e15)) {
                                constraints.push(`max:${bag.maximum}`);
                            }
                        }
                        if (bag.exclusiveMinimum !== undefined) constraints.push(`>${bag.exclusiveMinimum}`);
                        if (bag.exclusiveMaximum !== undefined) constraints.push(`<${bag.exclusiveMaximum}`);
                        if (bag.multipleOf !== undefined) constraints.push(`step:${bag.multipleOf}`);
                        if (bag.format && bag.format !== 'safeint') {
                            constraints.push(bag.format);
                        } else if (isSafeInt) {
                            constraints.push('int');
                        }
                    }
                    if (constraints.length === 0) {
                        const checks = fieldDef.checks;
                        if (Array.isArray(checks)) {
                            for (const check of checks) {
                                if (check.kind) {
                                    const value = check.value !== undefined ? `:${check.value}` : '';
                                    constraints.push(`${check.kind}${value}`);
                                }
                            }
                        }
                    }

                    const constraintStr = constraints.length > 0 ? ` [${constraints.join(', ')}]` : '';
                    const typeComment = `<${typeStr}${constraintStr}>`;
                    const cleanDescription = description ? description.replace(/^ # /, '') : '';

                    if (typeStr.includes(ZodTypeNames.STRING)) example = '""';
                    else if (typeStr.includes(ZodTypeNames.NUMBER)) example = '0';
                    else if (typeStr.includes(ZodTypeNames.BOOLEAN)) example = 'false';
                    else if (typeStr.includes(ZodTypeNames.ENUM)) {
                        const enumSource = fieldDef.entries || fieldDef.values;
                        const values = enumSource ? Object.values(enumSource).join(' | ') : 'enum';
                        example = `"" # One of: [${values}]`;
                    }

                    result += `${indent}${key}: ${example} # ${typeComment}${cleanDescription ? ` | ${cleanDescription}` : ''}\n`;
                }
            }
            return result;
        }
        return '';
    }
}
