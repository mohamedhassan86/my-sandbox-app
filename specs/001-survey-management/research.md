# Research: Dynamic Survey Management and Response Collection

## Decision: Use typed JSON as the survey contract

**Rationale**: A versioned JSON contract allows survey content to change without code
changes, supports validation before rendering, and is easy to fixture in tests.

**Alternatives considered**: Hardcoded forms were rejected because they require a code
deployment for every survey change. An authoring database was deferred because authoring
is outside the initial scope.

## Decision: Use discriminated question types

**Rationale**: A finite question-type vocabulary makes unsupported types rejectable,
keeps rendering rules explicit, and allows each renderer to be tested independently.

**Alternatives considered**: A generic field renderer was rejected because it obscures
question-specific validation and accessibility behavior.

## Decision: Keep response state in the active survey session

**Rationale**: The initial feature supports one respondent and one session. Keeping state
in the session avoids premature persistence design while preserving answers across pages.

**Alternatives considered**: Draft persistence and authenticated server sessions were
deferred because they are outside the specified scope.

## Decision: Validate before navigation and at submission

**Rationale**: Page validation gives immediate feedback, while complete final validation
protects against skipped pages and stale state. The submission boundary remains suitable
for equivalent server-side checks.

**Alternatives considered**: Validating only on Submit was rejected because respondents
would discover errors too late on multi-page surveys.

## Decision: Treat attachments as response items with explicit policy metadata

**Rationale**: Count, file type, and size rules belong to the question definition and can
be checked consistently before submission.

**Alternatives considered**: A global attachment policy was rejected because questions
may have different evidence requirements.

## Decision: Use Vitest for focused automated checks

**Rationale**: Vitest is already configured in the Angular project and supports fast unit
and integration tests for models, validators, services, and renderers.

**Alternatives considered**: Introducing a second test runner would add maintenance
without improving the feature's required coverage.

## Decision: Use Bootstrap-compatible form and layout conventions without adding Bootstrap

**Rationale**: Survey questions need a consistent, familiar form language across text,
radio, checkbox, file, rating, and satisfaction controls. Bootstrap-compatible classes
such as `container`, `row`, `col-12`, `form-group`, `form-label`, `form-control`, and
`form-check` provide that structure while keeping the current Angular standalone
components, PrimeFlex utilities, and reference-specific blue and maroon tokens intact.
The project will define the small required subset in `src/styles.css` rather than add a
second component framework or duplicate Bootstrap's full stylesheet.

**Alternatives considered**: Installing Bootstrap was rejected because the application
already uses PrimeNG and PrimeFlex, and importing a second full design system would add
unused CSS and competing component behavior. Keeping bespoke per-question styling was
rejected because it makes spacing, focus states, and responsive form behavior harder to
maintain consistently.
