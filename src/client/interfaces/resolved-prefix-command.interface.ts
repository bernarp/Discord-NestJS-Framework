import {IPrefixCommandOptions} from './prefix-command-options.interface.js';

/**
 * Structure of a resolved command in the registry.
 */
export interface IResolvedPrefixCommand {
    /** Configuration options */
    options: IPrefixCommandOptions;

    /** The class instance where the command is defined */
    instance: any;

    /** Method name to execute */
    methodName: string;

    /** Map of registered sub-commands */
    subCommands: Map<string, IResolvedPrefixCommand>;

    /** Position-to-Name mapping for parameters */
    paramMap: Map<string, number>;
}
