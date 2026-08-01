require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize PostgreSQL Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize Database Schema with Mock Test 1 table names
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mock_test_1_users (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_name TEXT UNIQUE NOT NULL,
                session_id UUID,
                login_time TIMESTAMP WITH TIME ZONE,
                current_status TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS mock_test_1_quiz_attempts (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_name TEXT NOT NULL,
                test_name TEXT NOT NULL,
                attempt_number INTEGER NOT NULL,
                total_questions INTEGER,
                correct_answers INTEGER,
                incorrect_answers INTEGER,
                score NUMERIC,
                percentage NUMERIC,
                evaluation TEXT,
                time_allowed TEXT DEFAULT '50:00',
                time_taken TEXT,
                time_remaining TEXT,
                submission_type TEXT,
                attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        
        const columnsToAdd = [
            'user_id UUID REFERENCES mock_test_1_users(id)',
            'status TEXT',
            'started_at TIMESTAMP WITH TIME ZONE',
            'completed_at TIMESTAMP WITH TIME ZONE',
            'updated_at TIMESTAMP WITH TIME ZONE',
            'questions_attempted INTEGER'
        ];
        
        for (const col of columnsToAdd) {
            try {
                await pool.query(`ALTER TABLE mock_test_1_quiz_attempts ADD COLUMN IF NOT EXISTS ${col}`);
            } catch (e) {
                // Ignore if exists
            }
        }
        
        const columnsToDropNotNull = [
            'total_questions', 'correct_answers', 'incorrect_answers', 'score', 'percentage', 'evaluation'
        ];
        for (const col of columnsToDropNotNull) {
            try {
                await pool.query(`ALTER TABLE mock_test_1_quiz_attempts ALTER COLUMN ${col} DROP NOT NULL`);
            } catch (e) {
                // Ignore
            }
        }
        
        try {
            await pool.query(`ALTER TABLE mock_test_1_quiz_attempts ALTER COLUMN score TYPE NUMERIC`);
        } catch (e) {}
        
        console.log("Database schema (mock_test_1_users & mock_test_1_quiz_attempts) verified.");
    } catch (err) {
        console.error("Database initialization error:", err);
    }
}

initDB();

app.post('/api/login', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ error: "DATABASE_URL environment variable is missing on server settings." });
        }
        const { user_name } = req.body;
        if (!user_name) return res.status(400).json({ error: "Missing user_name" });
        
        const result = await pool.query(`
            INSERT INTO mock_test_1_users (user_name, session_id, login_time, current_status)
            VALUES ($1, gen_random_uuid(), NOW(), 'Logged In')
            ON CONFLICT (user_name) DO UPDATE 
            SET session_id = gen_random_uuid(), login_time = NOW(), current_status = 'Logged In'
            RETURNING *;
        `, [user_name]);
        
        res.status(200).json({ message: "Login successful", user: result.rows[0] });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message || "Database query error" });
    }
});

app.post('/api/start-quiz', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ error: "DATABASE_URL environment variable is missing on server settings." });
        }
        let { user_id, user_name, test_name } = req.body;
        if (!user_name || !test_name) return res.status(400).json({ error: "Missing fields" });
        
        if (!user_id) {
            const userRes = await pool.query(`
                INSERT INTO mock_test_1_users (user_name, current_status) VALUES ($1, 'Started')
                ON CONFLICT (user_name) DO UPDATE SET current_status = 'Started'
                RETURNING id
            `, [user_name]);
            user_id = userRes.rows[0].id;
        } else {
            await pool.query(`UPDATE mock_test_1_users SET current_status = 'Started' WHERE id = $1`, [user_id]);
        }
        
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM mock_test_1_quiz_attempts WHERE user_name = $1 AND test_name = $2',
            [user_name, test_name]
        );
        const attempt_number = parseInt(countResult.rows[0].count, 10) + 1;
        
        const insertQuery = `
            INSERT INTO mock_test_1_quiz_attempts (
                user_id, user_name, test_name, attempt_number, status, started_at, time_allowed
            ) VALUES ($1, $2, $3, $4, 'Started', NOW(), '50:00')
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [user_id, user_name, test_name, attempt_number]);
        
        res.status(200).json({ message: "Quiz started", attempt: result.rows[0] });
    } catch (err) {
        console.error("Start quiz error:", err);
        res.status(500).json({ error: err.message || "Database query error" });
    }
});

app.post('/api/finish-quiz', async (req, res) => {
    try {
        const data = req.body;
        let userId = data.user_id;
        let userName = data.user_name || 'Anonymous';
        let testName = data.test_name || 'Python Mastery - Mock Test 1';
        
        if (!userId && userName) {
            const userRes = await pool.query(`
                INSERT INTO mock_test_1_users (user_name, current_status) VALUES ($1, 'Completed Quiz')
                ON CONFLICT (user_name) DO UPDATE SET current_status = 'Completed Quiz'
                RETURNING id
            `, [userName]);
            userId = userRes.rows[0].id;
        } else if (userId) {
            await pool.query(`UPDATE mock_test_1_users SET current_status = 'Completed Quiz' WHERE id = $1`, [userId]);
        }
        
        let attempt;
        if (data.attempt_id) {
            const updateQuery = `
                UPDATE mock_test_1_quiz_attempts SET
                    status = 'Completed',
                    completed_at = NOW(),
                    updated_at = NOW(),
                    time_taken = $1,
                    time_remaining = $2,
                    submission_type = $3,
                    questions_attempted = $4,
                    total_questions = $5,
                    correct_answers = $6,
                    incorrect_answers = $7,
                    score = $8,
                    percentage = $9,
                    evaluation = $10
                WHERE id = $11
                RETURNING *;
            `;
            
            const values = [
                data.time_taken, data.time_remaining, data.submission_type,
                data.questions_attempted, data.total_questions, data.correct_answers,
                data.incorrect_answers, data.score, data.percentage, data.evaluation,
                data.attempt_id
            ];
            
            const result = await pool.query(updateQuery, values);
            if (result.rows.length > 0) {
                attempt = result.rows[0];
            }
        }
        
        if (!attempt) {
            const countResult = await pool.query(
                'SELECT COUNT(*) FROM mock_test_1_quiz_attempts WHERE user_name = $1 AND test_name = $2',
                [userName, testName]
            );
            const attempt_number = parseInt(countResult.rows[0].count, 10) + 1;
            
            const insertQuery = `
                INSERT INTO mock_test_1_quiz_attempts (
                    user_id, user_name, test_name, attempt_number, status, started_at, completed_at, updated_at,
                    time_allowed, time_taken, time_remaining, submission_type, questions_attempted, total_questions,
                    correct_answers, incorrect_answers, score, percentage, evaluation
                ) VALUES ($1, $2, $3, $4, 'Completed', NOW(), NOW(), NOW(), '50:00', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *;
            `;
            const values = [
                userId, userName, testName, attempt_number,
                data.time_taken, data.time_remaining, data.submission_type,
                data.questions_attempted, data.total_questions, data.correct_answers,
                data.incorrect_answers, data.score, data.percentage, data.evaluation
            ];
            const result = await pool.query(insertQuery, values);
            attempt = result.rows[0];
        }
        
        res.status(200).json({ message: "Attempt completed successfully!", attempt: attempt });
    } catch (error) {
        console.error("Server error on finish-quiz:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get('/api/user-history/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await pool.query(
            'SELECT * FROM mock_test_1_quiz_attempts WHERE user_name = $1 ORDER BY attempted_at DESC',
            [username]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Serve index.html for all other non-API routes (Express 5 compatible)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Application server running at http://localhost:${port}`);
    });
}
