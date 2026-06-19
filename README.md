# n8n-nodes-appreviewbot

An n8n community node for [AppReviewBot](https://appreviewbot.com) — fetch Apple App Store and Google Play reviews in your n8n workflows.

Full setup guide: [n8n Integration docs](https://appreviewbot.com/docs/guides/n8n-integration)

## What it does

AppReviewBot monitors app store reviews and surfaces them in real time. This node lets you:

- **Fetch reviews** from any app connected to your AppReviewBot organization (Apple App Store & Google Play)
- **List all connected apps** in your organization

Pair the action node with n8n's built-in **Schedule Trigger** to run periodic review exports or alerts.

## Installation

1. Open your n8n instance and go to **Settings → Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-appreviewbot` and click **Install**
4. Restart n8n when prompted

## Credentials setup

You need an AppReviewBot API key (format: `arb_...`).

1. Log in to [dash.appreviewbot.com](https://dash.appreviewbot.com)
2. Go to **Organization Settings → API Keys**
3. Create or copy your API key
4. In n8n, add a new **AppReviewBot API** credential and paste the key

## Operations

### AppReviewBot node (action)

| Resource | Operation | Description |
|----------|-----------|-------------|
| App | Get Many | Return all apps connected to your organization |
| Review | Get Many | Return reviews for a selected app |

**Review — Get Many** supports:

- **App selector**: pick from a list or enter the composite app reference (e.g. `apple_app_store__123456789`)
- **Return All / Limit**: paginate automatically using cursor-based pagination (`starting_after`)
- **Additional Fields**: filter by country (ISO 3166-1 alpha-2), rating (1–5 stars), from/to date range (filters on `content_updated_at`)

See the [n8n Integration guide](https://appreviewbot.com/docs/guides/n8n-integration) for full setup details.

## Review object fields

| Field | Description |
|-------|-------------|
| `id` | Review UUID |
| `app_id` | App identifier |
| `app_store` | `apple_app_store` or `google_play_store` |
| `author_display_name` | Reviewer name |
| `content_title` | Review title |
| `content_body` | Review text |
| `content_rating` | Star rating (1–5) |
| `content_updated_at` | Unix timestamp of last update |
| `reply_text` | Developer reply (if any) |
| `country` | Two-letter country code |
| `store_permalink` | Link to the review in the store |

## Development

Install the n8n node CLI globally, then install project dependencies:

```bash
npm install --global @n8n/node-cli
npm install
```

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start n8n with this node loaded (hot-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run release` | Bump version, tag, and push (triggers npm publish via GitHub Actions) |

## Compatibility

- n8n version: 1.0+
- Node.js: 18+

## License

MIT
