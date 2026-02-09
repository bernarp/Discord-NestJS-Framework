/**
 * Type representing a unique key for identifier a configuration module.
 */
export type TConfigKey = string;

/**
 * DeepPartial utility to allow partial overrides of nested configuration objects.
 */
export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

/**
 * Result of a configuration lookup, including its current value and metadata.
 */
export interface IConfigSnapshot<T = any> {
    value: T;
    version: number;
    updatedAt: Date;
}
