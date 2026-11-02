# AGENTS.md

This game is designed for mobile phone in portrait mode.

## Testing

- Always perform necessary tests, but not excessive tests.
- Code containing business logic or functional logic requires unit tests.
- Code without any logic (pure data, config, markup, trivial passthrough) does not require tests.
- Always include both end-to-end (E2E) tests and unit tests.
- End-to-end tests must verify the game works correctly. Each E2E test must log every behavior and every game state data change.

## Documentation

- Always remember updating documentation.
- README.md contains a short description of the game.
- design.md provides the high-level design of the game.
- changes.md records changes for every version. Changes must be concise and meaningful, and should contain feature changes that players should know.

## Versioning

- Do not update the version number for every commit. Instead, at the end of the job completion, update the version number in the final commit.
- The version to update to depends on the change size (e.g., major for large/breaking changes, minor for new features, patch for small fixes).

## Git

- Commit locally for every meaningful change, but do not push for every commit.
- At the end of the job completion, push in the final commit (which includes the version number update).
