import express from 'express';
import "dotenv/config";
import cors from 'cors';
import connectDb from './configs/db.js';
import userRouter from './routes/userRoute.js';
import ownerRouter from './routes/ownerRoute.js';
import bookingRouter from './routes/bookingRoute.js';

//initialize express app
const app = express();

//connect to database
await connectDb();

//middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>res.send('server is running'));
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/booking', bookingRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));