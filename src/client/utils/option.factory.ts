import {OptionType} from '../enums/command-option.enum.js';

interface CreateOptionParams {
    /** Имя параметра (строчные буквы, без пробелов) */
    name: string;
    /** Описание параметра */
    description: string;
    /** Обязателен ли параметр */
    required?: boolean;
    /** Поддержка автодополнения (только для String, Integer, Number) */
    autocomplete?: boolean;
}

/**
 * Фабрика для декларативного создания опций команд.
 * Позволяет избежать прямого использования числовых типов Discord API.
 */
export const OptionsFactory = {
    String: (params: CreateOptionParams) => ({...params, type: OptionType.String}),
    Integer: (params: CreateOptionParams) => ({...params, type: OptionType.Integer}),
    Boolean: (params: CreateOptionParams) => ({...params, type: OptionType.Boolean}),
    User: (params: CreateOptionParams) => ({...params, type: OptionType.User}),
    Channel: (params: CreateOptionParams) => ({...params, type: OptionType.Channel}),
    Role: (params: CreateOptionParams) => ({...params, type: OptionType.Role}),
    Mentionable: (params: CreateOptionParams) => ({...params, type: OptionType.Mentionable}),
    Number: (params: CreateOptionParams) => ({...params, type: OptionType.Number}),
    Attachment: (params: CreateOptionParams) => ({...params, type: OptionType.Attachment})
};
