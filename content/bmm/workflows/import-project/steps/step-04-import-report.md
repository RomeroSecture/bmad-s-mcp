# Step 4 — Generate Import Report

## Purpose
Produce a comprehensive gap analysis comparing what the project HAS vs what a BMAD-S-managed project NEEDS. This report becomes the roadmap for completing the integration.

## Instructions

### 4a. Evaluate each BMAD-S dimension

Score each area on a 4-level scale:

| Level | Meaning |
|-------|---------|
| ✅ COMPLETE | Exists and meets BMAD-S standards |
| 🟡 PARTIAL | Exists but has gaps |
| 🔴 ABSENT | Does not exist |
| ⚪ N/A | Not applicable to this project |

### 4b. Build the gap analysis table

```
IMPORT GAP ANALYSIS: <project_name>

PLANNING ARTIFACTS:
| Artifact | Status | Source | Gap |
|----------|--------|--------|-----|
| PRD | [✅|🟡|🔴] | <existing file or "None"> | <what's missing> |
| UX Spec | [✅|🟡|🔴] | <existing file or "None"> | <what's missing> |
| Architecture | [✅|🟡|🔴] | <existing file or "None"> | <what's missing> |
| Epics & Stories | [✅|🟡|🔴] | <existing file or "None"> | <what's missing> |

CODE QUALITY:
| Aspect | Status | Details | Gap |
|--------|--------|---------|-----|
| Tests (unit) | [✅|🟡|🔴] | <framework, count> | <what's missing> |
| Tests (E2E) | [✅|🟡|🔴] | <framework, count> | <what's missing> |
| Linting | [✅|🟡|🔴] | <tool> | <what's missing> |
| Type safety | [✅|🟡|🔴] | <TS strict, any count> | <what's missing> |

INFRASTRUCTURE:
| Aspect | Status | Details | Gap |
|--------|--------|---------|-----|
| Git repo | [✅|🟡|🔴] | <remote URL> | <what's missing> |
| Branch protection | [✅|🟡|🔴] | <rules> | <what's missing> |
| CI/CD | [✅|🟡|🔴] | <tool> | <what's missing> |
| Docker | [✅|🟡|🔴] | <files> | <what's missing> |
| Deployment | [✅|🟡|🔴] | <platform, URL> | <what's missing> |
| Env management | [✅|🟡|🔴] | <.env files> | <what's missing> |

DOCUMENTATION:
| Aspect | Status | Details | Gap |
|--------|--------|---------|-----|
| README | [✅|🟡|🔴] | <quality> | <what's missing> |
| Technical docs | [✅|🟡|🔴] | <files> | <what's missing> |
| API docs | [✅|🟡|🔴] | <tool/format> | <what's missing> |
| Deployment docs | [✅|🟡|🔴] | <files> | <what's missing> |
```

### 4c. Calculate maturity score

Count the statuses:
- ✅ = 2 points
- 🟡 = 1 point  
- 🔴 = 0 points
- ⚪ = exclude from total

```
MATURITY SCORE: <points> / <max possible> (<percentage>%)

Interpretation:
- 80-100%: Project is well-structured. BMAD-S adds governance and traceability.
- 50-79%: Solid base with gaps. BMAD-S will fill infrastructure and planning gaps.
- 20-49%: Early stage. Significant work needed to bring to BMAD-S standards.
- 0-19%: Skeleton only. Treat almost like a new project.
```

### 4d. Identify critical path

List the gaps in priority order:

```
CRITICAL PATH (recommended order):

1. [CRITICAL] <gap description> — Agent: <agent>, Trigger: <trigger>
   Why first: <justification>

2. [HIGH] <gap description> — Agent: <agent>, Trigger: <trigger>
   Why next: <justification>

3. [MEDIUM] <gap description> — Agent: <agent>, Trigger: <trigger>
   
...
```

**Priority rules:**
- Planning artifacts (PRD, architecture) come FIRST — other agents depend on them
- Tests come BEFORE deployment — validate what exists before shipping
- Git setup comes early — you want version control before making changes
- Deployment comes LAST — only after planning + code + tests are solid

### 4e. Save the report

Write the complete import report to: `_bmad-output/import-report.md`

## Wait for [C] before proceeding to Step 5.
