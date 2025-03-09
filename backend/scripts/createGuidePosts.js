require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Guide = require('../models/Guide');
const Profile = require('../models/Profile');

const travelTips = [
  {
    location: 'Kyoto, Japan',
    locationNote: 'Best during cherry blossom season',
    text: 'Visit the Fushimi Inari Shrine early morning to avoid crowds. The thousand torii gates are most photogenic at sunrise. Don\'t miss the local street food in Nishiki Market!',
  },
  {
    location: 'Santorini, Greece',
    locationNote: 'Perfect for sunset views',
    text: 'Book a hotel in Oia for the best sunset views. Take the hiking trail from Fira to Oia for breathtaking caldera views. Best time to visit is May to September when the weather is perfect.',
  },
  {
    location: 'Machu Picchu, Peru',
    locationNote: 'High altitude location',
    text: 'Spend at least 2-3 days in Cusco to acclimatize before visiting Machu Picchu. Book the first bus up to the site to catch the sunrise. Consider hiking the Huayna Picchu mountain for unique views.',
  },
  {
    location: 'Venice, Italy',
    locationNote: 'Early morning is magical',
    text: 'Explore the quiet canals before 8 AM for the best photos. Buy a vaporetto pass for unlimited water bus rides. Stay in Dorsoduro area for a more authentic experience away from crowds.',
  },
  {
    location: 'Bali, Indonesia',
    locationNote: 'Cultural heart of Indonesia',
    text: 'Visit Tegalalang Rice Terrace at sunrise. Book a private driver for temple hopping. Try local warungs for authentic Indonesian food. Don\'t miss the water temples!',
  },
  {
    location: 'Marrakech, Morocco',
    locationNote: 'A maze of wonders',
    text: 'Stay in a traditional riad in the medina. Haggle in the souks but always with a smile. Visit Jardin Majorelle early morning. Book a desert tour to Sahara for stargazing.',
  },
  {
    location: 'Banff National Park, Canada',
    locationNote: 'Wildlife paradise',
    text: 'Visit Lake Louise at sunrise for mirror reflections. Take the Banff Gondola for mountain views. Drive the Icefields Parkway for incredible landscapes. Watch for wildlife early morning.',
  },
  {
    location: 'Petra, Jordan',
    locationNote: 'Ancient wonder',
    text: 'Buy a Jordan Pass before arriving. Visit Petra by night for a magical experience. Hike to the Monastery early morning to avoid heat. Stay in a Bedouin camp for authentic experience.',
  },
  {
    location: 'Dubrovnik, Croatia',
    locationNote: 'Kings Landing from GOT',
    text: 'Walk the city walls at sunset. Take the cable car for panoramic views. Visit nearby islands by ferry. Avoid peak summer months for fewer crowds.',
  },
  {
    location: 'Cape Town, South Africa',
    locationNote: 'Where mountains meet ocean',
    text: 'Hike Table Mountain for sunrise. Visit Cape Point early morning. Book wine tours in Stellenbosch. Don\'t miss the penguins at Boulders Beach!',
  },
  {
    location: 'Angkor Wat, Cambodia',
    locationNote: 'Temple paradise',
    text: 'Buy a multi-day pass. Start with sunrise at Angkor Wat. Explore Ta Prohm in afternoon light. Hire a knowledgeable guide to understand the history.',
  },
  {
    location: 'Queenstown, New Zealand',
    locationNote: 'Adventure capital',
    text: 'Take the Skyline Gondola for city views. Do the Routeburn Track for hiking. Visit Milford Sound on a clear day. Try the famous Fergburger!',
  },
  {
    location: 'Reykjavik, Iceland',
    locationNote: 'Land of fire and ice',
    text: 'Rent a car for Ring Road. Chase northern lights in winter. Visit hot springs early morning. Don\'t miss the Golden Circle route.',
  },
  {
    location: 'Havana, Cuba',
    locationNote: 'Vintage charm',
    text: 'Stay in a casa particular. Take a classic car tour. Visit Viñales Valley for tobacco farms. Dance salsa at local clubs.',
  }
];

async function createGuidePosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all creators with their profiles
    const creators = await User.find({ accountType: 'creator' });
    console.log(`Found ${creators.length} creators`);

    for (const creator of creators) {
      try {
        console.log(`Creating guides for ${creator.username}`);
        
        // Each creator gets 3-5 random guides
        const numGuides = Math.floor(Math.random() * 3) + 3; // 3-5 guides
        
        // Get creator's profile
        const profile = await Profile.findOne({ userId: creator._id });
        
        for (let i = 0; i < numGuides; i++) {
          // Get random travel tip
          const tip = travelTips[Math.floor(Math.random() * travelTips.length)];

          // Generate random likes and dislikes
          const numLikes = Math.floor(Math.random() * 50); // Random likes 0-49
          const numDislikes = Math.floor(Math.random() * 20); // Random dislikes 0-19

          // Create array of random user IDs for likes and dislikes
          const allUsers = await User.find({ _id: { $ne: creator._id } });
          const likedBy = [];
          const dislikedBy = [];

          // Randomly select users for likes
          for (let j = 0; j < numLikes; j++) {
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            if (!likedBy.includes(randomUser._id)) {
              likedBy.push(randomUser._id);
            }
          }

          // Randomly select users for dislikes
          for (let j = 0; j < numDislikes; j++) {
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            if (!dislikedBy.includes(randomUser._id) && !likedBy.includes(randomUser._id)) {
              dislikedBy.push(randomUser._id);
            }
          }

          const guide = new Guide({
            userId: creator._id,
            text: tip.text,
            location: tip.location,
            locationNote: tip.locationNote,
            likes: likedBy.length,
            dislikes: dislikedBy.length,
            likedBy: likedBy,
            dislikedBy: dislikedBy,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7776000000)) // Random date within last 90 days
          });

          await guide.save();

          // Update creator's profile stats
          if (profile) {
            profile.stats.totalGuides += 1;
            await profile.save();
          }

          console.log(`Created guide for ${creator.username} about ${tip.location} with ${likedBy.length} likes and ${dislikedBy.length} dislikes`);
        }
      } catch (error) {
        console.error(`Error creating guides for ${creator.username}:`, error.message);
      }
    }

    console.log('Finished creating guides');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createGuidePosts(); 