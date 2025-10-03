import type { TmdbMovie, TmdbTvShow } from './types';

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
    'Science Fiction': 878,
    'TV Movie': 10770,
    'Thriller': 53,
    'War': 10752,
    'Western': 37,
    'Action & Adventure': 10759,
    'Kids': 10762,
    'News': 10763,
    'Reality': 10764,
    'Soap': 10766,
    'Talk': 10767,
    'War & Politics': 10768,
    'Anime': 16, 
};

type MediaType = 'movie' | 'tv';

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

async function searchMedia(mediaType: MediaType, query?: string, genreNames?: string[]): Promise<(TmdbMovie | TmdbTvShow)[]> {
    const genreIds = genreNames?.map(name => genreMap[name]).filter(Boolean).join(',');

    const params: Record<string, string> = {
        language: 'en-US',
        page: '1',
        include_adult: 'false',
    };

    let results: (TmdbMovie | TmdbTvShow)[];
    const discoverEndpoint = `/discover/${mediaType}`;
    const searchEndpoint = `/search/${mediaType}`;

    if (genreIds) {
        params.with_genres = genreIds;
        if (query) {
             const keywordSearch = await fetchFromTMDB('/search/keyword', { query });
             if (keywordSearch.results && keywordSearch.results.length > 0) {
                params.with_keywords = keywordSearch.results.map((kw: any) => kw.id).join('|');
             }
        }
        const data = await fetchFromTMDB(discoverEndpoint, params);
        results = (data.results || []).map((item: any) => ({ ...item, media_type: mediaType }));
    } else if (query) {
        params.query = query;
        const data = await fetchFromTMDB(searchEndpoint, params);
        results = (data.results || []).map((item: any) => ({ ...item, media_type: mediaType }));
    } else {
        const data = await fetchFromTMDB(`/${mediaType}/popular`, params);
        results = (data.results || []).map((item: any) => ({ ...item, media_type: mediaType }));
    }

    return results.slice(0, 20);
}

export async function searchContent(query?: string, genreNames?: string[], mediaType: 'movie' | 'tv' | 'any' = 'any'): Promise<(TmdbMovie | TmdbTvShow)[]> {
  let movieResults: (TmdbMovie | TmdbTvShow)[] = [];
  let tvResults: (TmdbMovie | TmdbTvShow)[] = [];

  if (mediaType === 'movie' || mediaType === 'any') {
    movieResults = await searchMedia('movie', query, genreNames);
  }
  if (mediaType === 'tv' || mediaType === 'any') {
    tvResults = await searchMedia('tv', query, genreNames);
  }

  // In 'any' mode, interleave the results
  if (mediaType === 'any' && movieResults.length > 0 && tvResults.length > 0) {
    const combined = [];
    const minLength = Math.min(movieResults.length, tvResults.length);
    for (let i = 0; i < minLength; i++) {
        combined.push(movieResults[i]);
        combined.push(tvResults[i]);
    }
    combined.push(...movieResults.slice(minLength));
    combined.push(...tvResults.slice(minLength));
    return combined.slice(0, 20);
  }
  
  return [...movieResults, ...tvResults].slice(0, 20);
}


export async function getRecommendations(mediaId: number, mediaType: 'movie' | 'tv'): Promise<(TmdbMovie | TmdbTvShow)[]> {
  const endpoint = `/${mediaType}/${mediaId}/recommendations`;
  const data = await fetchFromTMDB(endpoint, {
    language: 'en-US',
    page: '1',
  });
  return (data.results || []).map((item: any) => ({ ...item, media_type: mediaType }));
}
