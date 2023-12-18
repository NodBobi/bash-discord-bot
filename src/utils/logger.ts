interface IConstructorOptions {
    writeErrorLogs: Boolean,
    errorLogPath: String,
}

export default class Logger {
    options: IConstructorOptions

    constructor(options: IConstructorOptions) {
        this.options = options
    }

    info(message: any) {

    }
}