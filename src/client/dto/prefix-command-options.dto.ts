/**
 * Metadata configuration for Prefix Commands.
 */
export interface IPrefixCommandOptions {
    /** Primary name of the command */
    name: string;

    /** Alternative triggers for the command */
    aliases?: string[];

    /** Brief description of what the command does */
    description?: string;

    /** Category for grouping commands in help lists */
    category?: string;
}
