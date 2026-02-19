# Story Tracking Protocol
# Version: 1.0
# Location: _bmad/bmm/data/story-tracking-protocol.md
#
# This protocol defines how BMAD-S agents sync story lifecycle
# changes to an external tracker (Notion). All agents that create
# or modify stories MUST read this file before performing any sync.

---

## 1. Activation Check

Before ANY tracking operation:

1. Read `_bmad/bmm/config.yaml` → `story_tracking`
2. If `story_tracking` section is absent → **SKIP silently**. Do not mention tracking.
3. If `story_tracking.enabled` is `false` → **SKIP silently**. Do not mention tracking.
4. If `story_tracking.enabled` is `true` → proceed with protocol below.

**Tracking is NEVER blocking.** If the Notion MCP is unavailable, log a warning and continue the workflow normally.

---

## 2. Data Model

### Epics (BD 1)
| Field | Type | Description |
|-------|------|-------------|
| Nombre | Title | Epic title from epics.md |
| ID | Text | "E-01", "E-02", etc. |
| Status | Formula | Auto-calculated from child stories |
| Progreso | Formula | "3/5 stories Done" |

### Stories (BD 2)
| Field | Type | Values |
|-------|------|--------|
| Nombre | Title | Story title |
| ID | Text | "S-1.1", "S-2.3", etc. |
| Epic | Relation → Epics | Parent epic |
| Phase | Select | `Backlog` · `Development` · `Review` · `Testing` · `Acceptance` · `Done` · `Blocked` |
| Agent | Select | `Lisa` · `Homer` · `Edna` · `PM` · `Wiggum` · `—` |
| Resultado QA | Select | `—` · `Automatic Tests Pass` · `Automatic Tests Fail` |
| Resultado PM | Select | `—` · `Accepted` · `Rejected` |
| Story Points | Number | Estimated effort |
| Fichero BMAD | Text | Path to markdown, e.g. `implementation-artifacts/story-S-1.1.md` |
| Notas | Text | Last agent action summary |
| Creada | Date | Auto on creation |
| Completada | Date | Auto when Phase → Done |

### Tasks (BD 3)
| Field | Type | Values |
|-------|------|--------|
| Nombre | Title | Task description |
| Story | Relation → Stories | Parent story |
| Status | Checkbox | ✅ / ☐ |
| Tipo | Select | `Code` · `Test` · `Config` · `Fix` |

---

## 3. Phase Pipeline

```
Backlog → Development → Review → Testing → Acceptance → Done
 Lisa      Homer        Homer CR   Edna      PM (human)    ✅
```

If `acceptance_phase` is `false` in config, the pipeline is:
```
Backlog → Development → Review → Testing → Done
 Lisa      Homer        Homer CR   Edna      ✅
```

---

## 4. Agent Actions

### Lisa (PM) — Creates stories and epics

**On EP (generate epics and stories):**
1. For each epic: create record in Epics database
   - Nombre: epic title
   - ID: epic ID (e.g., "E-01")
2. For each story: create record in Stories database
   - Nombre: story title
   - ID: story ID (e.g., "S-1.1")
   - Epic: relation to parent epic
   - Phase: `Backlog`
   - Agent: `—`
   - Fichero BMAD: path to the story markdown file
   - Notas: "Lisa: story created from EP workflow"
3. For each story: write acceptance criteria as page content
   - Append to the created Notion page (not a field):
     - Heading 2: "Acceptance Criteria"
     - Body: Gherkin scenarios or acceptance criteria from the story markdown
   - This allows the PM to review criteria directly in Notion during Acceptance phase

**On CE (create individual story):**
- Same as above for a single story.

### Homer (Dev) — Implements and reviews

**On DS start (dev story):**
- Phase → `Development`
- Agent → `Homer`
- Notas → "Homer: started implementation"

**On DS complete (implementation done):**
- Create Task records for each significant item implemented
  - Status: ✅
  - Tipo: `Code` or `Config` as appropriate
- Notas → "Homer: implementation complete — <brief summary>"

**On CR start (code review):**
- Phase → `Review`
- Agent → `Homer`
- Notas → "Homer: code review started"

**On CR approved:**
- Phase → `Testing`
- Agent → `—`
- Notas → "Homer: CR approved"

**On CR rejected:**
- Phase → `Development`
- Agent → `Homer`
- Notas → "Homer: CR rejected — <reason>"

### Edna (QA) — Tests

**On QA start:**
- Agent → `Edna`
- Notas → "Edna: running tests"

**On QA pass:**
- Resultado QA → `Automatic Tests Pass`
- Create Task records for tests written (Tipo: `Test`, Status: ✅)
- If `acceptance_phase` is `true`:
  - Phase → `Acceptance`
  - Agent → `PM`
  - Notas → "Edna: all tests pass — pending PM acceptance"
- If `acceptance_phase` is `false`:
  - Phase → `Done`
  - Agent → `—`
  - Completada → today's date
  - Notas → "Edna: all tests pass — story complete"

**On QA fail:**
- Phase → `Development`
- Agent → `Homer`
- Resultado QA → `Automatic Tests Fail`
- Notas → "Edna: tests failed — <summary of failures>"

### PM (Human) — Acceptance (manual in Notion)

This phase is NOT automated. The PM works directly in Notion:

**On Accept:**
- Phase → `Done` (manual in Notion)
- Resultado PM → `Accepted` (manual in Notion)
- Completada → today's date (auto or manual)

**On Reject:**
- Phase → `Development` (manual in Notion)
- Resultado PM → `Rejected` (manual in Notion)
- Add rejection reason to Notas (manual in Notion)

---

## 5. Notion MCP Operations

### 5.1 Relation Resolution (CRITICAL)

