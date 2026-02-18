# Quinn QA - Automate

**Goal**: Generate, refine, or validate automated API and E2E tests for implemented code.

**Scope**: This workflow handles tests ONLY. It does **not** perform code review or story validation (use Code Review `CR` for that).

## Step 0: Secture Adaptation Gate (MANDATORY — execute BEFORE anything else)

🛑 **STOP. Before detecting frameworks or generating tests, you MUST execute your Secture Adaptation protocol.**

Execute Steps 1 and 2 of your `secture_adaptation` now:

1. **Emit the ARTIFACT INVENTORY** — scan for existing test artifacts, behavioral specs (EARS/Gherkin), and report what you find.
2. **Declare the EXECUTION MODE** — state VERIFY, REFINE, or GENERATE with reasoning.

**Do NOT proceed to Step 1 below until you have printed both blocks to the user.**

The declared execution mode governs the rest of this workflow:
- **VERIFY**: Skip Steps 3 and 4 entirely. Go directly to Step 5 (Run Tests) to validate existing tests pass, then to Step 6 to report coverage against defined behavior.
- **REFINE**: Execute Steps 1-6, but in Steps 3 and 4 only add tests where coverage is missing. Do NOT replace or remove existing valid tests.
- **GENERATE**: Execute Steps 1-6 as originally designed.

## Instructions

### Step 1: Detect Test Framework

Check project for existing test framework:

- Look for `package.json` dependencies (playwright, jest, vitest, cypress, etc.)
- Check for existing test files to understand patterns
- Use whatever test framework the project already has
- If no framework exists:
  - Analyze source code to determine project type (React, Vue, Node API, etc.)
  - Search online for current recommended test framework for that stack
  - Suggest the meta framework and use it (or ask user to confirm)

### Step 2: Identify Features

Ask user what to test:

- Specific feature/component name
- Directory to scan (e.g., `src/components/`)
- Or auto-discover features in the codebase

### Step 3: Generate API Tests (if applicable)

For API endpoints/services, generate tests that:

- Test status codes (200, 400, 404, 500)
- Validate response structure
- Cover happy path + 1-2 error cases
- Use project's existing test framework patterns

### Step 4: Generate E2E Tests (if UI exists)

For UI features, generate tests that:

- Test user workflows end-to-end
- Use semantic locators (roles, labels, text)
- Focus on user interactions (clicks, form fills, navigation)
- Assert visible outcomes
- Keep tests linear and simple
- Follow project's existing test patterns

### Step 5: Run Tests

Execute tests to verify they pass (use project's test command).

If failures occur, fix them immediately.

### Step 6: Create Summary

Output markdown summary:

```markdown
# Test Automation Summary

## Generated Tests

### API Tests
- [x] tests/api/endpoint.spec.ts - Endpoint validation

### E2E Tests
- [x] tests/e2e/feature.spec.ts - User workflow

## Coverage
- API endpoints: 5/10 covered
- UI features: 3/8 covered

## Next Steps
- Run tests in CI
- Add more edge cases as needed
```

## Keep It Simple

**Do:**

- Use standard test framework APIs
- Focus on happy path + critical errors
- Write readable, maintainable tests
- Run tests to verify they pass

**Avoid:**

- Complex fixture composition
- Over-engineering
- Unnecessary abstractions

**For Advanced Features:**

If the project needs:

- Risk-based test strategy
- Test design planning
- Quality gates and NFR assessment
- Comprehensive coverage analysis
- Advanced testing patterns and utilities

→ **Install Test Architect (TEA) module**: <https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/>

## Output

Save summary to: `{implementation_artifacts}/tests/test-summary.md`

**Done!** Tests generated and verified.
