// database credentials are stored in a .env file

const { Pool } = require('pg');
require('dotenv').config();

// Hosted Postgres (Neon, Render, etc.) is reached via a single DATABASE_URL
// and requires SSL. Local/docker-compose Postgres uses the discrete DB_* vars
// and has no SSL listener.
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

module.exports = pool;