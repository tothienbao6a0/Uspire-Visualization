require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let database;

// Connect to MongoDB
client.connect()
    .then(() => {
        database = client.db('production');
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// API route to get centers and student counts
app.get('/api/centers', async (req, res) => {
    try {
        const centers = database.collection('organizations');
        const result = await centers.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'students'
                }
            },
            {
                $project: {
                    organizationName: 1,
                    count: { $size: '$students' }
                }
            }
        ]).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching centers data');
    }
});

// API route to get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = database.collection('students');
        const result = await students.find().toArray();
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching students data');
    }
});

// API route to get progress for a specific student
app.get('/api/student/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        const answerLogs = database.collection('answerlogs');
        const results = await answerLogs.find({ userId: new ObjectId(studentId) }).toArray();
        
        const progress = results.map(result => ({
            attemptNumber: result._id.toString(), // or any identifier you use for attempts
            totalScore: result.score.totalScore,
            totalPoints: result.score.totalPoints
        }));
        
        res.json(progress);
    } catch (error) {
        res.status(500).send(`Error fetching progress for student ${studentId}`);
    }
});

// API route to get the number of days since creation for each organization
app.get('/api/organizations', async (req, res) => {
    try {
        const organizations = database.collection('organizations');
        const orgs = await organizations.find().toArray();
        const currentDate = new Date();
        const data = orgs.map(org => {
            const creationDate = new Date(org.createdAt); // Convert createdAt to Date object
            const daysSinceCreation = Math.floor((currentDate - creationDate) / (1000 * 60 * 60 * 24)); // Calculate days
            return {
                organizationName: org.organizationName || org._id.toString(), // Adjust field name based on actual data
                daysSinceCreation
            };
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching organizations data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
