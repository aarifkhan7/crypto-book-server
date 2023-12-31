var express = require("express");
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var cors = require('cors');
var jwt = require('jsonwebtoken');
const path = require('path');
const MongoStore = require('connect-mongo');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var app = express();
// app.set('trust proxy', 10);


const token_secret = "aarifkhannodejsreact";
// port settings
const port = process.env.PORT || 3100;
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
let users = null;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));


// database function to check whether user exists by username
async function userExists(requsername){
    try {
        const query = {
            username: requsername
        };
        let cursor = await users.find(query);
        let cursorarr = await cursor.toArray();
        return cursorarr.length > 0;
    } catch (error) {
        console.log(error);
        console.log("Could not check if a user exists.");
        return false;
    }
}

// auth routes
// check loggedin endpoint
app.get('/auth', async (req, res, next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try{
        const decoded = jwt.verify(token, token_secret);
        res.json({msg: true});
    }catch(err){
        res.sendStatus(403);
    }
})

// login endpoint
app.post('/auth', async (req, res)=>{
    let requsername = req.body.username;
    let reqpassword = req.body.password;
    if(!requsername || !reqpassword){
        res.sendStatus(400);
    }else{
        try {
            let query = {
                username: requsername,
                password: reqpassword
            };
            let cursor = await users.find(query);
            let cursorarr = await cursor.toArray();
            if(cursorarr.length > 0){
                let token = jwt.sign({username: requsername}, token_secret, {expiresIn: "7d"});
                res.json({token: token});
            }else{
                res.sendStatus(401);
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

// signup endpoint
app.put('/auth', async (req, res)=>{
    let reqfirstname = req.body.firstname;
    let reqlastname = req.body.lastname;
    let requsername = req.body.username;
    let reqpassword = req.body.password;
    if(!reqfirstname || !reqlastname || !requsername || !reqpassword){
        res.sendStatus(401);
    }else{
        try {
            let userAlreadyExists = await userExists(requsername);
            if(userAlreadyExists === true){
                res.sendStatus(400);
            }else{
                let query = {
                    firstName: reqfirstname,
                    lastName: reqlastname,
                    username: requsername,
                    password: reqpassword
                };
                let cursor = await users.insertOne(query);
                if(cursor.acknowledged === true){
                    res.sendStatus(200);
                }else{
                    res.sendStatus(400);
                }
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
        
    }
    
})

// logout endpoint
app.delete('/auth', (req, res)=>{
    res.sendStatus(200);
});

// auth check by validating token
app.use(async (req, res, next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        res.sendStatus(403);
    }else{
        try{
            const decoded = jwt.verify(token, token_secret);
            req.token = decoded;
            next();
        }catch(err){
            res.sendStatus(403);
        }
    }
})

app.get('/', (req, res)=>{
    res.send("Express on Render!");
});

app.get('/records', async (req, res, next)=>{
    try {
        const query = {
            username: req.token.username
        };
        const cursor = records.find(query);
        const data = await cursor.toArray();
        res.json(data);
    } catch (error) {
        console.log('Read failed!');
        res.sendStatus(500);
    }
});

app.get('/records/all/:query', async (req, res, next)=>{
    try {
        const q = req.params.query;
        const query = {
            username: req.token.username,
            $or: [
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
        const query = {
            username: req.token.username,
            name: {$regex: q, $options: "xi"}
        };
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
        const query = {
            username: req.token.username,
            address: {$regex: q, $options: "xi"}
        };
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
        const query = {
            username: req.token.username,
            coinName: {$regex: q, $options: "xi"}
        };
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
                username: req.token.username,
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
                username: req.token.username,
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
                username: req.token.username,
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
        records = database.collection("records");
        users = database.collection("users");
    } catch(err) {
        console.log("Could not connect to MongoDB!");
    }
});

module.exports = app;
