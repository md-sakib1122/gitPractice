const axios = require('axios');
const XLSX = require('xlsx'); // Import the xlsx library

const API_KEY = 'AIzaSyCbPFdH3vMMQtdIE0SEFgcBjdoZRkzsMlk';
const SEARCH_QUERY = 'food blogging';
const MAX_RESULTS = 50; // Maximum results per request
const TOTAL_RESULTS = 100; // Total results desired

const categoryMapping = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '18': 'Short Movies',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '21': 'Videoblogging',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
  '30': 'Movies',
  '31': 'Anime/Animation',
  '32': 'Action/Adventure',
  '33': 'Classics',
  '34': 'Comedy',
  '35': 'Documentary',
  '36': 'Drama',
  '37': 'Family',
  '38': 'Foreign',
  '39': 'Horror',
  '40': 'Sci-Fi/Fantasy',
  '41': 'Thriller',
  '42': 'Shorts',
  '43': 'Shows',
  '44': 'Trailers'
};


const getChannelDetails = async (channelId) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: API_KEY
      }
    });

    const channel = response.data.items[0];
    return {
      subscriberCount: channel.statistics.subscriberCount || 'N/A',
      videoCount: channel.statistics.videoCount || 'N/A',
      channelAge: new Date().getFullYear() - new Date(channel.snippet.publishedAt).getFullYear() // Channel age calculation
    };
  } catch (error) {
    console.error(`Error fetching channel details for channel ${channelId}:`, error.response?.data || error.message);
    return {
      subscriberCount: 'N/A',
      videoCount: 'N/A',
      channelAge: 'N/A'
    };
  }
};

// Function to convert ISO 8601 duration (PT3M7S) to seconds with error handling
const convertDurationToSeconds = (duration) => {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!matches) {
    return 0;
  }

  const hours = parseInt(matches[1], 10) || 0;
  const minutes = parseInt(matches[2], 10) || 0;
  const seconds = parseInt(matches[3], 10) || 0;
  return (hours * 3600) + (minutes * 60) + seconds;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
  return `${year}-${month}`;
};

const getTopSportsVideos = async (countryCode = 'US') => { // Make country code dynamic
  let videos = [];
  let nextPageToken = '';
  
  try {
    while (videos.length < TOTAL_RESULTS) {
      // Search for videos related to 'football' with country filtering
      const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: SEARCH_QUERY,
          type: 'video',
          order: 'viewCount', // Order by view count
          maxResults: MAX_RESULTS,
          regionCode: countryCode, // Use the dynamic country code
          pageToken: nextPageToken,
          key: API_KEY
        }
      });

      const videoIds = searchResponse.data.items.map(item => item.id.videoId);
      nextPageToken = searchResponse.data.nextPageToken;

      if (videoIds.length === 0) {
        break; // No more videos available
      }

      // Get details of the videos
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: API_KEY
        }
      });

      const videosData = await Promise.all(videosResponse.data.items.map(async (video) => {
        try {
          const { subscriberCount, videoCount, channelAge } = await getChannelDetails(video.snippet.channelId);

          return {
            title: video.snippet.title,
            tags: video.snippet.tags || ["None"],
            category: categoryMapping[video.snippet.categoryId] || 'Unknown', // Convert category ID to category name
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            commentCount: video.statistics.commentCount,
            uploadDate: formatDate(video.snippet.publishedAt), // Format the date
            duration: convertDurationToSeconds(video.contentDetails.duration), // Convert duration to seconds
            channelName: video.snippet.channelTitle,
            subscriberCount: subscriberCount,
            videoCount: videoCount, // Total number of videos on the channel
            channelAge: channelAge, // Channel age
            url: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || 'N/A', // Thumbnail URL
            country: countryCode // Country filter used in the API call
          };
        } catch (error) {
          console.error(`Error processing video ${video.id}:`, error.response?.data || error.message);
          return null; // Return null for errors
        }
      }));

      // Filter out any null values resulting from errors
      videos = videos.concat(videosData.filter(video => video !== null));

      if (!nextPageToken || videos.length >= TOTAL_RESULTS) {
        break; // Stop if there are no more pages or we've reached the desired number of videos
      }
    }

    // Trim the results to the desired number if more than needed
    const topVideos = videos.slice(0, TOTAL_RESULTS);

    // Convert the results to an Excel file
    const ws = XLSX.utils.json_to_sheet(topVideos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top Sports Videos');

    // Save the Excel file
    XLSX.writeFile(wb, 'topFoodBloggingVideos.xlsx');
    console.log('Data saved to topFoodBloggingVideos.xlsx');

  } catch (error) {
    console.error('Error fetching YouTube data:', error.response?.data || error.message);
  }
};

// Example usage:
getTopSportsVideos('IN'); // Fetch videos for India
getTopSportsVideos('GB'); // Fetch videos for the UK
