# APZHUB-owned Zammad CE/LTS engine

| Field  | Value                                      |
| ------ | ------------------------------------------ |
| Port   | `127.0.0.1:19081`                          |
| Legacy | **Do not touch** `apz-zammad-*` on `18081` |

## Bring-up

```bash
cd infrastructure/docker/engines/zammad-lts
cp zammad-lts.env.example .env   # set strong DB password
docker compose --env-file image-pins.env --env-file .env up -d
```

Wait for nginx on 19081. Fresh instances need **AutoWizard** (system_init_done) before API tokens work:

```bash
# Write auto_wizard.json into the rails container (Users + Settings), then:
docker exec apzhub-zammad-lts-rails bundle exec rails r 'AutoWizard.setup'
# Create a persistent API token and save the generated value (before_create generates it):
docker exec apzhub-zammad-lts-rails bundle exec rails r '
admin = User.find_by!(email: "admin@apzhub.local")
t = Token.create!(user: admin, action: "api", name: "apzhub-support", persistent: true,
  preferences: { permission: ["admin", "ticket.agent"] })
puts t.token
'
```

Point APZHUB:

```bash
ZAMMAD_INTEGRATION_ENABLED=true
ZAMMAD_BASE_URL=http://127.0.0.1:19081
ZAMMAD_API_BASE_URL=http://127.0.0.1:19081
```

`.secrets/zammad`:

```bash
ZAMMAD_API_TOKEN=<token from Token.create! output>
```

Restart `@apzhub/web` so dotenv + `.secrets` loaders pick up the new URLs/token.

## Honesty

Engines stay outside the hub. Legacy Zammad remains for the older platform until Owner deprecates it.
