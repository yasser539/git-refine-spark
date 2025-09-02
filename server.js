/* Simple mock server for drivers and customers */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Sample data — replace with DB if needed
const drivers = [
  { id: 1, name: 'كابتن أحمد', coords: [39.19797, 21.543333], img: 'https://cdn-icons-png.flaticon.com/512/194/194938.png' },
  { id: 2, name: 'كابتن محمد', coords: [39.2005, 21.55], img: 'https://cdn-icons-png.flaticon.com/512/147/147144.png' },
];

const customers = [
  { id: 1, name: 'زبون علي', coords: [39.1802, 21.6] },
  { id: 2, name: 'زبون فهد', coords: [39.22, 21.56] },
];

app.get('/drivers', (req, res) => res.json(drivers));
app.get('/customers', (req, res) => res.json(customers));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Mock server running at http://localhost:${PORT}`));
