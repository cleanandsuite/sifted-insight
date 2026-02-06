# NOOZ News Aggregator

A modern Next.js frontend for reading and browsing articles from a Supabase-powered news aggregator.

![NOOZ News Aggregator](./docs/screenshot.png)

## Features

- 📰 **Article Grid** - Clean, responsive card layout displaying articles with featured images
- 🔍 **Search** - Real-time search across article titles, summaries, and sources
- 🏷️ **Source Filtering** - Filter articles by news source
- 📱 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal speed
- 🎨 **Modern UI** - Beautiful Tailwind CSS design with smooth animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Date Formatting**: date-fns
- **Package Manager**: npm/yarn/pnpm

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm
- A Supabase project with the `articles` table

### Installation

1. **Clone the repository**

   ```bash
   cd sifted-insight/website
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase URL and anon key:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   You can find these values in your Supabase dashboard under:
   - **URL**: Settings → API → Project URL
   - **Anon Key**: Settings → API → anon public key

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
website/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout with Header/Footer
│   │   └── page.tsx         # Main page with articles grid
│   ├── components/
│   │   ├── ArticleCard.tsx  # Article card component
│   │   ├── Header.tsx       # Site header
│   │   ├── Footer.tsx       # Site footer
│   │   ├── LoadingSpinner.tsx
│   │   ├── SearchBar.tsx    # Search input component
│   │   └── SourceFilter.tsx # Source filter buttons
│   └── lib/
│       └── supabase.ts      # Supabase client & types
├── public/
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Supabase Table Schema

Ensure your Supabase `articles` table has the following schema:

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key (auto-generated) |
| title | text | Article headline |
| original_url | text | Link to original article |
| summary | text | Brief summary of the article |
| content_text | text | Full article content |
| source_name | text | Name of the news source |
| image_url | text | URL of featured image |
| published_at | timestamptz | Publication date |
| slug | text | URL-friendly identifier |
| created_at | timestamptz | Record creation time |

### RLS Policy (Optional)

If you have Row Level Security enabled:

```sql
-- Allow public read access
CREATE POLICY "Enable read access for all users" ON articles
  FOR SELECT USING (true);
```

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color palette:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      },
    },
  },
}
```

### Adding New Components

Create new components in `src/components/` and import them in your pages:

```tsx
import MyComponent from '@/components/MyComponent';
```

## Building for Production

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For questions or issues, please open a GitHub issue.
