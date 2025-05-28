const mongoose = require('mongoose');
const Library = require('./models/Library');
const Event = require('./models/Event');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect');
    
    // Clear existing data
    await Library.deleteMany({});
    await Event.deleteMany({});
    
    // Seed Libraries
    const libraries = [
      {
        name: "Central Library",
        floor: "Ground Floor",
        totalSeats: 100,
        seats: Array.from({ length: 100 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.3,
          occupiedBy: null,
          occupiedAt: null
        }))
      },
      {
        name: "Science Library",
        floor: "First Floor",
        totalSeats: 80,
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.4,
          occupiedBy: null,
          occupiedAt: null
        }))
      },
      {
        name: "Digital Library",
        floor: "Second Floor",
        totalSeats: 60,
        seats: Array.from({ length: 60 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.2,
          occupiedBy: null,
          occupiedAt: null
        }))
      }
    ];
    
    await Library.insertMany(libraries);
    
    // Seed Events
    const events = [
      {
        title: "Tech Innovation Summit",
        description: "Annual technology summit featuring industry leaders",
        date: new Date('2024-02-15'),
        time: "10:00 AM",
        venue: "Main Auditorium",
        category: "Technology",
        totalSeats: 200,
        seats: Array.from({ length: 200 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 25));
          const seatNum = (i % 25) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.2,
            price: Math.floor(i / 50) < 2 ? 100 : Math.floor(i / 50) < 4 ? 75 : 50,
            occupiedBy: null
          };
        })
      },
      {
        title: "Cultural Fest 2024",
        description: "Traditional and modern cultural performances",
        date: new Date('2024-02-20'),
        time: "6:00 PM",
        venue: "Open Theatre",
        category: "Cultural",
        totalSeats: 300,
        seats: Array.from({ length: 300 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 30));
          const seatNum = (i % 30) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.3,
            price: Math.floor(i / 75) < 2 ? 100 : Math.floor(i / 75) < 4 ? 75 : 50,
            occupiedBy: null
          };
        })
      }
    ];
    
    await Event.insertMany(events);
    
    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();

