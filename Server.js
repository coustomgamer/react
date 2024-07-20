// server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://localhost:27017/school';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model for location
const locationSchema = new mongoose.Schema({
  userId: String,
  role: String, // 'user' or 'pickupPerson'
  coords: {
    latitude: Number,
    longitude: Number,
  },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

// Middleware
app.use(express.json());

// API endpoints
app.get('/location/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const location = await Location.findOne({ userId });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/location', async (req, res) => {
  try {
    const { userId, role, coords } = req.body;
    let location = await Location.findOne({ userId });

    if (location) {
      location.coords = coords;
    } else {
      location = new Location({ userId, role, coords });
    }

    await location.save();
    io.emit('locationUpdate', location); // Emit update to all clients
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
