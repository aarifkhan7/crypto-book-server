var express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var app = express();

// port settings
const port = process.env.PORT || 5000
const uri = "mongodb+srv://aarifkhan_7:admin@cluster0.zwgc9a4.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let database = null;
let records = null;

app.get('/', (req, res)=>{
    res.send('Foo Bar');
});

app.listen(port, async () => {
    console.log("Server running on port " + port);
    try{
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged deployment. Successfully connected to MongoDB!");
        database = client.db("my-app");
        records = database.collection("records");;
    } catch(err) {
        console.log("Could not connect to MongoDB!");
    }
});

module.exports = app;
