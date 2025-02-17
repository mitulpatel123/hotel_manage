import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';

dotenv.config();

const initialRooms = [
  {
    number: '101',
    type: 'Standard'
  },
  {
    number: '102',
    type: 'Deluxe'
  },
  {
    number: '201',
    type: 'Suite'
  },
  // ADD THIS EXTRA ROOM FOR “OTHER”:
  {
    number: '999',    // some unique “room number”
    type: 'Other'     // label it “Other,” or “Misc,” “Facility,” etc.
  }
];

async function setupRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    for (const roomData of initialRooms) {
      const existingRoom = await Room.findOne({ number: roomData.number });
      
      if (!existingRoom) {
        const room = new Room(roomData);
        await room.save();
        console.log(`Created room: ${roomData.number}`);
      } else {
        console.log(`Room ${roomData.number} already exists`);
      }
    }

    console.log('Room setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

setupRooms();
