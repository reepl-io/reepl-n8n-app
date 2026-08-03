# n8n-nodes-reepl

Reepl nodes for n8n. Use Reepl in self-hosted n8n workflows to create, schedule, publish, and manage LinkedIn content, or start workflows from Reepl webhook events.

## Installation

Install the community package from the n8n editor:

1. Open **Settings > Community nodes**.
2. Choose **Install a community node**.
3. Enter `n8n-nodes-reepl` and confirm the community-node warning.
4. Restart n8n if it asks you to.

For a self-hosted installation managed from a terminal, install the package in the n8n environment with `npm install n8n-nodes-reepl` and restart n8n.

n8n Cloud availability requires the package to complete n8n's community-node verification process; self-hosted n8n can install community packages directly from npm.

## Credentials

Create a **Reepl API** credential with:

- **API Key** — create one in Reepl under **Settings > API Keys**. Give it only the scopes your workflow needs.
- **Base URL** — leave this as `https://api.reepl.io/v1` unless you are using a compatible Reepl API endpoint.

The credential test calls `GET /external/me`. API keys are sent in the `X-API-Key` header.

## Nodes

### Reepl

The action node includes the 24 operations in the Reepl External API:

- User: get the current user
- Drafts: list, create, get, update, and delete drafts
- Posts: list, publish, schedule, update, delete, publish now, and add a comment
- Tools: check content virality
- Carousel: create, get, update, and delete carousel drafts
- Webhooks: list, create, get, update, delete, and test subscriptions

Each operation accepts JSON for path parameters, query parameters, and request bodies. Expressions are supported, so values can be mapped from previous nodes. The API response is returned under the `data` field together with the operation metadata.

### Reepl Trigger

The trigger registers and removes a Reepl webhook subscription when the workflow is activated or deactivated. Available events:

- Post Published
- Draft Created
- Publish Failed

Webhook subscriptions require a paid Reepl plan and an API key with the `webhooks:manage` scope. Reepl signs deliveries with HMAC-SHA256; the trigger verifies the signature using the secret received when it creates the subscription.

## Development

```bash
npm install
npm test
```

`npm test` compiles the nodes, copies the icon into `dist`, and runs the helper tests. Use `npm run typecheck` for a type-only check and `npm run build` to create the package output.

## Version history

### 1.0.0

- Added 24 Reepl External API operations.
- Added Reepl webhook triggers for post published, draft created, and publish failed events.
