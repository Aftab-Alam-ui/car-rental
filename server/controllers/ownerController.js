import imageKit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from 'fs';
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";


export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: 'owner' });
        res.status(200).json({ success: true, message: "Role updated to owner successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//API to list cars

export const addCar = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        let imageFile = req.file;

        //file upload logic will be here
        const fileBuffer = fs.readFileSync(imageFile.path);

        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })
        var optimizedImageUrl = imageKit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' }, //width resizing
                { quality: 'auto' },// auto compression
                { format: 'webp' } // convert to modern format webp
            ]
        })

        const image = optimizedImageUrl;

        await Car.create({ ...car, owner: _id, image })

        res.status(200).json({ success: true, message: "Car added successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//Api to list owner cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id });
        res.status(200).json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//ApI to toggle car availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        if (car.owner.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        car.isAvailable = !car.isAvailable;
        await car.save();
        res.status(200).json({ success: true, message: "Car availability updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//delete car API
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        if (car.owner.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        car.owner = null;
        car.isAvailable = false;
        await car.save();
        res.status(200).json({ success: true, message: "Car deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//Api to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;
        if (role !== 'owner') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });
        const pendingBookings = await Booking.find({ owner: _id, status: 'pending' })
        const completedBookings = await Booking.find({ owner: _id, status: 'confirmed' })

        //calculate monthly revenue from bookings wher  status is confirmed 
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }
        res.status(200).json({ success: true, dashboardData });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//api to update user image

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        let imageFile = req.file;

        //file upload logic will be here
        const fileBuffer = fs.readFileSync(imageFile.path);

        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })
        var optimizedImageUrl = imageKit.url({
            path: response.filePath,
            transformation: [
                { width: '400' }, //width resizing
                { quality: 'auto' },// auto compression
                { format: 'webp' } // convert to modern format webp
            ]
        })

        const image = optimizedImageUrl;
        await User.findByIdAndUpdate(_id, { image });
        res.status(200).json({ success: true, message: "User image updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}