import {HttpException, HttpStatus} from '@nestjs/common';

/**
 * Custom exception class for business-logic errors in the bot.
 * Allows providing a user-friendly title and message.
 */
export class BotException extends HttpException {
    public readonly userTitle: string;

    constructor(message: string, userTitle: string = 'Ошибка', status: HttpStatus = HttpStatus.BAD_REQUEST) {
        super(message, status);
        this.userTitle = userTitle;
    }
}
