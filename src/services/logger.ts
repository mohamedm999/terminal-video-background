import * as vscode from 'vscode';
import { EXTENSION_ID } from '../types';

export class Logger {
  private static outputChannel: vscode.OutputChannel | null = null;

  static initialize(): void {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel('Terminal Video Background');
    }
  }

  private static log(level: string, message: string, ...args: unknown[]): void {
    if (!this.outputChannel) {
      this.initialize();
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (args.length > 0) {
      this.outputChannel!.appendLine(`${formattedMessage} ${JSON.stringify(args)}`);
    } else {
      this.outputChannel!.appendLine(formattedMessage);
    }
  }

  static info(message: string, ...args: unknown[]): void {
    this.log('INFO', message, ...args);
  }

  static warn(message: string, ...args: unknown[]): void {
    this.log('WARN', message, ...args);
    console.warn(`[${EXTENSION_ID}]`, message, ...args);
  }

  static error(message: string, error?: unknown, ...args: unknown[]): void {
    this.log('ERROR', message, ...args);
    if (error instanceof Error) {
      this.log('ERROR', error.message, error.stack);
    } else if (error) {
      this.log('ERROR', String(error));
    }
    console.error(`[${EXTENSION_ID}]`, message, error, ...args);
  }

  static debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, ...args);
    }
  }

  static show(): void {
    if (!this.outputChannel) {
      this.initialize();
    }
    this.outputChannel!.show();
  }

  static dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
  }
}
