// Import the required modules
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Create an instance of an Express application
const app = express();

// Define the port the server will listen on
const PORT = 3001;

// Middleware to parse incoming JSON requests
app.use(express.json());

// TODO:  Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public"))); // NEW

// Define the path to the JSON file
const dataFilePath = path.join(__dirname, "data.json");
 
// Function to read data from the JSON file
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

// Function to write data to the JSON file
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// TODO: Handle GET request at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));  // NEW
});

// Handle GET request to retrieve stored data
app.get("/data", (req, res) => {
  const data = readData();
  res.json(data);
});

// Handle POST request to save new data with a unique ID
app.post("/data", (req, res) => {
  const newData = { id: uuidv4(), ...req.body };
  const currentData = readData();
  currentData.push(newData);
  writeData(currentData);
  res.json({ message: "Data saved successfully", data: newData });
});

// Handle POST request at the /echo route
app.post("/echo", (req, res) => {
  // Respond with the same data that was received in the request body
  res.json({ received: req.body });
});



// Handle PUT request to update data by ID () CURRENTLY NOT WORKING (unknown reason)
app.put("/data/:id", (req, res) => {
  // console.log("PUT /data/:id called");
  // console.log("Request params:", req.params);
  // console.log("Request body:", req.body);

  const data = readData();
  const itemId = req.params.id;
  const updatedBody = req.body;

  if (!updatedBody || typeof updatedBody !== "object") {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const itemIndex = data.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Data not found" });
  }

  data[itemIndex] = { ...data[itemIndex], ...updatedBody, id: itemId };
  writeData(data);
  res.json({ message: "Data updated successfully", data: data[itemIndex] });
});


// NEW::: Handle DELETE request to delete data by ID
app.delete("/data/:id", (req, res) => {
  const currentData = readData();
  const itemId = req.params.id;
  
  // Find the index of the item to update
  const itemIndex = currentData.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Data not found" });
  }

  currentData.splice(itemIndex, 1);
  writeData(currentData);

  res.json({ message: "Data deleted successfully" });
});

// Handle POST request at the /echo route
app.post("/echo", (req, res) => {
  // Respond with the same data that was received in the request body
  res.json({ received: req.body });
});

















// Wildcard route to handle undefined routes
app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
