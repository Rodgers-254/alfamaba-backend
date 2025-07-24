import express from 'express';
import cors from 'cors';
import serviceOrdersRoute from './api/serviceOrders.js';

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Connect the route
app.use('/api/serviceOrders', serviceOrdersRoute);

// Optional: root route
app.get('/', (req, res) => {
  res.send('Alfamaba backend is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
