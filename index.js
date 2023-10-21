const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())


// mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.szfaclu.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const database = client.db('tech_land_DB')
        const brandCollection = database.collection('brands')
        const productCollection = database.collection('products')
        const cartCollection = database.collection('cart')

       
        // All Brand Api 
        app.get('/brand',async(req,res)=>{
            const result = await brandCollection.find().toArray();
            res.send(result);
        })
        
        // All Product Api
        app.get('/product',async(req,res)=>{
            const result = await productCollection.find().toArray()
            res.send(result);
        })

        // Get api by product brand name
        app.get('/product/:brandname',async(req,res)=>{
            const brandName = req.params.brandname;
            const query = { brand_name :brandName}
            const cursor = await productCollection.find(query).toArray();
            res.send(cursor)
        })
        // Get api by product id
        app.get('/productid/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id :new ObjectId(id)};
            const cursor = await productCollection.find(query).toArray();
            res.send(cursor)
        })

        // Add product api
        app.post('/product', async(req,res)=>{
            const product = req.body 
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        // Update product api
        app.put('/productid/:id',async(req,res)=>{
            const id = req.params.id
            const updatedProduct = req.body
            const updateDoc = {
                $set:{
                    name:updatedProduct.name,
                    brand_name:updatedProduct.brand_name,
                    img:updatedProduct.img,
                    type:updatedProduct.type,
                    price:updatedProduct.price,
                    short_description:updatedProduct.short_description,
                    rating_value:updatedProduct.rating_value,
                }
            }
            const result = await productCollection.updateOne({_id : new ObjectId(id)},updateDoc, { upsert: true })
            res.send(result)
        })
        // add to cart by id
        app.post('/cart',async(req,res)=>{
            const cartItem = req.body
            const result = await cartCollection.insertOne(cartItem)
            res.send(result);
        })
        // get the cart 
        app.get('/cart',async(req,res)=>{
            const result = await cartCollection.find().toArray()
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(port, () => {
    console.log(`this is running bro on port: ${port}`)
})