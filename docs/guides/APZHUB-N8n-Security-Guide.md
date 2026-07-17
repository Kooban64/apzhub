# APZHUB n8n Security Guide

- Credentials resolve only via Integration SDK `SecretProvider` refs (`apiKeyRef`, PAT ref, basic username/password refs)
- Never log or return API keys, basic passwords, webhook secrets, or credential secret fields
- Credential / variable / execution APIs return **metadata only**
- Diagnostics never include secrets
- Engine branding remains `hidden` in `integration.yaml`
- No browser storage, no Platform HTTP exposure in this milestone
