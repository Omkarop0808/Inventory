const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Property = require('../src/models/Property');
const Room = require('../src/models/Room');
const Booking = require('../src/models/Booking');

const connectDB = require('../src/config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 1. Create Super Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mezenga.com';
    const adminUser = await User.create({
      email: adminEmail,
      name: 'Super Admin',
      password: defaultPassword,
      uid: `local_admin_${Date.now()}`,
      plan: 'paid'
    });
    console.log('Created admin user:', adminEmail);

    // 2. Create Owner 1
    const owner1 = await User.create({
      email: 'owner1@example.com',
      name: 'John Doe (Owner 1)',
      password: defaultPassword,
      uid: `local_owner1_${Date.now()}`,
      plan: 'paid'
    });

    // 3. Create Properties for Owner 1
    const prop1 = await Property.create({
      ownerId: owner1._id,
      propertyName: 'Sunset Villa',
      contactNumber: '9876543210',
      whatsappNumber: '9876543210',
      state: 'Goa',
      region: 'North Goa',
      address: '123 Beach Road, Vagator',
      emailId: 'sunset@example.com',
      publicSlug: 'sunset-villa'
    });

    // 4. Create Rooms for Prop 1
    const room1 = await Room.create({
      propertyId: prop1._id,
      ownerId: owner1._id,
      roomName: 'Deluxe Sea View',
      noOfRooms: 5,
      priceRoomOnly: 2500,
      priceBreakfast: 3000,
      priceBreakfastDinner: 4000,
      priceAllMeals: 5000
    });

    const room2 = await Room.create({
      propertyId: prop1._id,
      ownerId: owner1._id,
      roomName: 'Standard Room',
      noOfRooms: 10,
      priceRoomOnly: 1500,
      priceBreakfast: 2000,
      priceBreakfastDinner: 2800,
      priceAllMeals: 3500
    });

    // 5. Create Bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 3);

    await Booking.create({
      propertyId: prop1._id,
      roomId: room1._id,
      guestName: 'Alice Smith',
      guestPhone: '9998887776',
      checkinDate: today,
      checkoutDate: tomorrow,
      noOfNights: 1,
      noOfGuests: 2,
      mealPlan: 'breakfastIncluded',
      totalPrice: 3000,
      status: 'confirmed'
    });

    await Booking.create({
      propertyId: prop1._id,
      roomId: room2._id,
      guestName: 'Bob Johnson',
      guestPhone: '7778889990',
      checkinDate: nextWeek,
      checkoutDate: nextWeekEnd,
      noOfNights: 3,
      noOfGuests: 1,
      mealPlan: 'allMeals',
      totalPrice: 10500,
      status: 'confirmed'
    });

    // 6. Create User for omkarpatilop0826@gmail.com
    let omUser;
    if (adminEmail === 'omkarpatilop0826@gmail.com') {
      omUser = adminUser;
    } else {
      omUser = await User.create({
        email: 'omkarpatilop0826@gmail.com',
        name: 'Omkar Patil',
        password: defaultPassword,
        uid: `local_om_${Date.now()}`,
        plan: 'paid'
      });
    }

    // 7. Create Properties for Om
    const omProp = await Property.create({
      ownerId: omUser._id,
      propertyName: "Om's Paradise",
      contactNumber: '9988776655',
      whatsappNumber: '9988776655',
      state: 'Maharashtra',
      region: 'Lonavala',
      address: '456 Hill View, Lonavala',
      emailId: 'omkarpatilop0826@gmail.com',
      publicSlug: 'oms-paradise'
    });

    const omProp2 = await Property.create({
      ownerId: omUser._id,
      propertyName: "Om's Beach Retreat",
      contactNumber: '9988776655',
      whatsappNumber: '9988776655',
      state: 'Goa',
      region: 'South Goa',
      address: '789 Palolem Beach Road',
      emailId: 'omkarpatilop0826@gmail.com',
      publicSlug: 'oms-beach-retreat'
    });

    // 8. Create Rooms for Om (Om's Paradise)
    const omRoom1 = await Room.create({
      propertyId: omProp._id,
      roomName: 'Deluxe Suite',
      noOfRooms: 2,
      priceRoomOnly: 4000,
      priceBreakfast: 4500,
      priceBreakfastDinner: 5500,
      priceAllMeals: 6500
    });

    const omRoom2 = await Room.create({
      propertyId: omProp._id,
      roomName: 'Premium Villa',
      noOfRooms: 1, // Only 1 so it's easy to mark as sold out
      priceRoomOnly: 8000,
      priceBreakfast: 9000,
      priceBreakfastDinner: 10500,
      priceAllMeals: 12000
    });

    // Create Rooms for Om's Beach Retreat
    const omRoom3 = await Room.create({
      propertyId: omProp2._id,
      roomName: 'Beach View Cottage',
      noOfRooms: 3,
      priceRoomOnly: 5000,
      priceBreakfast: 5500,
      priceBreakfastDinner: 6500,
      priceAllMeals: 7500
    });

    // 9. Create Bookings for Om
    // Fully book Premium Villa for today/tomorrow to test Sold Out functionality
    await Booking.create({
      propertyId: omProp._id,
      roomId: omRoom2._id,
      guestName: 'John Test',
      guestPhone: '5554443333',
      checkinDate: today,
      checkoutDate: tomorrow,
      noOfNights: 1,
      noOfGuests: 2,
      mealPlan: 'roomOnly',
      totalPrice: 8000,
      status: 'confirmed'
    });

    // Partially book Deluxe Suite
    await Booking.create({
      propertyId: omProp._id,
      roomId: omRoom1._id,
      guestName: 'Charlie Brown',
      guestPhone: '5554443333',
      checkinDate: today,
      checkoutDate: tomorrow,
      noOfNights: 1,
      noOfGuests: 2,
      mealPlan: 'breakfastIncluded',
      totalPrice: 4500,
      status: 'confirmed'
    });

    console.log('Successfully seeded database!');
    console.log('Login with owner1@example.com / password123');
    console.log('Login with omkarpatilop0826@gmail.com / password123');
    console.log('Guest Property link: /p/oms-paradise');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
