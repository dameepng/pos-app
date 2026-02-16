# POS App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

A comprehensive Point of Sale (POS) application built with Next.js, Prisma, and PostgreSQL. This application manages products, categories, inventory, and transactions, providing a robust solution for retail businesses.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Default Accounts](#default-accounts)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Development Tips](#development-tips)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Support](#support)
- [License](#license)

## Features

- **Product Management**: Create, update, and manage products with barcode and SKU support
- **Inventory Tracking**: Monitor stock levels and manage inventory in real-time
- **Category Organization**: Group products into categories for easier management
- **Transaction Processing**: Handle sales transactions efficiently with multiple payment methods
- **User Management**: Role-based access control (Owner, Cashier)
- **Receipt Generation**: Customizable receipt templates with logo and business info
- **Admin Dashboard**: Comprehensive insights and management tools for business owners
- **Payment Integration**: Midtrans payment gateway support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL 15](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: Custom JWT implementation with [jose](https://github.com/panva/jose)
- **Payment**: [Midtrans](https://midtrans.com/)
- **Storage**: [Supabase Storage](https://supabase.com/storage) (optional)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

**Verify Installation:**
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
docker --version
docker compose version
```

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/dameepng/pos-app.git
cd pos-app
```

### 2. Install Dependencies

Install the necessary Node.js packages:

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env.local
```

Open the `.env.local` file and update the configuration as needed. The default values are set up to work with the provided Docker Compose configuration.

**Important**: Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Copy the output and replace the `AUTH_JWT_SECRET` value in your `.env.local` file.

### 4. Setup Database

Start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will spin up a PostgreSQL container accessible at port `15432`.

**Verify database is running:**
```bash
docker ps
# You should see a container with postgres:15 image
```

### 5. Database Migration & Seeding

Run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

Seed the database with initial data (default users, categories, products):

```bash
npm run prisma:seed
```

This will create:
- Default admin and cashier accounts
- Sample categories (Beverages, Snacks, etc.)
- Sample products with barcodes
- Receipt template

### 6. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `APP_URL` | Application URL | `http://localhost:3000` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | See `.env.example` | Yes |
| `DIRECT_URL` | Direct database connection | Same as DATABASE_URL | Yes |
| `AUTH_JWT_SECRET` | JWT signing secret (64-byte) | **MUST BE CHANGED** | Yes |
| `AUTH_COOKIE_NAME` | Authentication cookie name | `pos_session` | Yes |
| `MIDTRANS_IS_PRODUCTION` | Midtrans production mode | `false` | No |
| `MIDTRANS_SERVER_KEY` | Midtrans server key | - | No |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key | - | No |
| `MIDTRANS_WEBHOOK_SECRET` | Midtrans webhook secret | - | No |
| `SUPABASE_URL` | Supabase project URL | - | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | No |
| `SUPABASE_STORAGE_BUCKET` | Supabase storage bucket name | - | No |

### Docker Compose Configuration

The `docker-compose.yml` configures:
- **PostgreSQL 15** on port `15432`
- **Username**: `pos_user`
- **Password**: `pos_password`
- **Database**: `pos_db`
- **Data persistence** via Docker volume `postgres_data`

To change database credentials, update both `docker-compose.yml` and `DATABASE_URL` in `.env.local`.

## Default Accounts

The seeding process creates default accounts for testing (development mode only):

### Owner / Admin
- **Email**: `damee@png.id`
- **Password**: `Password123`
- **Access**: Full admin dashboard, product management, user management, settings

### Cashier
- **Email**: `cashier@local.test`
- **Password**: `password123`
- **Access**: POS interface, transaction processing

**Security Note**: Change these credentials immediately in production.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build application for production |
| `npm start` | Start production server (after build) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run prisma:seed` | Seed database with initial data |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npx prisma migrate dev` | Create and apply new database migration |
| `npx prisma migrate reset` | Reset database (WARNING: deletes all data) |
| `npx prisma generate` | Generate Prisma Client after schema changes |

## Project Structure

```
pos-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Admin dashboard pages
│   ├── (pos)/             # POS/Cashier interface
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── src/
│   ├── components/        # React components
│   ├── lib/              # Utility functions, helpers
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Database seeding script
│   └── migrations/       # Database migration files
├── public/               # Static assets (images, icons)
├── docker-compose.yml    # Docker services configuration
├── .env.example          # Environment variables template
└── package.json          # Project dependencies
```

## Development Tips

### Access Prisma Studio (Database GUI)

Prisma Studio provides a visual interface to view and edit your database:

```bash
npx prisma studio
```

Visit [http://localhost:5555](http://localhost:5555) to view your database.

### View Docker Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs postgres
```

### Reset Database (Development Only)

```bash
# WARNING: This will delete all data!
npx prisma migrate reset

# Re-seed with fresh data
npm run prisma:seed
```

### Hot Reload Issues

If hot reload isn't working:

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solution**:
```bash
# Check if Docker container is running
docker ps

# Check container logs
docker compose logs postgres

# Restart Docker containers
docker compose down
docker compose up -d

# Wait a few seconds for PostgreSQL to start, then:
npx prisma migrate dev
```

### Port Already in Use

**Problem**: Port 3000 or 15432 already in use

**Solution**:
```bash
# Find process using the port (macOS/Linux)
lsof -i :3000
lsof -i :15432

# Find process (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :15432

# Kill the process or change ports:
# - For app: Change APP_URL in .env.local
# - For database: Change port in docker-compose.yml
```

### Prisma Migration Failed

**Problem**: Migration errors after pulling latest changes

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-run seed
npm run prisma:seed
```

### Node Modules Issues

**Problem**: Dependency conflicts or module not found errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# If using yarn
rm -rf node_modules yarn.lock
yarn install
```

### Docker Volume Issues

**Problem**: Database data persists incorrectly

**Solution**:
```bash
# Remove all containers and volumes
docker compose down -v

# Start fresh
docker compose up -d
npx prisma migrate dev
npm run prisma:seed
```

### "Prisma Client is unable to run in the browser"

**Problem**: Prisma imports in client components

**Solution**: Ensure Prisma is only used in:
- Server Components
- API routes
- Server Actions

Never import Prisma Client in Client Components (`'use client'`).

## Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   
   In Vercel dashboard, add these environment variables:
   ```
   NODE_ENV=production
   APP_URL=https://your-app.vercel.app
   DATABASE_URL=your-production-database-url
   DIRECT_URL=your-production-database-url
   AUTH_JWT_SECRET=your-secure-secret
   AUTH_COOKIE_NAME=__Host-pos_auth
   MIDTRANS_IS_PRODUCTION=true
   MIDTRANS_SERVER_KEY=your-server-key
   MIDTRANS_CLIENT_KEY=your-client-key
   MIDTRANS_WEBHOOK_SECRET=your-webhook-secret
   ```

4. **Setup Production Database**
   
   Use a managed PostgreSQL service:
   - [Supabase](https://supabase.com) (recommended, free tier available)
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)
   - [Amazon RDS](https://aws.amazon.com/rds/)

5. **Run Migrations**
   ```bash
   # After first deployment, run migrations via Vercel CLI
   vercel env pull
   npx prisma migrate deploy
   ```

6. **Seed Production Database** (First time only)
   ```bash
   # Set bootstrap owner in Vercel environment variables
   BOOTSTRAP_OWNER_NAME=Your Name
   BOOTSTRAP_OWNER_EMAIL=owner@yourcompany.com
   BOOTSTRAP_OWNER_PASSWORD=secure-password

   # Then run via Vercel CLI or add to postinstall script
   NODE_ENV=production npm run prisma:seed
   ```

### Deploy to Other Platforms

- **Railway**: Connect GitHub, add PostgreSQL service, deploy
- **DigitalOcean App Platform**: Similar to Vercel
- **AWS Amplify**: Connect repository and deploy
- **Self-hosted**: Build and run with `npm run build && npm start`

### Production Checklist

Before deploying to production:

- [ ] Change `AUTH_JWT_SECRET` to secure random string
- [ ] Use strong database passwords
- [ ] Enable HTTPS (automatically handled by Vercel)
- [ ] Set `NODE_ENV=production`
- [ ] Configure Midtrans production keys
- [ ] Set up proper logging and monitoring
- [ ] Configure backup strategy for database
- [ ] Test payment flows thoroughly
- [ ] Review security headers
- [ ] Set up custom domain (optional)

## Security

### Important Security Notes

Before deploying to production:

1. Generate and use a secure `AUTH_JWT_SECRET` (64-byte random string)
2. Change `AUTH_COOKIE_NAME` to something unique
3. Use strong, unique database passwords
4. Enable HTTPS in production (automatic on Vercel)
5. Never commit `.env` or `.env.local` files to Git
6. Use environment-specific secrets (different for dev/staging/prod)
7. Regularly update dependencies (`npm audit fix`)
8. Enable rate limiting for API routes
9. Validate and sanitize all user inputs
10. Use prepared statements (Prisma handles this)

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please email **damenugget@gmail.com** instead of opening a public issue. We will address it promptly.

## Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Code Style Guidelines

- Follow ESLint rules (`npm run lint`)
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality (if applicable)

### Reporting Issues

Found a bug? Please open an issue with:
- Clear and descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

## FAQ

### Q: Can I use a different database?

**A**: This project is designed specifically for PostgreSQL. Using other databases requires modifying the Prisma schema and may break some PostgreSQL-specific features.

### Q: How do I add more users?

**A**: 
- Via Admin Dashboard: Login as Owner → Users → Add User
- Via API: POST to `/api/users` (requires authentication)
- Via Prisma Studio: `npx prisma studio` → Users table

### Q: Can I customize the receipt template?

**A**: Yes! Login as Owner → Settings → Receipt Template. You can customize:
- Business name and address
- Logo
- Header/footer text
- Item display format

### Q: Is this production-ready?

**A**: Yes, but ensure you:
- Follow security best practices
- Use a production database (not Docker)
- Set up proper monitoring and backups
- Test payment flows thoroughly
- Review and update all environment variables

### Q: How do I backup my data?

**A**:

**Development (Docker):**
```bash
# Backup
docker exec pos-app-postgres-1 pg_dump -U pos_user pos_db > backup.sql

# Restore
docker exec -i pos-app-postgres-1 psql -U pos_user pos_db < backup.sql
```

**Production:**
Use your hosting provider's backup tools (Supabase, Railway, etc.)

### Q: Does this support multi-store operations?

**A**: Not currently, but it's on the roadmap. The current version supports single-store operations with multiple users (owner, cashiers).

### Q: Can I use this for my business?

**A**: Yes! This project is MIT licensed. You're free to use, modify, and distribute it. No attribution required (but appreciated).

## Support

Need help? Here are some resources:

- **Documentation**: [GitHub Wiki](https://github.com/dameepng/pos-app/wiki)
- **Issue Tracker**: [Report bugs](https://github.com/dameepng/pos-app/issues)
- **Discussions**: [Ask questions](https://github.com/dameepng/pos-app/discussions)
- **Email**: damenugget@gmail.com

## Author

**Your Name**
- GitHub: [@dameepng](https://github.com/dameepng)
- LinkedIn: [Your LinkedIn Profile]([https://linkedin.com/in/yourprofile](https://www.linkedin.com/in/ahmad-damanhuri/))

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with care by [dameepng](https://github.com/dameepng)**

If you found this project helpful, please give it a star on GitHub.
