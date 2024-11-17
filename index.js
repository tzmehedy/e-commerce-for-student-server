const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express()
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000


const corsOptions = {
  origin: [
    "http://localhost:5174",
    "http://localhost:5000",
    "http://localhost:5173",
  ],
  credentials: true,
};

app.use(cors( corsOptions ));
app.use(express.json())
app.use(cookieParser())


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


const verifyToken = (req, res, next)=>{
  const token = req.cookies.token
  if(!token) return res.status(401).send({message:"Unauthorized Access"})
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized Access" })
      }
      req.user = decoded
      next()
    });
  }

}



async function run() {
  try {
    const jobsCollections = client
      .db("eCommerceForStudent")
      .collection("AllJobs");

    const bidCollections = client
      .db("eCommerceForStudent")
      .collection("BidJobs");





    // Jwt implementation
    app.post("/jwt", async(req,res)=>{
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN,{expiresIn: "2h"})

      res
      .cookie('token',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV ==='production' ? 'none': 'strict'
      })
      .send({ success:true });
    })


    // Delete token while logout

    app.get("/logout", (req, res)=>{
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0
        })
        .send({ success: true });
    })






    // Post Data

    app.post("/allJobs", async (req, res) => {
      const jobCollection = req.body;

      const result = await jobsCollections.insertOne(jobCollection);
      res.send(result);
    });

    app.post("/allBids", async (req, res) => {
      const bidCollectionsData = req.body;
      const result = await bidCollections.insertOne(bidCollectionsData);
      res.send(result);
    });

    // Get Data

    app.get("/all-Jobs", async (req, res) => {
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page) - 1
      const filter = req.query.filter
      const sort = req.query.sort 
      const searchText= req.query.searchText

      
      let query = {
        title: {$regex:searchText, $options:'i'}
      }
      if(filter) query = {...query,category:filter}

      let options = {}
      if(options) options = {sort: {deadline: sort === 'asc'? 1 : -1}}
      const result = await jobsCollections
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/allJobs-count", async(req,res)=>{
      const filter = req.query.filter;
      const searchText = req.query.searchText
      let query = {
        title: { $regex: searchText, $options: "i" },
      };
      if (filter) query = { ...query, category: filter };
      const count = await jobsCollections.countDocuments(query)
      res.send({count})
    })

    app.get("/allJobsByCategory", async(req, res)=>{
      const category = req.query.category
      const query = {category: category}
      const result = await jobsCollections.find(query).toArray()
      res.send(result)
    })

    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.findOne(query);
      res.send(result);
    });

    app.get("/myPostedJobs/:email", verifyToken,  async (req, res) => {
      const email = req.params.email;
      if(req.user.email !== email ){
        return res.status(403).send({message:"Access Forbidden"})

      }
      const query = { email: email };
      const result = await jobsCollections.find(query).toArray();
      res.send(result);
    });

    app.delete("/myPostedJobs/:id",verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.deleteOne(query);
      res.send(result);
    });

    app.put("/updatedJob/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const updatedJob = req.body;

      const query = { _id: new ObjectId(id) };

      const option = { upsert: true };

      const updatedJobInfo = {
        $set: {
          email: updatedJob.email,
          title: updatedJob.title,
          deadline: updatedJob.deadline,
          category: updatedJob.category,
          description: updatedJob.description,
          minimumPrice: updatedJob.minimumPrice,
          maximumPrice: updatedJob.maximumPrice,
        },
      };

      const result = await jobsCollections.updateOne(
        query,
        updatedJobInfo,
        option
      );

      res.send(result);
    });

    app.get("/bidRequest/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const result = await bidCollections.find(query).toArray();
      res.send(result);
    });

    app.get("/myBids/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { sellerEmail: email };
      const result = await bidCollections.find(query).toArray();
      res.send(result);
    });

    app.patch("/updateStatus/:id",verifyToken, async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status.status,
        },
      };
      const result = await bidCollections.updateOne(query, updateDoc);
      res.send(result);
    });

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






