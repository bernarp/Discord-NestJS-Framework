/**
 * Utility for string manipulations within the config module.
 */
export class StringUtils {
    /**
     * Converts string to PascalCase (handles both kebab-case and plain strings).
     * @param str - The source string.
     * @returns PascalCase string.
     */
    public static toPascalCase(str: string): string {
        return str
            .split(/[-_]/)
            .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
            .join('');
    }

    /**
     * Converts a key into a PascalCase type name suffixing 'Config'.
     * @param key - The configuration key.
     * @returns Formatted type name.
     */
    public static formatTypeName(key: string): string {
        return this.toPascalCase(key.replace(/\./g, '-')) + 'Config';
    }
}
