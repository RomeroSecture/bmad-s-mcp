# Story Validation Checklist

## Identity
- [ ] Story has a clear `story_key` (format: epic-X-story-Y)
- [ ] Story has a descriptive `title`
- [ ] Story belongs to an identified epic

## Acceptance Criteria
- [ ] At least one acceptance criterion is defined
- [ ] Each AC is testable (clear pass/fail condition)
- [ ] No AC is vague or ambiguous ("should work well", "be fast", etc.)
- [ ] ACs cover the happy path
- [ ] ACs cover at least one error/edge case

## Technical Context
- [ ] Target files or components are identified
- [ ] Technical approach or strategy is described
- [ ] Dependencies on other stories or systems are listed (or explicitly "none")
- [ ] No contradiction with architecture decisions

## Implementation Guidance
- [ ] Developer has enough context to start without guessing
- [ ] Scope is bounded — clear what is IN and OUT of this story
- [ ] Estimated complexity is noted (or inferable from scope)

## Dev-Ready Gate
- [ ] Story does not depend on an incomplete prior story
- [ ] All referenced files, APIs, or components from prior stories exist (or are created in this story)
