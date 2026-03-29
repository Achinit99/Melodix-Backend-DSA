# Music Playlist Backend - Project Structure

## Folder Organization

```
music-playlist-backend/
├── db.ts                          # Database connection pool setup
├── SETUP_DATABASE.sql             # SQL script to create database tables
├── .env                           # Environment variables (MySQL credentials)
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
│
└── src/
    ├── index.ts                   # Main server file (Express app)
    │
    ├── controllers/
    │   └── userController.ts      # Business logic for user routes
    │
    ├── routes/
    │   └── userRoutes.ts          # Route definitions for users API
    │
    ├── data/
    │   └── mockData.ts            # Mock data for onboarding, dashboard, etc.
    │
    ├── logic/
    │   ├── SongLinkedList.ts      # Doubly Linked List implementation
    │   └── SongBST.ts             # Binary Search Tree implementation
    │
    └── [existing folders maintain their structure]
```

## Database Connection Setup

### What is a Connection Pool?
සිංහල: Connection pool එකක් database එකට concurrent requests handle කරනවා.
එක එක connection එක reuse කරනු ලබනවා නිර්මාණ non කරලා.

```typescript
// db.ts එකේ තිබෙනවා:
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,    // උපරිම 10 concurrent connections
  queueLimit: 0,          // Unlimited queue
});
```

## API Routes

### User Routes (Database-driven)

- **GET /api/users** - සියලුම users retrieve කරනවා
  ```bash
  curl http://localhost:5000/api/users
  ```

- **GET /api/users/:id** - Specific ID එකෙන් එක user retrieve කරනවා
  ```bash
  curl http://localhost:5000/api/users/1
  ```

### Existing Routes (Mock data)

- **GET /api/playlists/:name** - Linked List අමතර්ගතය
- **GET /api/search?title=...** - BST පසුබිම සහිතය
- **GET /api/onboarding/genres** - Onboarding genres
- **GET /api/onboarding/artists** - Onboarding artists
- **GET /api/dashboard/recommended-playlists** - Dashboard data
- **GET /api/discover/trending** - Discover/trending data

## How to Use

### 1. Setup Database
```bash
mysql -u root -p < SETUP_DATABASE.sql
```

### 2. Verify .env file
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1578257aA@
DB_NAME=playwave_db
PORT=5000
```

### 3. Start the server
```bash
npm run dev
# or
npm install
npm run dev
```

### 4. Test the endpoints
```bash
# Get all users from database
curl http://localhost:5000/api/users

# Get specific user
curl http://localhost:5000/api/users/1
```

## MVC Architecture (දිගු/Control/View)

**Model** (db එකිනි):
- Database schema සහ tables සිත්ගනවා

**Controller** (src/controllers/):
- Business logic සිටිනවා
- Database queries execute කරනවා
- Response JSON format කරනවා

**Routes/Views** (src/routes/):
- HTTP endpoints define කරනවා
- Controllers call කරනවා
- Client requests handle කරනවා

## Environment Considerations

සිංහල: .env file එක තුල sensitive credentials තියාගෙන,
ගිට් එකට commit නොකරනවා. එය local environment එකට පමණක් තියාගෙන.

```bash
echo ".env" >> .gitignore
```

## Database Pool Advantages

✓ Connection reuse - අලුත් connections නිර්මාණ කරන්න සිට එතින් බේරේ
✓ Performance - මිතුරු concurrent requests
✓ Resource management - Limited simultaneous connections
✓ Queue management - අතිරේක requests උන්নතිසම තැබෙනවා

## Error Handling

All database operations use try-catch blocks:
```typescript
try {
  const connection = await pool.getConnection();
  const [rows] = await connection.query('SELECT * FROM users');
  connection.release();
  res.json({ data: rows });
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

## Next Steps

1. Create more controllers (songs, playlists, etc.)
2. Add authentication middleware
3. Add validation middleware
4. Implement CRUD operations (Create, Update, Delete)
5. Add database transactions for complex operations
