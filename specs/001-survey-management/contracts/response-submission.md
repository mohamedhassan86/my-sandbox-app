# Contract: Response Submission

## Purpose

Defines the boundary used to submit a completed survey response and its attachments.
The concrete transport and endpoint remain implementation decisions.

## Request

A submission MUST contain:

- The survey identifier and configuration version.
- One answer for each configured question that has a response.
- Checkbox answers as a list of option values.
- Radio and text answers as strings.
- Each attachment with its owning question ID, file name, media type, size, and file
  content.

The client MUST send a request only after all pages pass validation.

## Success response

A successful response MUST indicate that the response and all attachments were accepted
and MUST provide a submission identifier or equivalent traceable result.

## Failure response

A failure MUST provide a user-safe message and preserve the respondent's local answers
and selected files where browser capabilities permit. A failure MUST NOT be presented as
success.
