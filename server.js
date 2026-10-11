const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware to allow your frontend HTML to request data
app.use(cors());
app.use(express.json());

// Connect to your local PostgreSQL database
// const pool = new Pool({
//     user: 'postgres',             // Default pgAdmin username
//     host: 'localhost',            
//     database: 'ear_acupuncture_db', 
//     password: 'iamputeri', // Replace with your pgAdmin password
//     port: 5432,                   
// });

// Replace your existing pool connection with this:
const pool = new Pool({
    // Render will inject the DATABASE_URL environment variable automatically
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// API endpoint to grab the ear points
app.get('/api/points', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ear_points ORDER BY point_id ASC');
        res.json(result.rows); // Sends the database rows to your website
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/diseases', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.disease_name, 
                d.description, 
                ARRAY_AGG(dp.point_id) as point_ids
            FROM diseases d
            LEFT JOIN disease_point dp ON d.disease_id = dp.disease_id
            GROUP BY d.disease_id, d.disease_name, d.description
            ORDER BY d.disease_id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.get('/api/quizzes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quiz ORDER BY quiz_id'); // or whatever your primary key is
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running! API available at http://localhost:${PORT}/api/points`);
// });

// Replace your app.listen with this:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});