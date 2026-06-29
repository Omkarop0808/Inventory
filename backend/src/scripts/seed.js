const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in the environment variables');
    await mongoose.connect(uri);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany();
    await Property.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();

    console.log('Data cleared');

    // Create Admin User (Free plan for testing limits if needed, or paid)
    const adminUser = await User.create({
      uid: 'admin_test_uid_123',
      email: 'admin@mezenga.com', // Matches ADMIN_EMAIL in .env
      name: 'Super Admin',
      plan: 'paid'
    });

    // Create Homestay Owner
    const hoUser = await User.create({
      uid: 'ho_test_uid_456',
      email: 'owner@example.com',
      name: 'Homestay Owner',
      plan: 'free'
    });

    // Create Property
    const property = await Property.create({
      ownerId: hoUser._id,
      propertyName: 'Mezenga Paradise',
      contactNumber: '9876543210',
      whatsappNumber: '9876543210',
      state: 'Goa',
      region: 'North Goa',
      address: '123 Beach Road, Anjuna',
      emailId: 'owner@example.com',
      publicSlug: 'mezenga-paradise-abcd',
      pageViews: 12,
    });

    // Create Rooms
    const room1 = await Room.create({
      propertyId: property._id,
      roomName: 'Deluxe Sea View',
      noOfRooms: 2,
      priceRoomOnly: 2000,
      priceBreakfast: 2500,
      priceBreakfastDinner: 3500,
      priceAllMeals: 4500,
    });

    const room2 = await Room.create({
      propertyId: property._id,
      roomName: 'Standard Room',
      noOfRooms: 3,
      priceRoomOnly: 1500,
      priceBreakfast: 1800,
      priceBreakfastDinner: 2500,
      priceAllMeals: 3200,
    });

    const room3 = await Room.create({
      propertyId: property._id,
      roomName: 'Family Suite',
      noOfRooms: 1,
      priceRoomOnly: 4000,
      priceBreakfast: 4800,
      priceBreakfastDinner: 6000,
      priceAllMeals: 7500,
    });

    // Create Bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 3);

    await Booking.create({
      roomId: room1._id,
      propertyId: property._id,
      checkinDate: today,
      noOfNights: 1,
      checkoutDate: tomorrow,
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '1112223334',
      noOfGuests: 2,
    });

    await Booking.create({
      roomId: room2._id,
      propertyId: property._id,
      checkinDate: nextWeek,
      noOfNights: 3,
      checkoutDate: nextWeekEnd,
      guestName: 'Jane Smith',
      guestEmail: 'jane@example.com',
      guestPhone: '5556667778',
      noOfGuests: 4,
      specialRequests: 'Extra bed please',
    });

    console.log('Seed data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
