# AGENTS.md

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

- Remember to update the version number for every commit.
- The version to update to depends on the change size (e.g., major for large/breaking changes, minor for new features, patch for small fixes).

## Git

- Commit and push for every meaningful change automatically.
