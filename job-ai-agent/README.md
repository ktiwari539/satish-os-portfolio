# Job AI Agent — Zero-Cost Test Mode

This branch contains a sanitized, dry-run-only job discovery and matching system.

## Hard rules
- No OpenAI API calls or paid model APIs
- No paid API keys
- No cloud VM
- No live job submissions
- No real CV, email, phone, cookies, or job-site credentials committed
- Deterministic scoring only in this test phase

## Current architecture

```text
Public ATS GET endpoints
        ↓
Greenhouse / Lever adapters
        ↓
JD normalization + skill/experience extraction
        ↓
Deterministic weighted matcher
        ↓
Eligibility / sponsorship policy
        ↓
SQLite duplicate guard
        ↓
CSV audit log
        ↓
QUALIFIED_DRY_RUN or SKIP
```

There is intentionally **no submission module** in this branch.

## Supported discovery sources
- Greenhouse published job boards via public GET API
- Lever published postings via public GET API

Both adapters use Python's standard library only.

## Offline QA

```bash
python job-ai-agent/src/cli.py --demo \
  --db /tmp/job-agent-demo.db \
  --audit /tmp/job-agent-demo.csv
```

Expected result: one demo job qualifies and one is skipped.

## Real read-only discovery

Copy `config/sources.example.json`, add public Greenhouse board tokens and/or Lever site slugs, then run the CLI without `--demo`.

## Release gates
1. CI compile + unit tests
2. Secret / paid-dependency guard
3. Offline dry-run
4. Public-source discovery test
5. QA review of scoring and policy decisions
6. Only later: private repo + external secret/profile storage + controlled browser runner

## Production direction
For a zero-additional-cost live setup, use a self-hosted runner on an existing machine. Keep personal data and browser sessions outside the repository.
