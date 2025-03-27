const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');

const authRouter = require('./routes/auth');
const activityRouter = require('./routes/activities');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/activities', activityRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).send('Sorry, that route does not exist.');
});
