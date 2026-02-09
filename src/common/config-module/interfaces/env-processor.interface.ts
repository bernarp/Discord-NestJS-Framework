/**
 * Interface for the environment variable extractor.
 * Handles the logic of scanning process.env and mapping values to configuration structures.
 */
export interface IEnvProcessor {
    /**
     * Extracts values from process.env for the specified configuration key.
     * Maps keys like APP__MY_KEY__VAL to { val: ... }.
     *
     * @param key - The module configuration key.
     * @param prefix - The global environment prefix (e.g. APP__).
     * @returns {Record<string, any>} A parsed object containing found overrides.
     */
    extract(key: string, prefix: string): Record<string, any>;
}
