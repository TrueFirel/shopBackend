import chalk from "chalk";
import logger from "log4js";

export default class Logger {
    public logger: any;
    protected chalk: any;

    constructor() {
        this.logger = logger.getLogger();
        this.chalk = chalk;
    }

    public info(message: string) {
        this.logger.level = "info";
        this.logger.info(chalk.bgGreen.bold(message));
    }

    public error(message: string) {
        this.logger.level = "error";
        this.logger.error(chalk.bgRed.bold(message));
    }

    public debug(message: string) {
        this.logger.level = "debug";
        this.logger.debug(chalk.bgBlue.bold(message));
    }
}
