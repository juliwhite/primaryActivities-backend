const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';;

// Simulated activity database
const activitiesFile = "./data/activities.json";

// Middleware to check if the user is authenticated
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
};
// Middleware to check if the user is an admin
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

// Get all activities
router.get('/', (req, res) => {
    try {
      const activities = JSON.parse(fs.readFileSync(activitiesFile, 'utf8'));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Error reading activities data' });
    }
});
//get all activities
// router.get("/", authenticateJWT, (req, res) => {
//     fs.readFile(activitiesFile, "utf8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Error reading activities" });
//         }
//         const activities = JSON.parse(data);
//         res.json(activities);
//     });
// });

// Get activities by category
router.get('/category/:category', (req, res) => {
    const { category } = req.params;
  
    try {
      const activities = JSON.parse(fs.readFileSync(activitiesFile, 'utf8'));
      const filteredActivities = activities.filter(
        (activity) => activity.category.toLowerCase() === category.toLowerCase()
      );
  
      if (filteredActivities.length === 0) {
        return res.status(404).json({ message: 'No activities found for this category' });
      }
  
      res.json(filteredActivities);
    } catch (error) {
      res.status(500).json({ message: 'Error reading activities data' });
    }
  });

// Add a new activity
router.post('/', authenticateJWT, (req, res) => {
    const { name, date, description, location, organizer, category } = req.body;

    console.log('Received activity:', req.body); // Log the incoming activity
  
    if (!name || !date || !description || !location || !organizer || !category) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const activities = JSON.parse(fs.readFileSync(activitiesFile, 'utf8'));
  
      const newActivity = {
        name:'Test Activity',
        date: '2025-12-01',
        description: 'A test activity description.',
        location: 'Test Location',
        organizer: 'Test Organizer',
        category: 'test category',
      };
  
      activities.push(newActivity);
      console.log('Updated activities:', activities); // Log updated activities

      fs.writeFileSync(activitiesFile, JSON.stringify(activities, null, 2));
      console.log('Activity saved successfully!');
  
      res.status(201).json(newActivity);
    } catch (error) {
      console.error('Error saving activity:', error);
      res.status(500).json({ message: 'Error saving activity' });
    }
  });

// Add a new activity
// router.post("/", authenticateJWT, authorizeAdmin, (req, res) => {
//     const newActivity = req.body;

//     // Validate input
//     if (!newActivity.name || !newActivity.description) {
//         return res.status(400).json({ message: "Name and description are required" });
//     }

//     fs.readFile(activitiesFile, "utf8", (err, data) => {
//         if (err) {
//             return res.status(500).json({ message: "Error reading activities" });
//         }
//         const activities = JSON.parse(data);
//         newActivity.id = activities.length + 1;
//         activities.push(newActivity);

//         fs.writeFile(activitiesFile, JSON.stringify(activities), (err) => {
//             if (err) {
//                 return res.status(500).json({ message: "Error saving activity" });
//             }
//             res.status(201).json(newActivity);
//         });
//     });
// });

// Delete an activity by name
router.delete('/:name', (req, res) => {
    const { name } = req.params;
  
    try {
      const activities = JSON.parse(fs.readFileSync(activitiesFile, 'utf8'));
      const updatedActivities = activities.filter(
        (activity) => activity.name.toLowerCase() !== name.toLowerCase()
      );
  
      if (activities.length === updatedActivities.length) {
        return res.status(404).json({ message: 'Activity not found' });
      }
  
      fs.writeFileSync(activitiesFile, JSON.stringify(updatedActivities, null, 2));
      res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting activity' });
    }
});

module.exports = router;