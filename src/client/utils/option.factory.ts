import {OptionType} from '../enums/command-option.enum.js';
import {CreateOptionParams} from '../dto/command-option-params.dto.js';

/**
 * Factory for declarative creation of command options.
 * Helps avoid direct usage of Discord API numerical types.
 */
export const OptionsFactory = {
    /** Creates a string option */
    String: (params: CreateOptionParams) => ({...params, type: OptionType.String}),
    /** Creates an integer option */
    Integer: (params: CreateOptionParams) => ({...params, type: OptionType.Integer}),
    /** Creates a boolean option */
    Boolean: (params: CreateOptionParams) => ({...params, type: OptionType.Boolean}),
    /** Creates a user option */
    User: (params: CreateOptionParams) => ({...params, type: OptionType.User}),
    /** Creates a channel option */
    Channel: (params: CreateOptionParams) => ({...params, type: OptionType.Channel}),
    /** Creates a role option */
    Role: (params: CreateOptionParams) => ({...params, type: OptionType.Role}),
    /** Creates a mentionable option */
    Mentionable: (params: CreateOptionParams) => ({...params, type: OptionType.Mentionable}),
    /** Creates a number option */
    Number: (params: CreateOptionParams) => ({...params, type: OptionType.Number}),
    /** Creates an attachment option */
    Attachment: (params: CreateOptionParams) => ({...params, type: OptionType.Attachment})
};
