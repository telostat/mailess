import { readFile as _readFile } from 'fs';
import { promisify } from 'util';

/**
 * Defines non-empty array type.
 */
export type NonEmptyArray<T> = Array<T> & { 0: T };

/**
 * Provides the type predicate for [[NonEmptyArray]] type.
 *
 * @param x Input to check.
 */
export function isNonEmptyArray<T>(x: Array<T>): x is NonEmptyArray<T> {
  return x.length > 0;
}

/**
 * Provides an application specific [[Error]] class.
 */
export class MailessError extends Error {
  public underlying?: Error;

  constructor(message: string, underlying?: Error) {
    super(message);
    this.underlying = underlying;
  }
}
/**
 * Provides identity function.
 */
export function identity<T>(x: T): T {
  return x;
}

/**
 * Provides an async file reader.
 */
export const readFile = promisify(_readFile);
