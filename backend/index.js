const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const port = 3000;
const app = express();

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Edgochoco7."
});

conn.connect(function(err){
    if (err) throw err;
    console.log("Connected!");
});

app.use(bodyParser.json());

app.use(cors());

app.get('/', (req, res) =>{
    res.send('Hello World');
});

const generateRandomString = (Length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < Length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
    conn.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (results.length > 0) {
            const { username } = results[0];

            const randomString = generateRandomString(10);

            const tokenPayload = {
                username,
                randomString,
                timestamp: Date.now(),
            };
            const token = jwt.sign(tokenPayload, 'yourSecretKey', { expiresIn: '1h' });

            return res.json({ success: true, message: 'Login successful', token, username });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    });
});

app.post('/signup', (req, res) => {
    const { username, password, pinnumber } = req.body;

    if (!username || !password || !pinnumber) {
        return res.status(400).json({ message: 'Username, Password, and PIN number are required' });
    }

    const sql = 'INSERT INTO user (username, password, pinnumber) VALUES (?, ?, ?)';
    conn.query(sql, [username, password, pinnumber], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username already exists' });
            }
            console.error('Error inserting user into database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
});



app.listen(port, () =>{
    console.log(`Server Run at http://localhost:${port}`);
})