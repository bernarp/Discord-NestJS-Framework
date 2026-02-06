import {Injectable} from '@nestjs/common';
import {BotException} from '@/common/exceptions/bot.exception.js';
import {IErrorDetails} from '../interfaces/error-details.interface.js';

/**
 * Service responsible for converting technical exceptions into user-friendly error details.
 */
@Injectable()
export class ExceptionFormatterService {
    /**
     * Extracts displayable title and message from any exception.
     * @param exception - The error object to format.
     */
    public format(exception: unknown): IErrorDetails {
        if (exception instanceof BotException) {
            return {
                title: exception.userTitle,
                message: exception.message
            };
        }
        const errorMessage = exception instanceof Error ? exception.message : String(exception);
        const isDev = process.env.NODE_ENV === 'development';
        return {
            title: 'Системная ошибка',
            message: isDev ? `Debug: ${errorMessage}` : 'Произошла непредвиденная ошибка. Мы уже работаем над этим.'
        };
    }
}
