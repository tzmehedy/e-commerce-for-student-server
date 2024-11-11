const express = require('express')
const app = express()
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require("mongodb");

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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection

    const jobsCollections = client.db("eCommerceForStudent").collection('AllJobs')



    app.post("/allJobs", async(req,res)=>{
        const jobCollection = req.params.body 
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






