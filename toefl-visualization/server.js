const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;


const uri = '***REMOVED***/?authMechanism=DEFAULT';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static('public')); // Serve static files from the "public" directory

app.get('/api/data', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('production');
    const students = database.collection('students');
    const organizations = database.collection('organizations');

    const data = await students.aggregate([
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization'
        }
      },
      {
        $unwind: '$organization'
      },
      {
        $group: {
          _id: '$organization.organizationName',
          numberOfStudents: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          organizationName: '$_id',
          numberOfStudents: 1
        }
      }
    ]).toArray();

    res.json(data);
  } catch (error) {
    console.error('Error connecting to MongoDB or fetching data:', error);
    res.status(500).send('Error fetching data');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});