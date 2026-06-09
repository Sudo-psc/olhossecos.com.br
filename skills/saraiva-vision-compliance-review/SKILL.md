---
name: saraiva-vision-compliance-review
description: Review local changes for code quality, CFM medical advertising compliance, and visual alignment with saraivavision.com.br. Use when asked to review PRs, diffs, pages, marketing copy, or UI changes for Saraiva Vision or related clinic sites.
---

# Saraiva Vision Compliance Review

## Overview

Provide a structured review for local changes with focus on CFM/publicidade
medica compliance, content safety, and visual alignment with Saraiva Vision.

## Workflow

### 1) Collect context

- Check `git status -sb` and `git diff` (staged and unstaged).
- Identify files with copy, CTAs, marketing claims, or patient references.
- If there is no diff, ask the user for the target files or branch.

### 2) Compliance review (CFM / publicidade medica)

- Use `references/cfm-publicidade-medica.md` as a checklist.
- Flag anything that could be interpreted as a guarantee, superlative, or
  inducement.
- Confirm professional identifiers (name + CRM/UF) when applicable.
- If the rule is uncertain, label it as "needs legal review" and explain why.

### 3) Design alignment with Saraiva Vision

- Use `references/saraiva-vision-design.md` to check colors, typography, CTA
  treatments, glass panels, gradients, and motion.
- Call out mismatched palettes, fonts, or component styles.

### 4) Report findings

- Provide findings ordered by severity (Blocker, High, Medium, Low).
- Include file path references and concise fixes.
- Ask clarifying questions when evidence is missing.
- Do not edit code unless explicitly requested.

## Output format

Use this structure for review responses:

1. Findings (ordered by severity, include file references)
2. Open questions / assumptions
3. Optional change summary (only after findings)

## Resources

### references/

- `references/cfm-publicidade-medica.md`
- `references/saraiva-vision-design.md`
