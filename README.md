# PriceCompareKaro Frontend

## Run locally

```bash
npm install
npm run dev
```

## Environment variable

Create `.env` from `.env.example`:

```env
VITE_COMPARE_API_URL=http://localhost:5000/api/compare
```

For Vercel, add this environment variable:

```env
VITE_COMPARE_API_URL=https://your-render-backend-url.onrender.com/api/compare
```

Do not upload your real `.env` file to GitHub.
