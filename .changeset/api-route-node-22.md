---
"api-route": minor
---

Update route matching to path-to-regexp 9 and require Node.js 22.12 or later. The package still provides a CommonJS entry point. Build with TypeScript 7 and run the development example with tsx.

For ambiguous routes with multiple parameters in a single segment, the final parameter now takes the longest matching value.
