# Surface Workflow Project

This project implements a workflow system for tracking and analyzing user interactions on websites.

## Setup Instructions

1. Clone the repository:
```bash
git clone git@github.com:dhirajdkv/surface-workflow-project.git
cd surface-workflow-project
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the database:
```bash
# Make the script executable
chmod +x start-database.sh
# Start the database
./start-database.sh
```

5. Push the Prisma schema to the database:
```bash
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

## Project Structure

- `/src` - Source code
  - `/app` - Next.js app directory
  - `/components` - React components
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Technologies Used

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- PostgreSQL

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection URL (automatically configured by start-database.sh)

See `.env.example` for all available options.

## Development

1. Make your changes
2. Run tests (if any)
3. Submit a pull request

## License

[Add your license here]