Notion relations work by **page_id** (internal UUID), NOT by our text ID field ("S-1.1", "E-01").
Before creating any record that has a relation, you MUST resolve the target's page_id first.

**Resolve Epic page_id:**
```
1. Query BD Epics: filter where field "ID" equals "<epic_id>" (e.g., "E-01")
2. Extract page_id from the first result
3. If no result found → log warning: "Epic <epic_id> not found in Notion"
4. Store: epic_page_id = <result>
```

**Resolve Story page_id:**
```
1. Query BD Stories: filter where field "ID" equals "<story_id>" (e.g., "S-1.1")
2. Extract page_id from the first result
3. If no result found → log warning: "Story <story_id> not found in Notion"
4. Store: story_page_id = <result>
```

**If resolution fails:** proceed without the relation. Create the record with all other fields but leave the relation empty. Log the failure. NEVER halt the workflow because a relation couldn't be resolved.

### 5.2 Creating an Epic (Lisa EP)

```
Create page in Epics database:
  Nombre: "<epic title>"
  ID: "<epic_id>"                         # e.g., "E-01"

→ Store returned page_id as epic_page_id (needed for creating its stories)
```

### 5.3 Creating a Story (Lisa EP/CE)

```
Step 1 — Resolve parent epic:
  Query BD Epics where "ID" = "<epic_id>"
  → epic_page_id

Step 2 — Create story:
  Create page in Stories database:
    Nombre: "<story title>"
    ID: "<story_id>"                      # e.g., "S-1.1"
    Epic: [{ id: epic_page_id }]          # ← RELATION (resolved in step 1)
    Phase: "Backlog"
    Agent: "—"
    Fichero BMAD: "<path to markdown>"
    Notas: "Lisa: story created from EP workflow"

  → Store returned page_id as story_page_id

Step 3 — Write story body as page content:
  Append blocks to story_page_id:
    - Heading 2: "Acceptance Criteria"
    - Content: the acceptance criteria, Gherkin scenarios, or story body
      from the markdown file. Preserve formatting (Given/When/Then, etc.)
    - If the story has additional context (notes, constraints, references),
      add a Heading 2: "Notes" followed by that content.

  This allows the PM to open the story in Notion and see the full
  criteria without navigating to the markdown file.
```

**Batch creation:** When Lisa creates multiple stories for the same epic, resolve the epic page_id ONCE and reuse it for all stories in that epic.

### 5.4 Updating a Story (Homer DS/CR, Edna QA)

```
Step 1 — Resolve story:
  Query BD Stories where "ID" = "<story_id>"
  → story_page_id

Step 2 — Update fields:
  Update page story_page_id:
    Phase: "<new_phase>"                  # Use phase_values from config
    Agent: "<agent_name>"                 # Use agent_values from config
    Notas: "<agent>: <action summary>"
    (+ any other fields as per section 4)
```

### 5.5 Creating a Task (Homer DS, Edna QA)

```
Step 1 — Resolve parent story:
  Query BD Stories where "ID" = "<story_id>"
  → story_page_id

Step 2 — Create task:
  Create page in Tasks database:
    Nombre: "<task description>"
    Story: [{ id: story_page_id }]        # ← RELATION (resolved in step 1)
    Status: true                          # checkbox: true = done, false = pending
    Tipo: "<Code|Test|Config|Fix>"
```

**Batch creation:** When Homer or Edna create multiple tasks for the same story, resolve the story page_id ONCE and reuse it for all tasks.

### 5.6 Operation Summary by Agent

```
Lisa EP (creating epics + stories):
  1. For each epic:
     a. Create epic in Notion → get epic_page_id
     b. For each story in this epic:
        - Create story with Epic relation → epic_page_id → get story_page_id
        - Append acceptance criteria as page content to story_page_id

Homer DS (implementing story S-1.1):
  1. Resolve S-1.1 → story_page_id
  2. Update story: Phase → Development, Agent → Homer
  3. ... (implementation happens) ...
  4. For each task completed:
     - Create task with Story relation → story_page_id
  5. Update story: Notas → summary

Homer CR (code review for S-1.1):
  1. Resolve S-1.1 → story_page_id (or reuse from DS if same session)
  2. Update story: Phase → Review, Agent → Homer
  3. ... (review happens) ...
  4. Update story: Phase → Testing (if approved) or Development (if rejected)

Edna QA (testing S-1.1):
  1. Resolve S-1.1 → story_page_id
  2. Update story: Agent → Edna
  3. ... (testing happens) ...
  4. For each test written:
     - Create task with Story relation → story_page_id, Tipo → Test
  5. Update story: Phase → Acceptance/Done, Resultado QA → Automatic Tests Pass/Fail
```

---

## 6. Error Handling

- If Notion MCP is not configured → skip silently, log to execution-log.yaml
- If Notion MCP is configured but not responding → skip silently, log warning
- If a story ID is not found in Notion → log warning, do NOT create a new one (may be a sync issue)
- If a field name doesn't match → log error with expected vs actual field name
- NEVER halt a workflow because of tracking failure

Log format for execution-log.yaml:
```yaml
notion_sync:
  status: SKIPPED | SUCCESS | PARTIAL | FAILED
  reason: "<why, if not SUCCESS>"
  operations:
    - action: "update_story"
      story_id: "S-1.1"
      result: "ok" | "failed: <reason>"
```

---

## 7. Field Name Customization

All Notion field names are read from config.yaml. If a user's Notion database uses different field names (e.g., "Estado" instead of "Phase", "Prioridad" instead of "Priority"), they configure the mapping in config.yaml and agents use those names.

Default field names are in English. The `phase_mapping.field_name` and `phase_mapping.values` in config.yaml control the exact names used in Notion API calls.
