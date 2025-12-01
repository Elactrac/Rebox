# ReBox - Eco-Friendly Packaging Marketplace

ReBox is a full-stack web platform that connects people and businesses who want to get rid of used packaging with recyclers and companies that reuse them. Turn your packaging waste into rewards while tracking your environmental impact.

## Features

### For Individuals
- **List Packaging** - Easily list boxes, bottles, containers, and other reusable materials
- **Schedule Pickups** - Choose convenient times for recyclers to collect your items
- **Earn Rewards** - Get points for every pickup, redeemable for cash or gift cards
- **Track Impact** - Monitor your CO2 savings, water saved, and environmental contribution

### For Businesses/Brands
- **Buyback Marketplace** - Browse and purchase cleaned packaging for reuse
- **Make Offers** - Bid on available packaging from users
- **Sustainability Reports** - Access detailed environmental impact data

### For Recyclers
- **Accept Pickups** - View and claim available pickup requests
- **Route Management** - Manage pickups efficiently
- **Track Performance** - Monitor completed pickups and impact

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **bcryptjs** for password hashing

### Frontend
- **React 18** with hooks
- **React Router v6** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Project Structure

```
rebox/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── packages.js
│   │   │   ├── pickups.js
│   │   │   ├── rewards.js
│   │   │   ├── impact.js
│   │   │   ├── notifications.js
│   │   │   └── buyback.js
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── Layout.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Packages.js
│   │   │   ├── PackageDetail.js
│   │   │   ├── NewPackage.js
│   │   │   ├── Pickups.js
│   │   │   ├── SchedulePickup.js
│   │   │   ├── PickupDetail.js
│   │   │   ├── Rewards.js
│   │   │   ├── Impact.js
│   │   │   ├── Profile.js
│   │   │   ├── Marketplace.js
│   │   │   └── BuybackOffers.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Option 1: Using Docker (Recommended)

1. Clone the repository and navigate to the project:
```bash
cd rebox
```

2. Start all services:
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
docker-compose exec backend npx prisma migrate dev
```

4. Seed the database:
```bash
docker-compose exec backend npm run seed
```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your database URL:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/rebox?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Generate Prisma client:
```bash
npx prisma generate
```

7. Seed the database:
```bash
npm run seed
```

8. Start the server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Test Accounts

After seeding, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rebox.com | admin123 |
| Individual | user@example.com | user123 |
| Business | brand@example.com | business123 |
| Recycler | recycler@example.com | recycler123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard-stats` - Get dashboard statistics
- `GET /api/users/recyclers` - Get available recyclers

### Packages
- `POST /api/packages` - Create package
- `GET /api/packages` - List packages
- `GET /api/packages/:id` - Get package details
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

### Pickups
- `POST /api/pickups` - Schedule pickup
- `GET /api/pickups` - List pickups
- `GET /api/pickups/:id` - Get pickup details
- `GET /api/pickups/track/:code` - Track by code
- `PUT /api/pickups/:id/accept` - Accept pickup (recycler)
- `PUT /api/pickups/:id/status` - Update status
- `PUT /api/pickups/:id/cancel` - Cancel pickup

### Rewards
- `GET /api/rewards` - Get rewards
- `GET /api/rewards/transactions` - Get transactions
- `POST /api/rewards/redeem` - Redeem points
- `GET /api/rewards/leaderboard` - Get leaderboard
- `GET /api/rewards/levels` - Get level info

### Impact
- `GET /api/impact` - Get user impact
- `GET /api/impact/history` - Get impact history
- `GET /api/impact/global` - Get global stats
- `GET /api/impact/certificate` - Get certificate data

### Buyback
- `POST /api/buyback/offers` - Create offer
- `GET /api/buyback/offers` - List offers
- `PUT /api/buyback/offers/:id/accept` - Accept offer
- `PUT /api/buyback/offers/:id/reject` - Reject offer
- `GET /api/buyback/marketplace` - Browse marketplace

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret for JWT tokens |
| JWT_EXPIRES_IN | Token expiration (e.g., "7d") |
| PORT | Server port (default: 5000) |
| NODE_ENV | Environment (development/production) |

### Frontend
| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API URL |

## Reward Levels

| Level | Points Required | Multiplier |
|-------|-----------------|------------|
| Bronze | 0 - 999 | 1x |
| Silver | 1,000 - 4,999 | 1.25x |
| Gold | 5,000 - 14,999 | 1.5x |
| Platinum | 15,000 - 49,999 | 2x |
| Diamond | 50,000+ | 2.5x |

## License

MIT License - feel free to use this project for learning or as a starting point for your own applications.
