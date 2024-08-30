const axios = require('axios');
const fs = require('fs');

// Replace 'YOUR_API_KEY' with your actual API key
const API_KEY = 'AIzaSyAlgFyt58-LkEQHN5XvnUCphqSAIWAK2dI';
const SEARCH_QUERY = 'food blogging';
const MAX_RESULTS = 50; // Maximum results per request
const TOTAL_RESULTS = 100; // Total results desired

const getChannelSubscriberCount = async (channelId) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'statistics',
        id: channelId,
        key: API_KEY
      }
    });
    return response.data.items[0]?.statistics?.subscriberCount || 'N/A';
  } catch (error) {
    console.error(`Error fetching subscriber count for channel ${channelId}:`, error);
    return 'N/A';
  }
};

const getTopFoodBloggingVideos = async () => {
  let videos = [];
  let nextPageToken = '';
  
  try {
    while (videos.length < TOTAL_RESULTS) {
      // Search for videos related to 'food blogging'
      const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: SEARCH_QUERY,
          type: 'video',
          order: 'viewCount', // Order by view count
          maxResults: MAX_RESULTS,
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

      // Extract video data with proper error handling
      const videosData = await Promise.all(videosResponse.data.items.map(async (video) => {
        try {
          const subscriberCount = await getChannelSubscriberCount(video.snippet.channelId);
          return {
            title: video.snippet.title,
            description: video.snippet.description,
            tags: video.snippet.tags || [],
            category: video.snippet.categoryId,
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            dislikeCount: video.statistics.dislikeCount,
            commentCount: video.statistics.commentCount,
            shareCount: video.statistics.shareCount || 0, // Share count not available in this API call
            uploadDate: video.snippet.publishedAt,
            duration: video.contentDetails.duration,
            channelName: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            subscriberCount: subscriberCount,
            url: `https://www.youtube.com/watch?v=${video.id}`
          };
        } catch (error) {
          console.error(`Error processing video ${video.id}:`, error);
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

    // Save the results to a JSON file
    fs.writeFile('topFoodBloggingVideos.json', JSON.stringify(topVideos, null, 2), (err) => {
      if (err) {
        console.error('Error saving data to file:', err);
      } else {
        console.log('Data saved to topFoodBloggingVideos.json');
      }
    });

  } catch (error) {
    console.error('Error fetching YouTube data:', error);
  }
};

getTopFoodBloggingVideos();