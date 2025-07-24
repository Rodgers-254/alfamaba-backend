// server.js or index.js
import express from 'express';
import cors from 'cors';
import serviceOrdersRoute from './api/serviceOrders.js'; // adjust path if needed

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Mount your serviceOrders route
app.use('/api/serviceOrders', serviceOrdersRoute);

// Optional: simple route to confirm server is running
app.get('/', (req, res) => {
  res.send('Alfamaba backend is live 🚀');
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
