// essential links for connection
const express = require('express');
// mongo link
const { MongoClient, ServerApiVersion } = require('mongodb');
// for using cors
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


// mongo database connection link
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@doctors-portal.etdd8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function for receive and send data in client site
async function run(){
    try{
        await client.connect();
        const servicesCollection = client.db('docPortal').collection('services')

        // send data to client site
        // all data sent
        app.get('/services', async(req, res) =>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
    }
    finally{

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("Hello from Doctor")
})

app.listen(port, () =>{
    console.log(`Doctor is running on ${port}`);
})