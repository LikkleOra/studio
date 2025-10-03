import type { Movie } from './types';

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

export async function searchMovies(query?: string, genreNames?: string[]): Promise<Movie[]> {
  const genreIds = genreNames?.map(name => genreMap[name]).filter(Boolean).join(',');

  const params: Record<string, string> = {
    language: 'en-US',
    page: '1',
    include_adult: 'false',
  };

  let results: Movie[];

  if (query) {
    params.query = query;
    const data = await fetchFromTMDB('/search/movie', params);
    results = data.results || [];
  } else {
    const data = await fetchFromTMDB('/discover/movie', params);
     results = data.results || [];
  }

  if (genreIds && genreIds.length > 0) {
    const requestedGenreIds = genreIds.split(',').map(Number);
    results = results.filter(movie => 
        movie.genre_ids?.some((id: number) => requestedGenreIds.includes(id))
    );
  }

  return results.slice(0, 20);
}


export async function getRecommendations(movieId: number): Promise<Movie[]> {
  const data = await fetchFromTMDB(`/movie/${movieId}/recommendations`, {
    language: 'en-US',
    page: '1',
  });
  return data.results || [];
}
