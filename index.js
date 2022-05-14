// essential links for connection
const express = require("express");
// mongo link
const { MongoClient, ServerApiVersion } = require("mongodb");
// for using cors
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongo database connection link
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@doctors-portal.etdd8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// function for receive and send data in client site
async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db("docPortal").collection("services");
    const bookingCollection = client.db("docPortal").collection("bookings");
    const usersCollection = client.db("docPortal").collection("users");

    // send data to client site
    // all data sent
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/available", async (req, res) => {
      const date = req.query.date || "May 14, 2022";

      // step 1: get all services
      const services = await servicesCollection.find().toArray();

      // get the booking of that day
      const query = { date: date };
      const bookings = await bookingCollection.find(query).toArray();

      // for each service, find booking for that service
      services.forEach((service) => {
        // find the bookings for that service[{}, {}, {}]
        const serviceBookings = bookings.filter(
          (book) => book.treatment === service.name
        );
        // take or select slots for the service bookings['','','']
        const booked = serviceBookings.map((book) => book.slot);
        // select those slots which are not in book slots
        const available = service.slots.filter(
          (slot) => !booked.includes(slot)
        );
        // set available to slots to make it easier
        service.slots = available;
      });

      res.send(services);
    });

    // get the booking data
    app.get("/booking", async (req, res) => {
      const patient = req.query.patient;
      const query = { patient: patient };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    // get the single appointment data
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const query = {
        treatment: booking.treatment,
        date: booking.date,
        patient: booking.patient,
      };
      const exists = await bookingCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, booking: exists });
      }
      const result = await bookingCollection.insertOne(booking);
      return res.send({ success: true, result });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Doctor");
});

app.listen(port, () => {
  console.log(`Doctor is running on ${port}`);
});
