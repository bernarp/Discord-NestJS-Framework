import lodash from 'lodash';

const {merge} = lodash;

/**
 * Utility class for performing deep merging of configuration objects.
 * Encapsulates the merging logic to maintain consistent behavior across the configuration pipeline.
 */
export class ConfigMerger {
    /**
     * Performs a deep merge of multiple source objects into a new object.
     * Uses lodash.merge internally to ensure nested properties are correctly combined.
     *
     * @param sources - An array of plain objects to be merged.
     * @returns {Record<string, any>} A new object containing the merged results from all sources.
     */
    public static merge(...sources: Record<string, any>[]): Record<string, any> {
        return merge({}, ...sources);
    }
}
