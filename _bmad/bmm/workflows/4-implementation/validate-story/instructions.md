# Validate Story — Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {project-root}/_bmad/bmm/workflows/4-implementation/validate-story/workflow.yaml</critical>
<critical>Communicate all responses in {communication_language} and language MUST be tailored to {user_skill_level}</critical>
<critical>This workflow READS an existing story — it does NOT create a new one</critical>

<step n="1" goal="Identify the story to validate">
  <action>Load `{sprint_status}` and list stories with status `ready-for-dev` or `backlog`</action>
  <action>If the user specified a story, use that one. Otherwise, present the list and ask which story to validate.</action>
  <action>Load the story file from `{implementation_artifacts}/`</action>
  <action if="story file not found">HALT: "Story file not found. Run CS (Create Story) first."</action>
</step>

<step n="2" goal="Validate story structure and completeness">
  <action>Check each item in the validation checklist: `{validation}`</action>
  <action>For each check, mark PASS or FAIL with a brief reason</action>
  <action>Do NOT modify the story file — only report findings</action>
</step>

<step n="3" goal="Cross-reference against source documents">
  <action>Load `{epics_file}` and verify the story's acceptance criteria trace back to epic requirements</action>
  <action>Load `{architecture_file}` and verify technical decisions in the story are consistent with architecture</action>
  <action>If either file is unavailable, note it as SKIPPED (not FAIL)</action>
</step>

<step n="4" goal="Emit validation result">
  <action>Present the validation report using this format:</action>

```
📋 STORY VALIDATION REPORT
══════════════════════════
Story: {story_key} — {story_title}
Epic: {epic_num}
Status: {current_status}

Structure & Completeness:
  {PASS/FAIL} — {check description}
  ...

Traceability:
  {PASS/FAIL/SKIPPED} — AC traces to epic requirements
  {PASS/FAIL/SKIPPED} — Technical decisions consistent with architecture

Result: PASS | FAIL ({N} issues found)
```

  <action if="all checks PASS">
    Recommend the story for development:
    "✅ Story validated. Ready for DS (Dev Story) with Homer."
    Update story status to `ready-for-dev` in `{sprint_status}` if currently `backlog`.
  </action>

  <action if="any check FAIL">
    List all failures and recommend:
    "❌ Story has {N} issues. Fix with CS (Create Story) before sending to dev."
    Do NOT update story status.
  </action>
</step>
