# APZPEN GitHub App secrets (example — do not commit real keys)

Create gitignored file `.secrets/github-app`:

```bash
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=987654
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
APZPEN_GITHUB_WEBHOOK_SECRET=replace-me
```

Or place PEM alone in `.secrets/github-app.pem` and set IDs in `.secrets/github-app`.

Until App credentials exist, APZPEN uses `.secrets/git` PAT for `sync_prs`.
