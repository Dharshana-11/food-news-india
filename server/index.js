import express, { json } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import superAdminRoutes from './routes/superAdminRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();

// Allow cross-origin requests from frontend
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true,               // if you need cookies/session
}));

app.use(json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

//Super-Admin Routes
app.use('/super-admin', superAdminRoutes);

// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


