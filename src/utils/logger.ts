import colors from "colors"

const color = {
  info: colors.cyan,
  warn: colors.yellow,
  error: colors.red,
  success: colors.green,
  ready: colors.green,
}

export interface IConstructorOptions {
  writeErrorLogs?: Boolean
  errorLogPath?: String
}

export class Logger {
  private options: IConstructorOptions

  constructor(options: IConstructorOptions) {
    this.options = options
  }

  info(message: any) {
    console.log(`${color.info("[INFO]")}: ${this.getTime()} - ${message}`)
    return this
  }

  warn(message: any) {
    console.log(`${color.warn("[WARN]")}: ${this.getTime()} - ${message}`)
    return this
  }

  error(message: any) {
    console.log(`${color.error("[ERROR]")}: ${this.getTime()} - ${message}`)
    return this
  }

  success(message: any) {
    console.log(`${color.success("[SUCCESS]")}: ${this.getTime()} - ${message}`)
    return this
  }

  ready(message: any) {
    console.log(`${color.ready("[READY]")}: ${this.getTime()} - ${message}`)
    return this
  }
  
  private getTime() {
    return `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
  }
}