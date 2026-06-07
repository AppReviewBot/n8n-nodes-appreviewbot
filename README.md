# n8n-nodes-appreviewbot

An n8n community node for [AppReviewBot](https://appreviewbot.com) — fetch and monitor Apple App Store and Google Play reviews in your n8n workflows.

## What it does

AppReviewBot monitors app store reviews and surfaces them in real time. This node lets you:

- **Fetch reviews** from any app connected to your AppReviewBot organization (Apple App Store & Google Play)
- **List all connected apps** in your organization
- **Trigger workflows** automatically whenever new reviews arrive (polling trigger)

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

### AppReviewBot Trigger node (polling)

Polls AppReviewBot on a schedule and triggers the workflow when new reviews arrive.

- Select the app to watch
- Optional filters: country, rating
- On the first activation, the watermark is set to _now_ (no backfill)
- In **manual test mode**, returns the single most recent review

The trigger uses `content_updated_at` as a watermark, stored in workflow static data.

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

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start n8n with this node loaded (hot-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting issues |

## Compatibility

- n8n version: 1.0+
- Node.js: 18+

## License

MIT
