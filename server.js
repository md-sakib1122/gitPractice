const axios = require('axios');
const XLSX = require('xlsx'); // Import the xlsx library

const API_KEY = 'AIzaSyCbPFdH3vMMQtdIE0SEFgcBjdoZRkzsMlk';
const SEARCH_QUERY = 'football';
const MAX_RESULTS = 50; // Maximum results per request
const TOTAL_RESULTS = 100; // Total results desired
const COUNTRY_CODE = 'US'; // Specify the country (e.g., 'US' for the United States)

const categoryMapping = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '20': 'Gaming',
  '22': 'People & Blogs',
  // Add more categories as needed
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

const getTopSportsVideos = async () => {
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
          regionCode: COUNTRY_CODE, // Add country filter here
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
            description: video.snippet.description,
            tags: video.snippet.tags || [],
            category: categoryMapping[video.snippet.categoryId] || 'Unknown', // Convert category ID to category name
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            dislikeCount: video.statistics.dislikeCount,
            commentCount: video.statistics.commentCount,
            shareCount: video.statistics.shareCount || 0, // Share count not available in this API call
            uploadDate: formatDate(video.snippet.publishedAt), // Format the date
            duration: convertDurationToSeconds(video.contentDetails.duration), // Convert duration to seconds
            channelName: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            subscriberCount: subscriberCount,
            videoCount: videoCount, // Total number of videos on the channel
            channelAge: channelAge, // Channel age
            contentType: 'Video', // Fixed content type
            url: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || 'N/A', // Thumbnail URL
            country: COUNTRY_CODE // Country filter used in the API call
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
    XLSX.writeFile(wb, 'topfootballVideos.xlsx');
    console.log('Data saved to topfootballVideos.xlsx');

  } catch (error) {
    console.error('Error fetching YouTube data:', error.response?.data || error.message);
  }
};

getTopSportsVideos();
