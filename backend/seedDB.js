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
    
    // Enhanced Libraries with PVR-style layout configuration
    const libraries = [
      {
        name: "LHC Library",
        floor: "Learning Hub Complex - Ground Floor",
        totalSeats: 120,
        layout: { 
          rows: 8, 
          seatsPerRow: 15 
        },
        features: ['Wi-Fi', 'Silent Zone', 'AC', 'Study Pods'],
        seats: Array.from({ length: 120 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.25, // 25% occupied
          occupiedBy: null,
          occupiedAt: null
        }))
      },
      {
        name: "ESB Library",
        floor: "Engineering Sciences Block - First Floor",
        totalSeats: 100,
        layout: { 
          rows: 10, 
          seatsPerRow: 10 
        },
        features: ['Wi-Fi', 'Group Study', 'AC', 'Printing', 'Computers'],
        seats: Array.from({ length: 100 }, (_, i) => ({
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
        layout: { 
          rows: 8, 
          seatsPerRow: 10 
        },
        features: ['Wi-Fi', 'Silent Zone', 'AC', 'Research Area', 'Whiteboard'],
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.20, // 20% occupied
          occupiedBy: null,
          occupiedAt: null
        }))
      },
      {
        name: "Central Library",
        floor: "Main Building - Second Floor",
        totalSeats: 150,
        layout: { 
          rows: 10, 
          seatsPerRow: 15 
        },
        features: ['Wi-Fi', 'Silent Zone', 'AC', 'Research Area', 'Printing', 'Study Pods'],
        seats: Array.from({ length: 150 }, (_, i) => ({
          number: i + 1,
          isOccupied: Math.random() < 0.30, // 30% occupied
          occupiedBy: null,
          occupiedAt: null
        }))
      }
    ];
    
    await Library.insertMany(libraries);
    console.log('Libraries seeded successfully with PVR-style layout');
    
    // Enhanced Events with better venue configuration
    const events = [
      {
        title: "Tech Innovation Summit 2024",
        description: "Annual technology summit featuring industry leaders and innovation showcases",
        date: new Date('2024-12-20'),
        time: "10:00 AM",
        venue: "Apex Auditorium",
        category: "Technology",
        totalSeats: 300,
        features: ['AC', 'Sound System', 'Projector', 'Wi-Fi', 'Recording'],
        seats: Array.from({ length: 300 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 25)); // A, B, C, etc.
          const seatNum = (i % 25) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.15,
            price: row <= 'C' ? 150 : row <= 'F' ? 100 : 75, // Premium, Standard, Economy
            occupiedBy: null
          };
        })
      },
      {
        title: "Cultural Fest 2024 - Opening Ceremony",
        description: "Grand opening ceremony with traditional and modern cultural performances",
        date: new Date('2024-12-22'),
        time: "6:00 PM",
        venue: "LHC Auditorium",
        category: "Cultural",
        totalSeats: 250,
        features: ['AC', 'Stage Lighting', 'Sound System', 'Photography'],
        seats: Array.from({ length: 250 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 25));
          const seatNum = (i % 25) + 1;
          return {
            row,
            number: seatNum,
            isOccupied: Math.random() < 0.30,
            price: row <= 'D' ? 100 : 75,
            occupiedBy: null
          };
        })
      },
      {
        title: "Data Science Workshop",
        description: "Hands-on workshop on machine learning and data analytics",
        date: new Date('2024-12-18'),
        time: "2:00 PM",
        venue: "ESB Seminar Hall 1",
        category: "Workshop",
        totalSeats: 80,
        features: ['AC', 'Computers', 'Wi-Fi', 'Whiteboard', 'Projector'],
        seats: Array.from({ length: 80 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 16));
          const seatNum = (i % 16) + 1;
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
        venue: "Central Auditorium",
        category: "Career",
        totalSeats: 200,
        features: ['AC', 'Projector', 'Wi-Fi', 'Recording', 'Live Streaming'],
        seats: Array.from({ length: 200 }, (_, i) => {
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
        features: ['AC', 'Stage', 'Microphones', 'Projector', 'Judging Panel'],
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
    
    console.log('\n🎉 Database seeded successfully with PVR-style enhancements!');
    console.log('\nSeeded Data Summary:');
    console.log('📚 Libraries: 4 (LHC, ESB, Apex, Central) with layout configurations');
    console.log('🎪 Events: 5 upcoming events with enhanced features');
    console.log('💺 Total Library Seats: 450 with PVR-style layouts');
    console.log('🎫 Total Event Seats: 950');
    console.log('\nLayout Configurations:');
    libraries.forEach(lib => {
      console.log(`  ${lib.name}: ${lib.layout.rows} rows × ${lib.layout.seatsPerRow} seats`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();