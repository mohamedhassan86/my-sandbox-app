// Angular publishes partially-compiled libraries (e.g. @angular/common's
// PlatformLocation) that fall back to JIT compilation at runtime. When specs
// are run through the raw Vitest CLI (outside the Angular CLI's unit-test
// builder), the Angular Linker is not applied, so the JIT compiler must be
// loaded up front to interpret those partial declarations.
import '@angular/compiler';
