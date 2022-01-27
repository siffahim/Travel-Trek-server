const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()


//middle ware
app.use(cors())
app.use(express.json())

//MongoDB connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lyhqa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect()

        const database = client.db('TravelTrek');
        const serviceCollection = database.collection('services');
        const userColletion = database.collection('users');


        app.get('/services', async (req, res) => {
            const size = parseInt(req.query.size);
            const page = req.query.page;
            const cursor = serviceCollection.find({})
            const count = await cursor.count();
            let result;
            if (size) {
                result = await cursor.skip(size * page).limit(size).toArray()
            }
            else {
                result = await cursor.toArray()
            }
            res.send({
                count,
                result
            })
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(filter);
            res.json(result)
        })

        app.post('/services', async (req, res) => {
            const info = req.body;
            console.log(info)
            const result = await serviceCollection.insertOne(info);
            res.json(result)
        })

        app.put('/services', async (req, res) => {
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: true
                }
            }
            const result = await serviceCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(filter)
            res.json(result)
        })


        //user list 
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const result = await userColletion.findOne(filter);
            let admin = false;
            if (result?.role === 'admin') {
                admin = true
            }
            res.json({ admin })
        })
        app.post('/users', async (req, res) => {
            const info = req.body;
            const result = await userColletion.insertOne(info)
            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const email = req.body.email
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userColletion.updateOne(filter, updateDoc)
            res.json(result)
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)


app.get('/', async (req, res) => {
    res.send('Travel Trek server')
})

app.listen(port, () => {
    console.log('Running Server', port)
})