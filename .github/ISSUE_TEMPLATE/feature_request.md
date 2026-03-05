---
name: Feature Request
about: Request a new feature for automated implementation
labels: enhancement
---

## User Story

As a [role], I want [feature] so that [benefit]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Technical Details

[Implementation hints, affected components, etc.]

- name: Send Notification
  if: success()
  run: |
  curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
  -H 'Content-Type: application/json' \
  -d '{"text":"✅ Feature implemented for issue #${{ github.event.issue.number }}"}'
- name: Quality Checks
  run: |
  npm run lint
  npm run type-check
