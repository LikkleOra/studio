import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import type { MovieRecommendation } from '@/lib/types';
import { Tv } from 'lucide-react';
import { MovieDetailsDialog } from './movie-details-dialog';

type MovieCardProps = {
  movie: MovieRecommendation;
  index: number;
};

export function MovieCard({ movie }: MovieCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const confidence = movie.confidenceScore * 100;

  return (
    <>
      <Card 
        className="flex flex-col overflow-hidden h-full border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-2xl cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardContent className="p-0 relative">
          <Image
            src={movie.posterUrl!}
            alt={`Poster for ${movie.title}`}
            width={400}
            height={600}
            className="w-full h-auto object-cover"
            data-ai-hint="movie poster"
          />
        </CardContent>
        <CardHeader className="flex-grow pb-3">
          <CardTitle className="text-lg font-headline">{movie.title}</CardTitle>
          <CardDescription className="text-xs pt-1 line-clamp-3">{movie.reason}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col items-start gap-4">
          {movie.watchProviders && movie.watchProviders.length > 0 && (
              <div className="w-full">
                  <div className='flex items-center gap-2 mb-1'>
                      <Tv className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">Available on:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                      {movie.watchProviders.map((provider) => (
                      <Badge key={provider} variant="outline">
                          {provider}
                      </Badge>
                      ))}
                  </div>
              </div>
          )}
           <div className='w-full'>
              <div className='flex justify-between items-center mb-1'>
                  <Badge variant="secondary">Confidence</Badge>
                  <span className="text-sm font-semibold text-primary">{Math.round(confidence)}%</span>
              </div>
              <Progress value={confidence} className="h-2" />
           </div>
        </CardFooter>
      </Card>
      <MovieDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mediaId={movie.mediaId}
        mediaType={movie.mediaType}
      />
    </>
  );
}
