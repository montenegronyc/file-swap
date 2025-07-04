# File Swap Application

A simple file exchange application built with Next.js 14 that allows two people to securely swap files.

## Features

- **Simple Exchange**: Two people can exchange files by both uploading (no file is accessible until both have uploaded)
- **No Registration**: No user accounts required
- **Secure**: Files are stored securely on Vercel Blob
- **Time-Limited**: Files expire after 24 hours
- **Size Limit**: Maximum file size of 10MB
- **Mobile Responsive**: Works on all devices

## User Flow

1. Person A visits the homepage and clicks "Start New Swap"
2. Person A uploads their file
3. Person A receives a shareable link like: `yoursite.vercel.app/swap/abc123`
4. Person A shares this link with Person B
5. Person B opens the link and uploads their file
6. Both people can now download each other's files

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **File Storage**: Vercel Blob
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account for deployment

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd file-swap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local` and fill in your Vercel credentials:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

You'll need to set up the following environment variables in your `.env.local` file:

### Vercel Postgres
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Vercel Blob
- `BLOB_READ_WRITE_TOKEN`

## Deployment

The easiest way to deploy this app is to use [Vercel](https://vercel.com/):

1. Connect your repository to Vercel
2. Set up your environment variables in the Vercel dashboard
3. Deploy!

Make sure to:
- Set up a Vercel Postgres database
- Set up a Vercel Blob store
- Configure all environment variables

## Database Schema

The application uses a single table `file_swaps` with the following structure:

```sql
CREATE TABLE file_swaps (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  person_a_file_id VARCHAR(255),
  person_a_filename VARCHAR(255),
  person_a_uploaded_at TIMESTAMP WITH TIME ZONE,
  person_b_file_id VARCHAR(255),
  person_b_filename VARCHAR(255),
  person_b_uploaded_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'waiting_for_a'
);
```

## API Routes

- `POST /api/upload` - Upload first file (Person A)
- `GET /api/swap/[id]` - Get swap details
- `POST /api/swap/upload` - Upload second file (Person B)
- `GET /api/download` - Download files

## Security Features

- Files are only accessible after both parties have uploaded
- Each swap has a unique, unguessable ID
- Files automatically expire after 24 hours
- File size limits prevent abuse
- No user data is stored beyond what's necessary

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
