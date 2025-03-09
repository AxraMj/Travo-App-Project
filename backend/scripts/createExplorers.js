require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');

const explorers = [
  {
    fullName: 'David Chen',
    email: 'david.chen@example.com',
    username: 'wanderlust_david',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/247/200'
  },
  {
    fullName: 'Rachel Kim',
    email: 'rachel.kim@example.com',
    username: 'travel_rachel',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/248/200'
  },
  {
    fullName: 'Marcus Johnson',
    email: 'marcus.johnson@example.com',
    username: 'explorer_marcus',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/249/200'
  },
  {
    fullName: 'Priya Patel',
    email: 'priya.patel@example.com',
    username: 'wanderer_priya',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/250/200'
  },
  {
    fullName: 'Lucas Rodriguez',
    email: 'lucas.rodriguez@example.com',
    username: 'adventurer_lucas',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/251/200'
  },
  {
    fullName: 'Nina Williams',
    email: 'nina.williams@example.com',
    username: 'globetrotter_nina',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/252/200'
  },
  {
    fullName: 'Thomas Schmidt',
    email: 'thomas.schmidt@example.com',
    username: 'traveler_thomas',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/253/200'
  },
  {
    fullName: 'Maya Singh',
    email: 'maya.singh@example.com',
    username: 'voyager_maya',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/254/200'
  },
  {
    fullName: 'Leo Costa',
    email: 'leo.costa@example.com',
    username: 'backpacker_leo',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/255/200'
  },
  {
    fullName: 'Sofia Kowalski',
    email: 'sofia.kowalski@example.com',
    username: 'nomad_sofia',
    password: 'Explorer123!',
    profileImage: 'https://picsum.photos/id/256/200'
  }
];

async function createExplorers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create users and their profiles
    for (const explorerData of explorers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: explorerData.email },
            { username: explorerData.username }
          ]
        });

        if (existingUser) {
          console.log(`Skipping ${explorerData.username} - User already exists`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(explorerData.password, salt);

        // Create user
        const user = new User({
          ...explorerData,
          password: hashedPassword,
          accountType: 'explorer'
        });
        await user.save();

        // Create profile
        const profile = new Profile({
          userId: user._id,
          bio: `Travel enthusiast exploring the world one destination at a time!`,
          location: 'Earth',
          socialLinks: {},
          interests: ['Travel', 'Culture', 'Food', 'Photography'],
          stats: {
            totalPosts: 0,
            totalGuides: 0,
            totalLikes: 0
          }
        });
        await profile.save();

        console.log(`Created explorer: ${explorerData.username}`);
      } catch (error) {
        console.error(`Error creating ${explorerData.username}:`, error.message);
      }
    }

    console.log('Finished creating explorers');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createExplorers(); 