import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import type { MovieRecommendation } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images';

type MovieCardProps = {
  movie: MovieRecommendation;
  index: number;
};

export function MovieCard({ movie, index }: MovieCardProps) {
  const confidence = movie.confidenceScore * 100;
  const placeholder = placeholderImages[index % placeholderImages.length];

  return (
    <Card className="flex flex-col overflow-hidden h-full border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-2xl">
      <CardContent className="p-0 relative">
        <Image
          src={placeholder.imageUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover"
          data-ai-hint={placeholder.imageHint}
        />
      </CardContent>
      <CardHeader className="flex-grow">
        <CardTitle className="text-lg font-headline">{movie.title}</CardTitle>
        <CardDescription className="text-xs pt-1 line-clamp-3">{movie.reason}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2">
         <div className='w-full'>
            <div className='flex justify-between items-center mb-1'>
                <Badge variant="secondary">Confidence</Badge>
                <span className="text-sm font-semibold text-primary">{Math.round(confidence)}%</span>
            </div>
            <Progress value={confidence} className="h-2" />
         </div>
      </CardFooter>
    </Card>
  );
}
