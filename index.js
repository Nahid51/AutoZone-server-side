const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bsutc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const database = client.db("AutoMart");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const customerCollection = database.collection("customers");
    console.log('connected successfully');

    // add products to database
    app.post('/addProducts', async (req, res) => {
        const doc = req.body;
        const result = await productCollection.insertOne(doc);
        res.send(result);
    })
    // get all product from database
    app.get('/allProducts', async (req, res) => {
        const products = productCollection.find({});
        const result = await products.toArray();
        res.send(result);
    })
    app.get('/products', async (req, res) => {
        const products = productCollection.find({});
        const result = (await products.toArray()).slice(0, 6);
        res.send(result);
    })
    app.post('/orders', async (req, res) => {
        const doc = req.body;
        const result = await orderCollection.insertOne(doc);
        res.send(result);
        console.log(result);
    })
    app.get('/allorders', async (req, res) => {
        const email = req.query.email;
        const query = { email: email }
        const cursor = orderCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })
    app.delete('/allorders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.send(result);
    })
    app.post('/customers', async (req, res) => {
        const customer = req.body;
        const result = await customerCollection.insertOne(customer);
        res.send(result);
    })
    app.put('/customers', async (req, res) => {
        const customer = req.body;
        const filter = { email: customer.email };
        const options = { upsert: true };
        const updateDoc = { $set: customer };
        const result = await customerCollection.updateOne(filter, updateDoc, options);
        res.send(result);
        console.log(result);
    })
    app.put('/customers/admin', async (req, res) => {
        const admin = req.body;
        const filter = { email: admin.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await customerCollection.updateOne(filter, updateDoc);
        res.send(result);
    })
    app.get('/customers/:email', async (req, res) => {
        const admin = req.params;
        const query = { email: admin.email };
        console.log(query);
        const customer = await customerCollection.findOne(query);
        let isAdmin = false;
        if (customer?.role === 'admin') {
            isAdmin = true;
        }
        res.send({ admin: isAdmin });
    })
});


app.get('/', (req, res) => {
    res.send('Hello Node JS!')
})

app.listen(port, () => {
    console.log('Running server at port:', port)
})