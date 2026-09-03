<!--
Sync Impact Report
- Version change: none -> 1.0.0
- Modified principles: none; initial constitution established
- Added sections: Core Principles, Technology and Product Constraints,
  Development Workflow, Governance
- Removed sections: none
- Follow-up TODOs: ratification date requires confirmation from the project owner
-->

# Dynamic Survey Viewer Constitution

## Core Principles

### I. JSON-Driven Domain Contract
Survey behavior MUST be derived from a validated, strictly typed JSON domain model
covering surveys, pages, questions, options, attachments, and responses. Adding or
changing a survey MUST NOT require changing application code. Invalid configuration
MUST produce a user-visible error and MUST NOT render an ambiguous or partially valid
survey. This keeps survey content deployable independently from the renderer.

### II. Feature Isolation and Contracts First
Each question type and file-upload capability MUST be implemented behind an explicit
domain contract and an independently testable standalone Angular component or service.
Business rules MUST reside in domain services and validators rather than templates or
presentation components. New contracts and models MUST be defined before their
implementations so Copilot and Spec Kit can extend features without coupling them to
unrelated screens.

### III. Validation and Submission Integrity
Required answers, selection bounds, text lengths, and required attachments MUST be
validated before page navigation and again before submission. The client MUST provide
immediate feedback, while the submission boundary MUST remain suitable for equivalent
server-side validation. File type and size restrictions MUST be enforced, and a
submission MUST never report success until its response and attachment handling has
completed successfully.

### IV. Testable Quality Gates
Every feature MUST include unit tests for its domain rules and component behavior.
Integration tests MUST cover JSON parsing, question rendering contracts, page
navigation, validation across pages, and submission with attachments. Changes MUST
pass formatting, type checking, tests, and a production build before review. The
project MUST target at least 80% unit-test coverage for maintained application code;
exceptions require written rationale in the implementation plan.

### V. Accessible, Responsive, and Maintainable UX
The application MUST support desktop, tablet, and mobile layouts and MUST use semantic
labels, keyboard-accessible controls, visible validation feedback, and sufficient
contrast. Angular standalone components, signals where stateful UI benefits from them,
and reusable PrimeNG components MUST be preferred. The interface MUST preserve the
approved maroon corporate visual language without placing business logic in the UI.

## Technology and Product Constraints

The application MUST use the current supported Angular release, TypeScript, RxJS,
PrimeNG, and PrimeFlex unless an approved decision record documents an exception.
Survey definitions MUST be versionable JSON assets or API responses. The initial
product scope includes dynamic multi-page surveys, radio buttons, checkboxes, single-
line text, text areas, zero to three attachments per question, validation, and
submission. Authentication, user management, authoring tools, analytics, reporting,
workflow approvals, and advanced conditional logic are outside the initial scope.

## Development Workflow

Work MUST proceed through Spec Kit artifacts: specification, implementation plan,
dependency-ordered tasks, implementation, and verification. Ambiguous requirements
MUST be clarified before planning. Each task MUST identify affected contracts,
validation behavior, tests, and acceptance evidence. Pull requests MUST describe
configuration or schema changes and include the commands used to verify them. A
deployment MUST use a successful production build and MUST not expose environment
files, Vercel credentials, or other secrets.

## Governance

This constitution is the governing standard for project design and delivery. A
proposed amendment MUST state its motivation, affected principles, compatibility
impact, and required migration or test changes. The project owner MUST approve
amendments before implementation, and the amendment MUST update the sync impact
report, version, and last-amended date.

Constitution versions use semantic versioning. MAJOR increments represent
backward-incompatible governance changes or removed principles. MINOR increments
represent new principles or materially expanded obligations. PATCH increments
represent clarifications and non-semantic corrections. Every feature review MUST
check compliance with this document and record justified exceptions in its Spec Kit
plan. The constitution MUST be reviewed whenever the technology baseline, product
scope, or delivery workflow materially changes.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-09-03

## Next Actions

- Original intent: Build the JSON-driven survey management and response collection
  application described in the supplied BRD.
  Follow-up command: `/speckit-specify`
- Original intent: Use Angular, PrimeNG, PrimeFlex, responsive UI, file uploads, and
  the listed question types in the application.
  Follow-up command: `/speckit-specify`
