# HackHunt MERN Backend

Express + MongoDB backend that scrapes hackathons from:

- Unstop
- Devfolio
- Devpost
- MLH
- Hack2Skill

## Run locally

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Start the API:

```bash
npm run dev
```

4. Trigger a scrape:

```bash
curl -X POST http://localhost:3000/api/v1/admin/scrape \
  -H "Content-Type: application/json" \
  -d '{"sources":["UNSTOP","DEVFOLIO","DEVPOST","MLH","HACK2SKILL"]}'
```

## API

- `GET /api/v1/health`
- `GET /api/v1/hackathons`
- `GET /api/v1/hackathons/search?q=ai`
- `GET /api/v1/hackathons/trending?limit=6`
- `GET /api/v1/hackathons/filter`
- `GET /api/v1/hackathons/:slug`
- `POST /api/v1/admin/scrape`
- `GET /api/v1/admin/scrape-runs`

## Notes

- The response shape matches the current frontend contract in `frontend/src/services/hackathonsApi.js`.
- Some sources render listings client-side, so Playwright is included as a fallback renderer for better scrape coverage.
