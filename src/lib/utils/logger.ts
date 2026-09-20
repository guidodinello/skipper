type LogLevel = "debug" | "info" | "warn" | "error" | "action";

class Logger {
    private isDevelopment = import.meta.env.DEV;
    private prefix = "[Skipper]"; // TODO: set this prefix dynamically based on the add on name or some id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private log(level: LogLevel, message: string, ...args: any[]) {
        if (!this.isDevelopment && level === "debug") {
            return; // Skip debug logs in production
        }

        const timestamp = new Date().toISOString();
        const formattedMessage = `${this.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;

        switch (level) {
            case "debug":
                // eslint-disable-next-line no-console
                console.debug(formattedMessage, ...args);
                break;
            case "info":
                // eslint-disable-next-line no-console
                console.info(formattedMessage, ...args);
                break;
            case "warn":
                console.warn(formattedMessage, ...args);
                break;
            case "error":
                console.error(formattedMessage, ...args);
                break;
            case "action":
                // eslint-disable-next-line no-console
                console.log(formattedMessage, ...args);
                break;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug(message: string, ...args: any[]) {
        this.log("debug", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info(message: string, ...args: any[]) {
        this.log("info", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn(message: string, ...args: any[]) {
        this.log("warn", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(message: string, ...args: any[]) {
        this.log("error", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action(message: string, ...args: any[]) {
        this.log("action", message, ...args);
    }
}

export const logger = new Logger();
