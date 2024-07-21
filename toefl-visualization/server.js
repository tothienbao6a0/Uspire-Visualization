const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path'); // For resolving file paths

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const uri = '***REMOVED***/?authMechanism=DEFAULT';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// API route to get centers and student counts
app.get('/api/centers', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('production');
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
    } finally {
        await client.close();
    }
});

// API route to get all students
app.get('/api/students', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('production');
        const students = database.collection('students');
        const result = await students.find().toArray();
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching students data');
    } finally {
        await client.close();
    }
});

// API route to get progress for a specific student
app.get('/api/student/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        await client.connect();
        const database = client.db('production');
        const students = database.collection('students');
        const student = await students.findOne({ _id: new MongoClient.ObjectId(studentId) });
        
        if (!student) {
            return res.status(404).send('Student not found');
        }

        const progress = await database.collection('systemanswers').find({ studentId: studentId }).toArray();
        
        res.json({ student, progress });
    } catch (error) {
        res.status(500).send(`Error fetching progress for student ${studentId}`);
    } finally {
        await client.close();
    }
});


// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
