require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');

const creators = [
  {
    fullName: 'Sarah Thompson',
    email: 'sarah.thompson@example.com',
    username: 'wanderlust_sarah',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/237/200'
  },
  {
    fullName: 'James Wilson',
    email: 'james.wilson@example.com',
    username: 'adventure_james',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/238/200'
  },
  {
    fullName: 'Emma Davis',
    email: 'emma.davis@example.com',
    username: 'traveler_emma',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/239/200'
  },
  {
    fullName: 'Michael Brown',
    email: 'michael.brown@example.com',
    username: 'explorer_mike',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/240/200'
  },
  {
    fullName: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    username: 'globetrotter_olivia',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/241/200'
  },
  {
    fullName: 'Daniel Lee',
    email: 'daniel.lee@example.com',
    username: 'nomad_daniel',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/242/200'
  },
  {
    fullName: 'Sophia Anderson',
    email: 'sophia.anderson@example.com',
    username: 'wanderer_sophia',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/243/200'
  },
  {
    fullName: 'William Taylor',
    email: 'william.taylor@example.com',
    username: 'voyager_will',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/244/200'
  },
  {
    fullName: 'Isabella Garcia',
    email: 'isabella.garcia@example.com',
    username: 'travelbug_bella',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/245/200'
  },
  {
    fullName: 'Alexander Wright',
    email: 'alexander.wright@example.com',
    username: 'pathfinder_alex',
    password: 'Creator123!',
    profileImage: 'https://picsum.photos/id/246/200'
  }
];

async function createCreators() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create users and their profiles
    for (const creatorData of creators) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: creatorData.email },
            { username: creatorData.username }
          ]
        });

        if (existingUser) {
          console.log(`Skipping ${creatorData.username} - User already exists`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(creatorData.password, salt);

        // Create user
        const user = new User({
          ...creatorData,
          password: hashedPassword,
          accountType: 'creator'
        });
        await user.save();

        // Create profile
        const profile = new Profile({
          userId: user._id,
          bio: `Travel enthusiast and content creator. Follow my journey!`,
          location: 'Worldwide',
          socialLinks: {
            instagram: `https://instagram.com/${creatorData.username}`,
            twitter: `https://twitter.com/${creatorData.username}`
          },
          interests: ['Travel', 'Photography', 'Adventure', 'Culture'],
          stats: {
            totalPosts: 0,
            totalGuides: 0,
            totalLikes: 0
          }
        });
        await profile.save();

        console.log(`Created creator: ${creatorData.username}`);
      } catch (error) {
        console.error(`Error creating ${creatorData.username}:`, error.message);
      }
    }

    console.log('Finished creating creators');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createCreators(); 