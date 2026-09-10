/**
 * Minimal ambient types for the Node builtins used by the design-system contract check.
 *
 * The project intentionally keeps its dependency list unchanged, so instead of adding
 * `@types/node` the check declares exactly the surface it uses.
 */

declare module 'node:fs' {
  export interface DirectoryEntry {
    name: string;
    isDirectory(): boolean;
  }

  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readdirSync(path: string, options: { withFileTypes: true }): DirectoryEntry[];
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
}
