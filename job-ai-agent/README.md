# Job AI Agent — Zero-Cost Test Mode

This branch contains a sanitized, dry-run-only prototype for job discovery and matching.

## Hard rules
- No OpenAI API calls
- No paid API keys
- No cloud VM
- No live job submissions
- No real CV, email, phone, cookies, or job-site credentials committed
- Deterministic scoring only in this test phase

## Test pipeline
1. Normalize a job description.
2. Score it against a sanitized candidate skill profile.
3. Apply threshold policy.
4. Log APPLY/SKIP decision.
5. Run unit tests in GitHub Actions.

## Production direction
For a zero-additional-cost live setup, use a self-hosted runner on an existing machine and keep personal data/secrets outside the repository.
