// Angular publishes partially-compiled libraries (e.g. @angular/common's
// PlatformLocation) that fall back to JIT compilation at runtime. When specs
// are run through the raw Vitest CLI (outside the Angular CLI's unit-test
// builder), the Angular Linker is not applied, so the JIT compiler must be
// loaded up front to interpret those partial declarations.
import '@angular/compiler';

// The PersistenceService reads namespaced on-device state via localStorage.
// Node's default Vitest environment has no localStorage, so provide a tiny
// in-memory shim so persistence round-trips can be asserted in specs.
if (typeof globalThis.localStorage === 'undefined') {
  const memory = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return memory.size;
    },
    clear: () => memory.clear(),
    getItem: (key) => (memory.has(key) ? (memory.get(key) as string) : null),
    key: (index) => [...memory.keys()][index] ?? null,
    removeItem: (key) => {
      memory.delete(key);
    },
    setItem: (key, value) => {
      memory.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: shim, configurable: true, writable: true });
}
