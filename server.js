const axios = require('axios');
const XLSX = require('xlsx'); // Import the xlsx library

const API_KEY = 'AIzaSyCbPFdH3vMMQtdIE0SEFgcBjdoZRkzsMlk';
const SEARCH_QUERY = 'unboxing';
const MAX_RESULTS = 50; // Maximum results per request
const TOTAL_RESULTS = 100; // Total results desired

// Mapping of category IDs to category names
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

// Mapping of country codes to full country names
const countryMapping = {
  'AF': 'Afghanistan',
  'AL': 'Albania',
  'DZ': 'Algeria',
  'AS': 'American Samoa',
  'AD': 'Andorra',
  'AO': 'Angola',
  'AI': 'Anguilla',
  'AQ': 'Antarctica',
  'AR': 'Argentina',
  'AM': 'Armenia',
  'AW': 'Aruba',
  'AU': 'Australia',
  'AT': 'Austria',
  'AZ': 'Azerbaijan',
  'BS': 'Bahamas',
  'BH': 'Bahrain',
  'BD': 'Bangladesh',
  'BB': 'Barbados',
  'BY': 'Belarus',
  'BE': 'Belgium',
  'BZ': 'Belize',
  'BJ': 'Benin',
  'BM': 'Bermuda',
  'BT': 'Bhutan',
  'BO': 'Bolivia',
  'BA': 'Bosnia and Herzegovina',
  'BW': 'Botswana',
  'BR': 'Brazil',
  'BN': 'Brunei',
  'BG': 'Bulgaria',
  'BF': 'Burkina Faso',
  'BI': 'Burundi',
  'KH': 'Cambodia',
  'CM': 'Cameroon',
  'CA': 'Canada',
  'CV': 'Cape Verde',
  'KY': 'Cayman Islands',
  'CF': 'Central African Republic',
  'TD': 'Chad',
  'CL': 'Chile',
  'CN': 'China',
  'CO': 'Colombia',
  'KM': 'Comoros',
  'CG': 'Congo',
  'CR': 'Costa Rica',
  'CI': 'Cote d\'Ivoire',
  'HR': 'Croatia',
  'CU': 'Cuba',
  'CY': 'Cyprus',
  'CZ': 'Czech Republic',
  'DK': 'Denmark',
  'DJ': 'Djibouti',
  'DM': 'Dominica',
  'DO': 'Dominican Republic',
  'EC': 'Ecuador',
  'EG': 'Egypt',
  'SV': 'El Salvador',
  'GQ': 'Equatorial Guinea',
  'ER': 'Eritrea',
  'EE': 'Estonia',
  'ET': 'Ethiopia',
  'FJ': 'Fiji',
  'FI': 'Finland',
  'FR': 'France',
  'GA': 'Gabon',
  'GM': 'Gambia',
  'GE': 'Georgia',
  'DE': 'Germany',
  'GH': 'Ghana',
  'GR': 'Greece',
  'GL': 'Greenland',
  'GD': 'Grenada',
  'GU': 'Guam',
  'GT': 'Guatemala',
  'GN': 'Guinea',
  'GW': 'Guinea-Bissau',
  'GY': 'Guyana',
  'HT': 'Haiti',
  'HN': 'Honduras',
  'HU': 'Hungary',
  'IS': 'Iceland',
  'IN': 'India',
  'ID': 'Indonesia',
  'IR': 'Iran',
  'IQ': 'Iraq',
  'IE': 'Ireland',
  'IL': 'Israel',
  'IT': 'Italy',
  'JM': 'Jamaica',
  'JP': 'Japan',
  'JO': 'Jordan',
  'KZ': 'Kazakhstan',
  'KE': 'Kenya',
  'KI': 'Kiribati',
  'KR': 'Korea, Republic of',
  'KW': 'Kuwait',
  'KG': 'Kyrgyzstan',
  'LA': 'Lao People\'s Democratic Republic',
  'LV': 'Latvia',
  'LB': 'Lebanon',
  'LS': 'Lesotho',
  'LR': 'Liberia',
  'LY': 'Libya',
  'LI': 'Liechtenstein',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'MO': 'Macau',
  'MK': 'Macedonia',
  'MG': 'Madagascar',
  'MW': 'Malawi',
  'MY': 'Malaysia',
  'MV': 'Maldives',
  'ML': 'Mali',
  'MT': 'Malta',
  'MH': 'Marshall Islands',
  'MR': 'Mauritania',
  'MU': 'Mauritius',
  'MX': 'Mexico',
  'FM': 'Micronesia',
  'MD': 'Moldova',
  'MC': 'Monaco',
  'MN': 'Mongolia',
  'ME': 'Montenegro',
  'MA': 'Morocco',
  'MZ': 'Mozambique',
  'MM': 'Myanmar',
  'NA': 'Namibia',
  'NR': 'Nauru',
  'NP': 'Nepal',
  'NL': 'Netherlands',
  'NZ': 'New Zealand',
  'NI': 'Nicaragua',
  'NE': 'Niger',
  'NG': 'Nigeria',
  'NO': 'Norway',
  'OM': 'Oman',
  'PK': 'Pakistan',
  'PW': 'Palau',
  'PA': 'Panama',
  'PG': 'Papua New Guinea',
  'PY': 'Paraguay',
  'PE': 'Peru',
  'PH': 'Philippines',
  'PL': 'Poland',
  'PT': 'Portugal',
  'QA': 'Qatar',
  'RO': 'Romania',
  'RU': 'Russian Federation',
  'RW': 'Rwanda',
  'WS': 'Samoa',
  'SA': 'Saudi Arabia',
  'SN': 'Senegal',
  'RS': 'Serbia',
  'SC': 'Seychelles',
  'SL': 'Sierra Leone',
  'SG': 'Singapore',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'SO': 'Somalia',
  'ZA': 'South Africa',
  'ES': 'Spain',
  'LK': 'Sri Lanka',
  'SD': 'Sudan',
  'SR': 'Suriname',
  'SE': 'Sweden',
  'CH': 'Switzerland',
  'SY': 'Syrian Arab Republic',
  'TW': 'Taiwan',
  'TJ': 'Tajikistan',
  'TZ': 'Tanzania',
  'TH': 'Thailand',
  'TL': 'Timor-Leste',
  'TG': 'Togo',
  'TO': 'Tonga',
  'TT': 'Trinidad and Tobago',
  'TN': 'Tunisia',
  'TR': 'Turkey',
  'TM': 'Turkmenistan',
  'TV': 'Tuvalu',
  'UG': 'Uganda',
  'UA': 'Ukraine',
  'AE': 'United Arab Emirates',
  'GB': 'United Kingdom',
  'US': 'United States',
  'UY': 'Uruguay',
  'UZ': 'Uzbekistan',
  'VU': 'Vanuatu',
  'VE': 'Venezuela',
  'VN': 'Viet Nam',
  'YE': 'Yemen',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe'
};

