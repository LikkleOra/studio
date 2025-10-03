import type { Movie, TmdbMovie } from './types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const genreMap: { [key: string]: number } = {
    'Action': 28,
    'Adventure': 12,
    'Animation': 16,
    'Comedy': 35,
    'Crime': 80,
    'Documentary': 99,
    'Drama': 18,
    'Family': 10751,
    'Fantasy': 14,
    'History': 36,
    'Horror': 27,
    'Music': 10402,
    'Mystery': 9648,
    'Romance': 10749,
    'Sci-Fi': 878,
    'TV Movie': 10770,
    'Thriller': 53,
    'War': 10752,
    'Western': 37,
    'Anime': 16, // No specific genre for Anime, often categorized under Animation
};

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not configured in the environment.');
  }

  const url = new URL(`${TMDB_API_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(`TMDB API error: ${response.status} ${response.statusText}`);
    const errorBody = await response.json();
    console.error('Error details:', errorBody);
    throw new Error(`Failed to fetch from TMDB: ${errorBody.status_message || response.statusText}`);
  }
  return response.json();
}

export async function searchMovies(query?: string, genreNames?: string[]): Promise<TmdbMovie[]> {
  const genreIds = genreNames?.map(name => genreMap[name]).filter(Boolean).join(',');

  const params: Record<string, string> = {
    language: 'en-US',
    page: '1',
    include_adult: 'false',
  };

  let results: TmdbMovie[];

  // Prioritize discover endpoint if genres are selected for better filtering
  if (genreIds) {
    params.with_genres = genreIds;
    if(query) {
      // Use the query as a keyword search within the discover endpoint
      params.with_keywords = query; 
    }
    const data = await fetchFromTMDB('/discover/movie', params);
    results = data.results || [];
  } else if (query) {
    params.query = query;
    const data = await fetchFromTMDB('/search/movie', params);
    results = data.results || [];
  } else {
    // Default to popular movies if no query or genre
    const data = await fetchFromTMDB('/movie/popular', params);
    results = data.results || [];
  }

  return results.slice(0, 20);
}


export async function getRecommendations(movieId: number): Promise<TmdbMovie[]> {
  const data = await fetchFromTMDB(`/movie/${movieId}/recommendations`, {
    language: 'en-US',
    page: '1',
  });
  return data.results || [];
}
