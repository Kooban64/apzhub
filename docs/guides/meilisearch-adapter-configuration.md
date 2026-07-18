# Meilisearch adapter configuration

| Field                    | Required                              | Description                                 |
| ------------------------ | ------------------------------------- | ------------------------------------------- |
| `baseUrl`                | Yes (default `http://127.0.0.1:7700`) | Meilisearch HTTP endpoint                   |
| `apiKeyRef`              | Recommended                           | Secret reference for API key — never inline |
| `timeoutMs`              | No (30s)                              | Request timeout                             |
| `retry`                  | No                                    | maxAttempts / baseDelayMs / maxDelayMs      |
| `ssl.rejectUnauthorized` | No (`true`)                           | TLS verification                            |
| `defaultIndexUid`        | No                                    | Convenience default for query ops           |
| `defaultHeaders`         | No                                    | Extra HTTP headers                          |

## Secret handling

```ts
{
  baseUrl: "https://search.internal",
  apiKeyRef: "vault://meilisearch/master-key" // ref only
}
```

Values are resolved only through Integration SDK `SecretProvider`. Diagnostics and logs never emit API keys.

## Validation

Use `validateMeilisearchConfiguration` or `MeilisearchConfigurationValidator`. Inline secret material in refs is rejected.
