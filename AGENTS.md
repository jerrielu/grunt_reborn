# AGENTS.md

## Testing

- Always perform necessary tests, but not excessive tests.
- Code containing business logic or functional logic requires unit tests.
- Code without any logic (pure data, config, markup, trivial passthrough) does not require tests.
- Always include both end-to-end (E2E) tests and unit tests.
- End-to-end tests must verify the game works correctly. Each E2E test must log every behavior and every game state data change.

## Git

- Commit and push for every meaningful change automatically.
