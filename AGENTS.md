# Project workflow

- After each requested website change, run `npm run verify` and `npm run verify:pages`, then commit the intended changes and push from the project root without asking for confirmation. The user has explicitly authorized this workflow.
- Wait for the GitHub Actions deployment and report its result. Do not claim changes are live until deployment succeeds.
- Do not open a browser. Use command-line checks and HTTP requests for verification.
- Preserve the repository-specific GitHub identity and SSH configuration; do not change global credentials.
- Never commit private keys, secrets, generated build output, or ignored internal records.
