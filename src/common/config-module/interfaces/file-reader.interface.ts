/**
 * Interface for reading raw configuration files from the persistence layer.
 * Usually implemented by a file-system based service for YAML/JSON files.
 */
export interface IConfigFileReader {
    /**
     * Reads and parses a configuration file for a given key.
     * @param directory - The directory path relative to the process root.
     * @param key - The configuration key (identifies the file).
     * @returns {Promise<Record<string, any>>} A promise resolving to the parsed content.
     */
    read(directory: string, key: string): Promise<Record<string, any>>;
}
