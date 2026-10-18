import express from 'express';
import { changeBookingStatus, checkAvailabilityOfCars, createBooking, getOwnerBookings, getUserBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCars);
bookingRouter.post('/create', protect,createBooking);
bookingRouter.post('/user', protect,getUserBookings);
bookingRouter.get('/owner', protect,getOwnerBookings);
bookingRouter.post('/change-status', protect,changeBookingStatus);

export default bookingRouter;