// Function to get channel details
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
    const locationCode = channel.snippet.country || 'Unknown';
    const location = countryMapping[locationCode] || locationCode; // Convert country code to full name

    return {
      subscriberCount: channel.statistics.subscriberCount || 'N/A',
      videoCount: channel.statistics.videoCount || 'N/A',
      channelAge: new Date().getFullYear() - new Date(channel.snippet.publishedAt).getFullYear(),
      location: location // Use full country name if available
    };
  } catch (error) {
    console.error(`Error fetching channel details for channel ${channelId}:`, error.response?.data || error.message);
    return {
      subscriberCount: 'N/A',
      videoCount: 'N/A',
      channelAge: 'N/A',
      location: 'Unknown'
    };
  }
};

// Function to convert ISO 8601 duration (PT3M7S) to seconds
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

// Format the upload date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Fetch top videos globally without country filtering
const getTopFoodBloggingVideos = async () => {
  let videos = [];
  let nextPageToken = '';

  try {
    while (videos.length < TOTAL_RESULTS) {
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
        break;
      }

      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: API_KEY
        }
      });

      const videosData = await Promise.all(videosResponse.data.items.map(async (video) => {
        try {
          const { subscriberCount, videoCount, channelAge, location } = await getChannelDetails(video.snippet.channelId);

          return {
            title: video.snippet.title,
            tags: video.snippet.tags || ["None"],
            category: categoryMapping[video.snippet.categoryId] || 'Unknown',
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            commentCount: video.statistics.commentCount,
            uploadDate: formatDate(video.snippet.publishedAt),
            duration: convertDurationToSeconds(video.contentDetails.duration),
            channelName: video.snippet.channelTitle,
            subscriberCount: subscriberCount,
            videoCount: videoCount,
            channelAge: channelAge,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || 'N/A',
            country: location // Full country name
          };
        } catch (error) {
          console.error(`Error processing video ${video.id}:`, error.response?.data || error.message);
          return null;
        }
      }));

      videos = videos.concat(videosData.filter(video => video !== null));

      if (!nextPageToken || videos.length >= TOTAL_RESULTS) {
        break;
      }
    }

    const topVideos = videos.slice(0, TOTAL_RESULTS);

    const ws = XLSX.utils.json_to_sheet(topVideos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top Food Blogging Videos');

    XLSX.writeFile(wb, 'topUnboxingVideos.xlsx');
    console.log('Data saved ');

  } catch (error) {
    console.error('Error fetching YouTube data:', error.response?.data || error.message);
  }
};

// Example usage:
getTopFoodBloggingVideos();

