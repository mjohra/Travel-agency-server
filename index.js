const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vamyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to database");
    const database = client.db("tourPackage");
    const servicesCollection = database.collection("services");
    const bookingCollection = database.collection("booking");

    // POST API
    app.post("/addService", async (req, res) => {
      const service = req.body;
      console.log("hit the post api", service);

      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });

    // GET API
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    // GET Single Service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });
    //add order
    app.post("/addOrder", async (req, res) => {
      const booking = req.body;
      console.log("hit the post order api", booking);

      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.json(result);
    });

    //get all order
    app.get('/allbooking',async(req,res)=>{
        const cursor=bookingCollection.find({});
        const order=await cursor.toArray();
        res.send(order);
    });
    //get single user order
    app.get('/booking',async(req,res)=>{
        const email=req.query.email;
        const query={"users.email":email};
        const cursor=bookingCollection.find(query);
        const result=await cursor.toArray();
        res.json(result);
    });

    //update API

    app.put('/booking/:id',async(req, res)=>{
      const id=req.params.id;
      console.log('updating user',id);
      const query = {_id : ObjectId(id)}
      const updateDoc = {
        $set: {
          "status": "Accepted"
        },
      };
      const result = await bookingCollection.updateOne(query, updateDoc);
      res.send(result);
  
    })

    // DELETE API
    app.delete('/booking/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await bookingCollection.deleteOne(query);
        res.json(result);
    });

  } finally {
    //await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running tour server");
});

app.listen(port, () => {
  console.log("running tour server on port", port);
});
