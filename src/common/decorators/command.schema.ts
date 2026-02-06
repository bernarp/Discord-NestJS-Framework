import {z} from 'zod';
import {OptionType} from '@client/enums/command-option.enum.js';
import {CommandRegistrationType} from '@client/enums/command-registration-type.enum.js';

/**
 * Command argument options (String, Number, User, etc.)
 */
const commandOptionSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(32)
        .regex(/^[\w-]{1,32}$/),
    description: z.string().min(1).max(100),
    type: z.nativeEnum(OptionType).refine(type => type !== OptionType.Subcommand && type !== OptionType.SubcommandGroup, {
        message: 'Do not use Subcommand/Group here, use corresponding decorators instead'
    }),
    required: z.boolean().optional(),
    autocomplete: z.boolean().optional()
});

/**
 * Schema for the @SubCommand decorator
 */
export const subCommandDecoratorSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(32)
        .regex(/^[\w-]{1,32}$/),
    description: z.string().min(1).max(100),
    options: z.array(commandOptionSchema).optional()
});

/**
 * Schema for the @CommandSlash decorator
 */
export const rootCommandSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(32)
        .regex(/^[\w-]{1,32}$/),
    description: z.string().min(1).max(100),
    registration: z.nativeEnum(CommandRegistrationType).default(CommandRegistrationType.GUILD),
    options: z.array(commandOptionSchema).optional(),
    defaultMemberPermissions: z.union([z.string(), z.number(), z.bigint()]).optional(),
    dmPermission: z.boolean().optional()
});

export type SubCommandOptions = z.infer<typeof subCommandDecoratorSchema>;
export type CommandOptions = z.infer<typeof rootCommandSchema>;
