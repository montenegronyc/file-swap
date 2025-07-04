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

4.