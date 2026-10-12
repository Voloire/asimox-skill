# asimoX maintenance (internal)

Operator-only instructions for minting keys and managing credits. Not needed by end users.

The buyer-facing flow mints keys via the deployed service; this documents the offline path.

## Mint an account and key

`voloirex-admin` runs the admin CLI of `Voloire/voloirex-agents` (Python 3.13, inside the
`web` image, or an editable install). It needs GCP application-default credentials with
Firestore access to the project.

```
voloirex-admin --project voloirex-agents-6276639 create-account --name <n> --email <e>
voloirex-admin --project voloirex-agents-6276639 create-key --account <id> --name review --scope asimox --monthly-cap 1000
voloirex-admin --project voloirex-agents-6276639 topup --account <id> --credits <n>
voloirex-admin --project voloirex-agents-6276639 balance --account <id>
```

The key is shown once and stored only as a hash.

## Cost model

Per review the ledger reserves credits = fixed fee + model cost, bounded by `cap_credits`.
Model cost uses the prices in `config/agents/asimox.json` with a multiplier. The model calls
run on OpenRouter, billed to the operator's `OPENROUTER_API_KEY`.