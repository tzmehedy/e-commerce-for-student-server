const express = require('express')
const app = express()
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
  res.send("e-commerce for student is coming");
});




const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k8aq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const jobsCollections = client.db("eCommerceForStudent").collection("AllJobs");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection

    



    app.get("/allJobs", async(req,res)=>{
      const result = await jobsCollections.find().toArray()
      res.send(result)
      
    })

    app.get("/webDevelopment", async(req,res)=>{
      const query = { category: "Web Development" }
      const result = await jobsCollections.find(query).toArray()
      res.send(result)
    })
    app.get("/graphicsDesign", async (req, res) => {
      const query = { category: "Graphics Design" };
      const result = await jobsCollections.find(query).toArray();
      res.send(result);
    });
    app.get("/videoEditing", async (req, res) => {
      const query = { category: "Video Editing" };
      const result = await jobsCollections.find(query).toArray();
      res.send(result);
    });
    app.get("/digitalMarketing", async (req, res) => {
      const query = { category: "Digital Marketing" };
      const result = await jobsCollections.find(query).toArray();
      res.send(result);
    });
    app.get("/aiServices", async (req, res) => {
      const query = { category: "Ai Services" };
      const result = await jobsCollections.find(query).toArray();
      res.send(result);
    });
    app.get("/writingTranslation", async (req, res) => {
      const query = { category: "Writing And Translation" };
      const result = await jobsCollections.find(query).toArray()
      res.send(result);
    });

    app.get("/jobDetails/:id", async(req, res)=>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollections.findOne(query)
      res.send(result)

    })

    app.post("/allJobs", async(req,res)=>{
        const jobCollection = req.body
        
        const result = await jobsCollections.insertOne(jobCollection)
        res.send(result)
    })


    
    







    client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`The port is running the port ${port}`);
});






