var express = require("express");
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
const path = require('path');
const MongoStore = require('connect-mongo');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var app = express();

// port settings
const port = process.env.PORT || 5000
// following line is for mongodb atlas
const uri = "mongodb+srv://aarifkhan_7:admin@cluster0.zwgc9a4.mongodb.net/?retryWrites=true&w=majority";
// terminal command to connect to mongodb atlas server
// mongosh "mongodb+srv://cluster0.zwgc9a4.mongodb.net/" --apiVersion 1 --username aarifkhan_7
// following line is for local install
// const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1";

// following line is for mongodb atlas
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// following line is for local install
// const client = new MongoClient(uri);

let database = null;
let records = null;

app.use(morgan('dev'));
app.use(bodyParser.json());

// sessions
app.use(session({
    secret: 'aarif khan',
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 60 * 60 * 24
    },
    store: MongoStore.create({
        client,
        dbName: 'my-app'
    })
}));

// auth check

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', (req, res)=>{
    res.send("Express on Vercel!");
});

app.get('/records', async (req, res, next)=>{
    try {
        const query = {};
        const cursor = records.find(query);
        res.json(await cursor.toArray());
    } catch (error) {
        console.log('Read failed!');
        res.sendStatus(500);
    }
});

app.get('/records/all/:query', async (req, res, next)=>{
    try {
        const q = req.params.query;
        const query = {$or: [
            {name: {$regex: q, $options: "xi"}},
            {address: {$regex: q, $options: "xi"}},
            {coinName: {$regex: q, $options: "xi"}}
        ]};
        const cursor = records.find(query);
        res.json(await cursor.toArray());   
    } catch (error) {
        console.log('Read failed!');
        res.sendStatus(500);
    }
});

app.get('/records/name/:query', async (req, res, next)=>{
    try {
        const q = req.params.query;
        const query = {name: {$regex: q, $options: "xi"}};
        const cursor = records.find(query);
        res.json(await cursor.toArray());   
    } catch (error) {
        console.log('Read failed!');
        res.sendStatus(500);
    }
});

app.get('/records/address/:query', async (req, res, next)=>{
    try {
        const q = req.params.query;
        const query = {address: {$regex: q, $options: "xi"}};
        const cursor = records.find(query);
        res.json(await cursor.toArray());   
    } catch (error) {
        console.log('Read failed!');
        res.sendStatus(500);
    }
});

app.get('/records/coin/:query', async (req, res, next)=>{
    try {
        const q = req.params.query;
        const query = {coinName: {$regex: q, $options: "xi"}};
        const cursor = records.find(query);
        res.json(await cursor.toArray());   
    } catch (error) {
        console.log('Read failed!');
        res.sendStatus(500);
    }
});

app.post('/records', async (req, res, next)=>{
    let reqname = req.body.name;
    let reqaddress = req.body.address;
    let reqcoinName = req.body.coinName;
    if(reqname == undefined || reqaddress == undefined || reqcoinName == undefined){
        res.sendStatus(400);
    }else{
        try {
            let dbRecord = {
                name: reqname,
                address: reqaddress,
                coinName: reqcoinName
            };
            var done = await records.insertOne(dbRecord);
            // console.log(done);
            res.json(done);
        } catch (error) {
            console.log('Create failed!');
            // console.log(error);
            res.sendStatus(500);
        }
    }
});

app.delete('/records', async (req, res, next)=>{
    let reqid = req.body._id;
    if(reqid == undefined){
        res.sendStatus(400);
    }else{
        try {
            let query = {
                _id: new ObjectId(reqid)
            };
            var done = await records.deleteOne(query);
            // console.log(done);
            res.json(done);
        } catch (error) {
            console.log('Delete failed!');
            // console.log(error);
            res.sendStatus(500);
        }
    }
})

app.put('/records', async (req, res, next)=>{
    let reqid = req.body._id;
    let reqname = req.body.name;
    let reqaddress = req.body.address;
    let reqcoinName = req.body.coinName;
    if(reqid == undefined || reqname == undefined || reqaddress == undefined || reqcoinName == undefined){
        res.sendStatus(400);
    }else{
        try {
            let query = {
                _id: new ObjectId(reqid)
            };
            let newobj = {
                $set: {
                    name: reqname,
                    address: reqaddress,
                    coinName: reqcoinName
                }
            };
            let done = await records.updateOne(query, newobj);
            // console.log(done);
            res.json(done);
        } catch (error) {
            console.log('Update failed!');
            // console.log(error);
            res.sendStatus(500);
        }
    }
})

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
