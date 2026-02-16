# Local Development Setup

## Database Configuration

Local development uses **Docker PostgreSQL** instead of Supabase.

### Why Docker?
- Isolated from production data
- Safe to experiment and test
- Each developer has their own database
- No risk of affecting production

### Quick Start
1. `cp .env.example .env.local`
2. Generate JWT secret and update `.env.local`
3. `docker compose up -d`
4. `npx prisma migrate dev`
5. `npm run prisma:seed`
6. `npm run dev`

### Database Management
- **Start**: `docker compose up -d`
- **Stop**: `docker compose down`
- **Reset**: `docker compose down -v` (deletes all data)
- **View data**: `npx prisma studio`

### Production
Production uses Supabase and is configured via Vercel environment variables.
Local changes never affect production.
