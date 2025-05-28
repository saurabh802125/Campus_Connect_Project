const mongoose = require('mongoose');
const Library = require('./models/Library');
const Event = require('./models/Event');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect');
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Library.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');
    
    // Seed Libraries with your college specifics
    const libraries = [
      {
        name: "LHC Library",
        floor: "Learning Hub Complex - Ground Floor",
        totalSeats: 150,
        seats: Array.from({ length: 150 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.25, // 25% occupied
          occupiedBy: null,
          occupiedAt: null
        }))
      },
      {
        name: "ESB Library",
        floor: "Engineering Sciences Block - First Floor",
        totalSeats: 120,
        seats: Array.from({ length: 120 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.35, // 35% occupied
          occupiedBy: null,
          occupiedAt: null
        }))
      },
      {
        name: "Apex Library",
        floor: "Apex Building - Second Floor",
        totalSeats: 80,
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.20, // 20% occupied
          occupiedBy: null,
          occupiedAt: null
        }))
      }
    ];
    
    await Library.insertMany(libraries);
    console.log('Libraries seeded successfully');
    
    // Seed Events with college seminar halls
    const events = [
      {
        title: "Tech Innovation Summit 2024",
        description: "Annual technology summit featuring industry leaders and innovation showcases",
        date: new Date('2024-12-20'),
        time: "10:00 AM",
        venue: "ESB Seminar Hall 1",
        category: "Technology",
        totalSeats: 200,
        seats: Array.from({ length: 200 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 25)); // A, B, C, etc.
          const seatNum = (i % 25) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.15,
            price: row <= 'C' ? 100 : row <= 'F' ? 75 : 50, // Premium, Standard, Economy
            occupiedBy: null
          };
        })
      },
      {
        title: "Cultural Fest 2024 - Opening Ceremony",
        description: "Grand opening ceremony with traditional and modern cultural performances",
        date: new Date('2024-12-22'),
        time: "6:00 PM",
        venue: "Apex Auditorium",
        category: "Cultural",
        totalSeats: 500,
        seats: Array.from({ length: 500 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 35));
          const seatNum = (i % 35) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.30,
            price: row <= 'D' ? 150 : row <= 'H' ? 100 : 75,
            occupiedBy: null
          };
        })
      },
      {
        title: "Data Science Workshop",
        description: "Hands-on workshop on machine learning and data analytics",
        date: new Date('2024-12-18'),
        time: "2:00 PM",
        venue: "LHC Seminar Hall 1",
        category: "Workshop",
        totalSeats: 80,
        seats: Array.from({ length: 80 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 20));
          const seatNum = (i % 20) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.40,
            price: 50,
            occupiedBy: null
          };
        })
      },
      {
        title: "Industry Connect Seminar",
        description: "Connect with industry professionals and explore career opportunities",
        date: new Date('2024-12-25'),
        time: "11:00 AM",
        venue: "LHC Seminar Hall 2",
        category: "Career",
        totalSeats: 100,
        seats: Array.from({ length: 100 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 25));
          const seatNum = (i % 25) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.25,
            price: 75,
            occupiedBy: null
          };
        })
      },
      {
        title: "Startup Pitch Competition",
        description: "Student entrepreneurs present their innovative startup ideas",
        date: new Date('2024-12-28'),
        time: "3:00 PM",
        venue: "ESB Seminar Hall 2",
        category: "Competition",
        totalSeats: 120,
        seats: Array.from({ length: 120 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 20));
          const seatNum = (i % 20) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.20,
            price: 25,
            occupiedBy: null
          };
        })
      }
    ];
    
    await Event.insertMany(events);
    console.log('Events seeded successfully');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSeeded Data Summary:');
    console.log('📚 Libraries: 3 (LHC, ESB, Apex)');
    console.log('🎪 Events: 5 upcoming events');
    console.log('💺 Total Library Seats: 350');
    console.log('🎫 Total Event Seats: 1000');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();