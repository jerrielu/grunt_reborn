# AGENTS.md

- Use the same language you received to reply.

This game is designed for mobile phone in portrait mode.

## Drawing Elements

- All drawing elements must be reusable. Do not inline one-off drawing code in scenes; extract it into reusable components.
- Put reusable drawing elements into the appropriate folder (e.g. `src/sprites` and its `components/` subfolder), not scattered across scenes or other modules.
- Drawing elements must follow the same format as the sprites (see `src/sprites/sprite_template.ts` and `src/sprites/components/`): `Component`/`CompositeComponent` based, with `pixels()`, `position`, `color`, `rects`/`offsets`, and rendering through `SpriteTemplate`/`renderToCanvas()`, so they can be composed and reused like sprites.

## Testing

- Always perform necessary tests, but not excessive tests, good enough is OK.
- Code containing business logic or functional logic requires unit tests.
- No test is required for any visual element such as rendering etc.
- Code without any logic (pure data, config, markup, trivial passthrough) does not require tests.
- Always include both end-to-end (E2E) gameplay tests for verifying the game works correctly. Each E2E test must log every behavior and every game state data change. Do not perform E2E test through browser or in a visual way.
- Every change (feature, fix, or refactor) must be covered by E2E gameplay tests that exercise the affected behavior and assert on the resulting game state; do not merge a change without corresponding E2E coverage.

## Documentation

- Always remember updating documentation.
- README.md contains a short description of the game.
- design.md provides the high-level design of the game.
- changes.md records changes for every version. Changes must be concise and meaningful, and should contain feature changes that players should know.

## Code Review

- After implementation, review the code and make sure there is no dead code (unused imports, functions, config, or UI paths).
- Ensure newly added code is necessary. In many scenarios, refactor the existing code to support a new feature instead of adding parallel or duplicate code.

## Versioning

- Do not update the version number for every commit. Instead, at the end of the job completion, update the version number in the final commit.
- The version to update to depends on the change size (e.g., major for large/breaking changes, minor for new features, patch for small fixes).

## Git

- Commit locally for every meaningful change, but do not push for every commit.
- At the end of the job completion, push in the final commit (which includes the version number update).
