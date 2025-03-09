require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Profile = require('../models/Profile');

const locations = [
  {
    name: 'Santorini, Greece',
    coordinates: { latitude: 36.3932, longitude: 25.4615 },
    description: 'Stunning sunset views over the Aegean Sea. The white-washed buildings create the perfect backdrop for any photo.',
    tips: [
      'Visit Oia Castle for the best sunset views',
      'Try the local wine tasting experiences',
      'Best time to visit is May to September'
    ],
    weather: { temp: 25, description: 'Sunny', icon: 'sun' }
  },
  {
    name: 'Kyoto, Japan',
    coordinates: { latitude: 35.0116, longitude: 135.7681 },
    description: 'Ancient temples and beautiful cherry blossoms. The perfect blend of tradition and natural beauty.',
    tips: [
      'Visit during cherry blossom season (late March to early April)',
      'Rent a kimono for authentic photos',
      'Try the matcha tea ceremonies'
    ],
    weather: { temp: 22, description: 'Partly Cloudy', icon: 'cloud-sun' }
  },
  {
    name: 'Machu Picchu, Peru',
    coordinates: { latitude: -13.1631, longitude: -72.5450 },
    description: 'The ancient Incan citadel set against the dramatic Andes mountains. A truly breathtaking experience.',
    tips: [
      'Book tickets well in advance',
      'Arrive early to avoid crowds',
      'Hire a local guide for the best experience'
    ],
    weather: { temp: 20, description: 'Clear', icon: 'sun' }
  },
  {
    name: 'Banff National Park, Canada',
    coordinates: { latitude: 51.4968, longitude: -115.9281 },
    description: 'Pristine lakes and majestic mountains create a paradise for nature lovers and photographers.',
    tips: [
      'Visit Lake Louise at sunrise',
      'Take the Banff Gondola for mountain views',
      'Watch for wildlife early morning or late evening'
    ],
    weather: { temp: 15, description: 'Clear', icon: 'sun' }
  },
  {
    name: 'Amalfi Coast, Italy',
    coordinates: { latitude: 40.6333, longitude: 14.6029 },
    description: 'Colorful cliffside villages and crystal-clear Mediterranean waters. A dream destination for photographers.',
    tips: [
      'Take a boat tour along the coast',
      'Visit during shoulder season (May or September)',
      'Try the local limoncello'
    ],
    weather: { temp: 24, description: 'Sunny', icon: 'sun' }
  },
  {
    name: 'Bali, Indonesia',
    coordinates: { latitude: -8.4095, longitude: 115.1889 },
    description: 'Tropical paradise with stunning temples, rice terraces, and beaches. Perfect for both adventure and relaxation.',
    tips: [
      'Visit Tegalalang Rice Terrace early morning',
      'Book a private driver for temple tours',
      'Try local warungs for authentic food'
    ],
    weather: { temp: 29, description: 'Tropical', icon: 'sun' }
  }
];

const images = [
  'https://picsum.photos/id/1015/1000',
  'https://picsum.photos/id/1016/1000',
  'https://picsum.photos/id/1018/1000',
  'https://picsum.photos/id/1019/1000',
  'https://picsum.photos/id/1022/1000',
  'https://picsum.photos/id/1029/1000',
  'https://picsum.photos/id/1033/1000',
  'https://picsum.photos/id/1036/1000',
  'https://picsum.photos/id/1039/1000',
  'https://picsum.photos/id/1043/1000'
];

async function createPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all creators
    const creators = await User.find({ accountType: 'creator' });
    console.log(`Found ${creators.length} creators`);

    for (const creator of creators) {
      try {
        console.log(`Creating posts for ${creator.username}`);
        
        // Each creator gets 2-3 random posts
        const numPosts = Math.floor(Math.random() * 2) + 2; // 2-3 posts
        
        for (let i = 0; i < numPosts; i++) {
          // Get random location and image
          const location = locations[Math.floor(Math.random() * locations.length)];
          const image = images[Math.floor(Math.random() * images.length)];

          const post = new Post({
            userId: creator._id,
            image,
            description: location.description,
            location: {
              name: location.name,
              coordinates: location.coordinates
            },
            weather: location.weather,
            travelTips: location.tips
          });

          await post.save();

          // Update creator's post count
          await Profile.findOneAndUpdate(
            { userId: creator._id },
            { $inc: { 'stats.totalPosts': 1 } }
          );

          console.log(`Created post for ${creator.username} at ${location.name}`);
        }
      } catch (error) {
        console.error(`Error creating posts for ${creator.username}:`, error.message);
      }
    }

    console.log('Finished creating posts');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createPosts(); 