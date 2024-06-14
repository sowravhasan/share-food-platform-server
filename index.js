const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    // 'http://localhost:5173',
    "https://magenta-monstera-a0bc73.netlify.app"
  ],
  credentials: true
}));



// // ------------------------

// app.use((req, res, next) => {
//   // CORS headers
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // restrict it to the required domain
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   // Set custom headers for CORS
//   res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");

//   if (req.method === "OPTIONS") {
//       return res.status(200).end();
//   }

//   return next();
// })

// // _____-----------------






app.use(express.json());
app.use(cookieParser());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gfz3k0z.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const featuredFoodsCollection = client.db("food-sharing").collection('featured-foods');
    const availableFoodsCollection = client.db("food-sharing").collection('available-foods');
    const requestedFoodsCollection = client.db("food-sharing").collection('requested-food');
    const aditionalFoodsCollection = client.db("food-sharing").collection('aditional-foods');
    const imageGalaryCollection = client.db("food-sharing").collection('imageGalary');
    const volunteersCollection = client.db("food-sharing").collection('volunteers');

    app.get('/featured-foods', async(req, res) => {
        const cursor = featuredFoodsCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/available-foods', async(req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(req.query);
        const cursor = availableFoodsCollection.find();
        const result = await cursor.skip(page * size).limit(size).toArray();
        res.send(result)
    })

    app.get('/aditional-foods/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await aditionalFoodsCollection.findOne(query);
      res.send(result)
  })

    app.get('/aditional-foods', async(req, res) => {
      let query = {};
      if(req.query?.email){
        query = { email : req.query.email}
      }
        const cursor = aditionalFoodsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/available-foods/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const options = {
            projection: {food_Img:1, food_name : 1, donator_img:1, donator_name:1, food_quantity:1, location:1, expired_date:1, description:1}
        };
        const result = await availableFoodsCollection.findOne(query, options);
        res.send(result)
    })

    app.get('/featured-foods/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const options = {
            projection: {food_Img:1, food_name : 1, donator_img:1, donator_name:1, food_quantity:1, location:1, expired_date:1, description:1}
        };
        const result = await featuredFoodsCollection.findOne(query, options);
        res.send(result)
    })


    app.get('/requested-food', async(req, res) => {
      const cursor = requestedFoodsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
  })


    app.get('/volunteers', async(req, res) => {
      const cursor = volunteersCollection.find();
      const result = await cursor.toArray();
      res.send(result)
  })


    app.get('/requested-food/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const options = {
            projection: {food_Img:1, food_name : 1, donator_img:1, donator_name:1, food_quantity:1, location:1, expired_date:1, description:1 , aditionalNotes:1, amount:1, userName:1, userImage:1, userEmail:1, userPhoneNumber:1}
        };
        const result = await requestedFoodsCollection.findOne(query, options);
        res.send(result)
    })


    // pagination code
    app.get('/foodCount', async(req, res)=> {
      const count = await availableFoodsCollection.estimatedDocumentCount();
      res.send({count})
    })


    app.post('/jwt', async(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})
      res.cookie('token', token, {
        httpOnly : true,
        secure: true,
        sameSite: 'none'
      })
      .send({success : true})
    })


    app.post('/logout', async(req, res) => {
      const user = req.body;
      console.log("loging out", user);
      res.clearCookie('token', {maxAge: 0}).send({success:true})
    })





    app.post('/available-foods' , async(req, res) => {
      const user = req.body;
      const result = await availableFoodsCollection.insertOne(user);
      res.send(result)
    })


    app.post('/volunteers' , async(req, res) => {
      const user = req.body;
      const result = await volunteersCollection.insertOne(user);
      res.send(result)
    })


    app.post('/requested-food' , async(req, res) => {
      const user = req.body;
      const result = await requestedFoodsCollection.insertOne(user);
      res.send(result)
    })

    app.post('/aditional-foods' , async(req, res) => {
      const user = req.body;
      const result = await aditionalFoodsCollection.insertOne(user);
      res.send(result)
    })


    app.put('/aditional-foods/:id' , async(req, res) => {
      const id = req.params.id;
      const filter = { _id : new ObjectId(id)};
      const options = { upsert : true};
      const updatedFood = req.body;
      const food = {
        $set : {
          foodName : updatedFood.foodName, 
          foodImage : updatedFood.foodImage, 
          quantity : updatedFood.quantity, 
          location : updatedFood.location, 
          expireDate : updatedFood.expireDate, 
          notes : updatedFood.notes, 
          donarName : updatedFood.donarName,
          amount : updatedFood.amount,
          reqDate : updatedFood.reqDate, 
          donarEmail : updatedFood.donarEmail
        }

      }
      const result = await aditionalFoodsCollection.updateOne(filter, food, options);
      res.send(result);

    })


    app.delete('/aditional-foods/:id', async(req, res) => {
      const id = req.params.id;
      console.log({id});
      const query = { _id: new ObjectId(id)};
      const result = await aditionalFoodsCollection.deleteOne(query);
      res.send(result)
    })


    app.delete('/requested-food/:id', async(req, res) => {
      const id = req.params.id;
      console.log({id});
      const query = { _id: new ObjectId(id)};
      const result = await requestedFoodsCollection.deleteOne(query);
      res.send(result)
    })



    // app.post('/available-foods', async (req, res) => {
    //   const user = req.body;
    //   const email = user.email;
    
    //   const filter = { email: email };
    
    //   try {
    //     const result = await availableFoodsCollection.insertOne(user);
    
    //     res.send(result);
    //   } catch (error) {
    //     console.error('Error:', error);
    //     res.status(500).send('An error occurred');
    //   }
    // });
    



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Food Is Running")
})

app.listen(port, () => {
    console.log(`Server is running ${port}`);
})