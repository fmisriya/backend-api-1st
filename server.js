const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'students.json');

app.use(cors());
app.use(bodyParser.json());

// Helper: Read students from file
function readStudents() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Write students to file
function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// GET all students
app.get('/api/students', (req, res) => {
  try {
    const students = readStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read students data.' });
  }
});

// POST add new student
app.post('/api/students', (req, res) => {
  const { name, age, course, year, status } = req.body;
  if (!name || !course || !year || age === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (typeof age !== 'number' || age <= 0) {
    return res.status(400).json({ error: 'Age must be a number greater than 0.' });
  }
  const students = readStudents();
  const newStudent = {
    id: Date.now(),
    name,
    age,
    course,
    year,
    status: status || 'active'
  };
  students.push(newStudent);
  try {
    writeStudents(students);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save student.' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Student Management API!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});