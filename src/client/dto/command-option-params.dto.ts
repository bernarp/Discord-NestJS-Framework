/**
 * Parameters for creating a command option via OptionsFactory.
 */
export interface CreateOptionParams {
    /** The name of the parameter (lowercase, no spaces) */
    name: string;
    /** The description of the parameter */
    description: string;
    /** Whether the parameter is required */
    required?: boolean;
    /** Autocomplete support (only for String, Integer, Number) */
    autocomplete?: boolean;
}
