const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors(
  {
    origin: ['http://localhost:5173'],
    credentials: true
  }
));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@phero.sfyzbqi.mongodb.net/?retryWrites=true&w=majority&appName=phero`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database connection
    const database = client.db("phero").collection("project-1");
    const booking = client.db("phero").collection("booking");

    // JWT Token api 

    app.post('/jwt' , ( req , res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign( user, 'secret', { expiresIn: '1h' });
      console.log(token);
      res
      .cookie('token' , token , {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      })
      .send({ success : true })
    })

    app.post('/logOut' , (req , res) => {
      const user = req.body;
      res.clearCookie('token',{maxAge : 0}).send({success : true})
    } )

 
    // All data api
    app.get("/allData", async (req, res) => {
      const cursor = database.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { description: 1, img: 1, price: 1, title: 1 },
      };
      const result = await database.findOne(query, options);
      res.send(result);
    });

    // Bookings

        // Bookings

        app.get("/bookings" , async (req, res) => {
          let query = {};
          if (req.query?.email) {
            query = { email: req.query.email };
          }
          const result = await booking.find(query).toArray();
          res.send(result);
        });
    
        app.post("/bookings", async (req, res) => {
          const info = req.body;
          const result = await booking.insertOne(info);
          res.send(result);
        });
    
        app.patch("/bookings/:id", async (req, res) => {
          const data = req.body;
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              status: data.status,
            },
          };
          const result = await booking.updateOne(filter, updateDoc);
          res.send(result);
        });
    
        app.delete("/bookings/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await booking.deleteOne(query);
          res.send(result);
        });
        
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("doctor is running");
});

app.listen(port, () => {
  console.log(`Car Doctor Server is running on port ${port}`);
});
