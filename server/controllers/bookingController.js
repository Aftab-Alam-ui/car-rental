import Booking from "../models/Booking.js";
import Car from "../models/Car.js";


// Function to check booking availability of car for given dates
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
    });
    return bookings.length === 0;
}

//API to check Availability of cars for given dates and location 

export const checkAvailabilityOfCars = async (req, res) => {
  try {
    const { pickupDate, returnDate, location } = req.body;

    const cars = await Car.find({ location, isAvailable: true });

    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(
        car._id,
        pickupDate,
        returnDate
      );

      return {
        ...car._doc,
        isAvailable,
      };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter(car => car.isAvailable);

    res.status(200).json({ success: true, cars: availableCars });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


//API to book a car
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.status(400).json({ success: false, message: "Car is not available for the selected dates" });
        }
        const carData = await Car.findById(car);

        //calculate total price based on pickup and return date
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = noOfDays * carData.pricePerDay;
        await Booking.create({ car, owner: carData.owner, user: _id, pickupDate, returnDate, price })
        res.status(200).json({ success: true, message: "Car booked successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//API to list user bookings
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate('car').sort({ createdAt: -1 })
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({ success: false, message: "Server Error" });  
    }
}

//API to list owner bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role  !== 'owner') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const bookings = await Booking.find({ owner: req.user._id }).populate('car user').select('-user.password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//API to change booking status by owner
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const {bookingId ,status} =req.body;
        const booking = await Booking.findById(bookingId)
        if(booking.owner.toString() !== _id.toString()){
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        booking.status = status;
        await booking.save();
        res.status(200).json({ success: true, message: "Booking status updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}