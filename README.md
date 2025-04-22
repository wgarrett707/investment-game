# Investment Game

A platform for simulating startup investing in a team-based environment. Teams can invest in real historical AI startups and learn from their outcomes.

## Features

- Team-based registration and authentication
- Real-time investment tracking
- Admin dashboard for managing startups and outcomes
- Leaderboard showing team rankings
- Historical investment tracking
- Real startup case studies

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd investment-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/investment_game"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-admin-password"
ADMIN_NAME="Admin User"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Create the admin user:
```bash
npm run create-admin
```

6. Start the development server:
```bash
npm run dev
```

## Usage

### Admin

1. Log in with the admin credentials
2. Access the admin dashboard at `/admin`
3. Create new startups with their details
4. Manage investment rounds and outcomes
5. View team performances

### Teams

1. Register a new team with team members
2. Log in to access the team dashboard
3. View available startups for investment
4. Make investment decisions
5. Track investment performance
6. View the leaderboard

## Game Flow

1. Admin creates a new startup with details
2. Teams are presented with the startup pitch
3. Teams have a limited time to make investment decisions
4. Admin reveals the startup outcome
5. Teams' balances are updated based on their investments
6. Process repeats for the next startup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Seed or Skip

A modern investment simulation game where users can practice investment decisions in a risk-free environment.

## Deployment Guide

### Prerequisites

- A Vercel account for deployment
- A PostgreSQL database (recommended: Vercel Postgres, Supabase, or Railway)
- Google OAuth credentials (if using Google authentication)

### Environment Variables

Copy the `.env.example` file and set up the following environment variables in your Vercel project:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A secure random string (generate using `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your production URL (e.g., https://your-domain.vercel.app)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: Initial admin user credentials
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: If using Google authentication

### Deployment Steps

1. **Database Setup**
   - Create a new PostgreSQL database
   - Update the `DATABASE_URL` in your environment variables
   - Run database migrations:
     ```bash
     npx prisma db push
     ```

2. **Vercel Deployment**
   - Push your code to GitHub
   - Import your repository in Vercel
   - Configure environment variables in Vercel's project settings
   - Deploy your project

3. **Post-Deployment**
   - Verify that the application is running correctly
   - Check that authentication is working
   - Confirm database connections
   - Test admin functionality

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio
npx prisma studio
```
