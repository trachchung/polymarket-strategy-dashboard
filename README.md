# Sweeps Dashboard

A modern dashboard for monitoring sweeps performance and execution history, built with Next.js and TypeScript.

## Features

- **Real-time Sweeps Monitoring**: Track sweep executions with live updates
- **Performance Metrics**: View aggregated statistics including success rates, total values, and execution metrics
- **Historical Data**: Browse through sweep history with sorting and filtering capabilities
- **Responsive Design**: Clean, modern UI that works on all devices
- **Real-time Updates**: Automatic data refresh every 10-30 seconds

## API Integration

The dashboard integrates with two main API endpoints:

- `/api/sweeps` - Fetch paginated sweep data with filtering and sorting
- `/api/sweeps/aggregated` - Get aggregated statistics for different time periods

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Set up your environment variables:

```bash
# Create .env.local file
NEXT_PUBLIC_BASE_API_URL=http://localhost:8080
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   └── layout.tsx         # Root layout
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── summary-cards.tsx    # Performance metrics cards
│   │   └── sweeps-table.tsx     # Sweeps data table
│   ├── layout/            # Layout components
│   │   ├── app-layout.tsx      # Main app layout
│   │   ├── header.tsx          # Top navigation
│   │   └── sidebar.tsx         # Side navigation
│   └── ui/                # Reusable UI components
├── hooks/
│   └── use-sweeps.ts     # Custom hooks for API data
├── lib/
│   ├── api.ts            # API client functions
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **SWR** - Data fetching and caching
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date formatting

## API Endpoints

The dashboard expects the following API structure:

### GET /api/sweeps

Returns paginated sweep data with optional filtering and sorting.

**Query Parameters:**

- `limit` (number, default: 50) - Number of results to return
- `offset` (number, default: 0) - Number of results to skip
- `market_slug` (string) - Filter by market slug
- `market_question` (string) - Filter by market question
- `market_type` (string) - Filter by market type
- `sort_field` (string) - Sort by field (created_at, post_order_value)
- `sort_direction` (string) - Sort direction (asc, desc)

### GET /api/sweeps/aggregated

Returns aggregated sweep statistics for different time periods.

**Query Parameters:**

- `period` (string, default: "all") - Time period (1d, 3d, 7d, 1m, all)
- `market_type` (string) - Filter by market type

## Development

The project uses ESLint for code linting and TypeScript for type checking. Run the following commands:

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

For other deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
