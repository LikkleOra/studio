'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getMovieDetails } from '@/lib/actions';
import type { MovieInfo, Provider } from '@/lib/types';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Star, Tv, Link as LinkIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

type MovieDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
};

export function MovieDetailsDialog({
  open,
  onOpenChange,
  mediaId,
  mediaType,
}: MovieDetailsDialogProps) {
  const [details, setDetails] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        setDetails(null);
        const result = await getMovieDetails(mediaId, mediaType);
        if ('error' in result) {
          setError(result.error);
        } else {
          setDetails(result);
        }
        setLoading(false);
      };
      fetchDetails();
    }
  }, [open, mediaId, mediaType]);

  const title = details?.title || details?.name;
  const releaseDate = details?.release_date || details?.first_air_date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col sm:flex-row p-0">
        {loading ? (
            <div className="w-full p-6 flex flex-col sm:flex-row gap-6">
                <DialogHeader>
                    <VisuallyHidden>
                        <DialogTitle>Loading movie details</DialogTitle>
                        <DialogDescription>Please wait while the movie details are being loaded.</DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <Skeleton className="w-full sm:w-1/3 h-96 rounded-md" />
                <div className="w-full sm:w-2/3 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        ) : error ? (
            <DialogHeader className="p-6">
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
        ) : details ? (
          <>
            <div className="w-full sm:w-1/3 relative flex-shrink-0">
                <Image
                    src={details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '/placeholder.svg'}
                    alt={`Poster for ${title}`}
                    width={500}
                    height={750}
                    className="object-cover rounded-l-lg"
                />
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-headline mb-2">{title}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {releaseDate && <span>{new Date(releaseDate).getFullYear()}</span>}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{details.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {details.trailerKey && (
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${details.trailerKey}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-md"
                        ></iframe>
                    </div>
                )}
                
                <DialogDescription className="text-base">{details.overview}</DialogDescription>

                <div className="flex flex-wrap gap-2">
                    {details.genres?.map((genre) => (
                        <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                    ))}
                </div>

                {details.watchProviders && details.watchProviders.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Tv className="w-5 h-5"/> Where to Watch</h3>
                        <div className="flex flex-wrap gap-3">
                            {details.watchProviders.map((provider) => (
                                <a href={provider.link} target="_blank" rel="noopener noreferrer" key={provider.name}>
                                    <Image src={provider.logoUrl} alt={provider.name} width={40} height={40} className="rounded-md hover:opacity-80 transition-opacity" title={provider.name} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
