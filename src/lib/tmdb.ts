import type { TmdbMovie, TmdbTvShow, MovieInfo, Provider } from './types';

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

type MediaType = 'movie' | 'tv' | 'any';

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not configured in the environment.');
    throw new Error('TMDB_API_KEY is not configured in the environment.');
  }

  const url = new URL(`${TMDB_API_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ status_message: response.statusText }));
    console.error(`TMDB API error: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to fetch from TMDB: ${errorBody.status_message || response.statusText}`);
  }
  return await response.json();
}

export async function searchContent(query?: string, genreNames?: string[], mediaType: 'movie' | 'tv' | 'any' = 'any'): Promise<(TmdbMovie | TmdbTvShow)[]> {
  const params: Record<string, string> = {
    language: 'en-US',
    page: '1',
    include_adult: 'false',
  };

  let results: (TmdbMovie | TmdbTvShow)[] = [];
  
  if (query && typeof query === 'string' && query.trim().length > 0) {
    params.query = query;
    const searchEndpoint = mediaType === 'any' ? '/search/multi' : `/search/${mediaType}`;
    const data = await fetchFromTMDB(searchEndpoint, params);
    results = (data.results || []).filter((r: any) => {
      const type = r.media_type || mediaType;
      return (type === 'movie' || type === 'tv') && r.poster_path;
    }).map((r: any) => ({...r, media_type: r.media_type || mediaType}));

  } else if (genreNames && genreNames.length > 0) {
    const genreIds = genreNames.map(name => genreMap[name]).filter(Boolean).join(',');
    if (genreIds) {
        params.with_genres = genreIds;
    }
    
    const mediaToDiscover: ('movie' | 'tv')[] = mediaType === 'any' ? ['movie', 'tv'] : [mediaType];
    
    const promises = mediaToDiscover.map(async (type) => {
        const discoverEndpoint = `/discover/${type}`;
        try {
            const data = await fetchFromTMDB(discoverEndpoint, params);
            return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
        } catch (error) {
            console.error(`Error discovering ${type} with genres:`, error);
            return []; // Return empty array on error to not fail the whole search
        }
    });

    const settledResults = await Promise.all(promises);
    results = settledResults.flat();
  }

  return results
    .filter(item => item.poster_path)
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 20);
}


export async function getRecommendations(mediaId: number, mediaType: 'movie' | 'tv'): Promise<(TmdbMovie | TmdbTvShow)[]> {
  const endpoint = `/${mediaType}/${mediaId}/recommendations`;
  const data = await fetchFromTMDB(endpoint, {
    language: 'en-US',
    page: '1',
  });
  return (data.results || []).map((item: any) => ({ ...item, media_type: mediaType }));
}

export async function getWatchProviders(mediaId: number, mediaType: 'movie' | 'tv'): Promise<string[]> {
    const endpoint = `/${mediaType}/${mediaId}/watch/providers`;
    const data = await fetchFromTMDB(endpoint);
    const providers = data.results?.US?.flatrate;
    if (!providers || providers.length === 0) {
        return [];
    }
    return providers.map((p: any) => p.provider_name).slice(0, 3);
}

export async function getMediaDetails(mediaId: number, mediaType: 'movie' | 'tv'): Promise<MovieInfo> {
  const endpoint = `/${mediaType}/${mediaId}`;
  const data = await fetchFromTMDB(endpoint, {
    append_to_response: 'videos',
  });
  return data;
}

export async function getWatchProviderLinks(mediaId: number, mediaType: 'movie' | 'tv', mediaTitle: string): Promise<Provider[]> {
    const endpoint = `/${mediaType}/${mediaId}/watch/providers`;
    const data = await fetchFromTMDB(endpoint);
    const providers = data.results?.US?.flatrate;

    if (!providers || providers.length === 0) {
        return [];
    }

    return providers.map((p: any) => {
        const searchUrl = new URL('https://www.google.com/search');
        searchUrl.searchParams.append('q', `${mediaTitle} streaming ${p.provider_name}`);
        
        return {
            name: p.provider_name,
            logoUrl: `https://image.tmdb.org/t/p/w200${p.logo_path}`,
            link: searchUrl.toString(),
        }
    }).slice(0, 4);
}
