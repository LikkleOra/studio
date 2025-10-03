import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import type { GroupMovieRecommendation } from '@/lib/types';
import { Users } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

type GroupMovieCardProps = {
  movie: GroupMovieRecommendation;
};

export function GroupMovieCard({ movie }: GroupMovieCardProps) {
  const matchPercentage = movie.groupMatchPercentage;
  const posterUrl = movie.posterUrl || placeholderImages[0].imageUrl;


  return (
    <Card className="flex flex-col overflow-hidden h-full border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-2xl">
      <CardContent className="p-0 relative">
        <Image
          src={posterUrl}
          alt={`Poster for ${movie.title}`}
          width={400}
          height={600}
          className="w-full h-auto object-cover"
          data-ai-hint="movie poster"
        />
      </CardContent>
      <CardHeader className="flex-grow">
        <CardTitle className="text-lg font-headline">{movie.title}</CardTitle>
        <CardDescription className="text-xs pt-1 line-clamp-4">{movie.whyThisWorks}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2">
         <div className='w-full'>
            <div className='flex justify-between items-center mb-1'>
                <Badge variant="secondary" className="gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Group Match
                </Badge>
                <span className="text-sm font-semibold text-primary">{Math.round(matchPercentage)}%</span>
            </div>
            <Progress value={matchPercentage} className="h-2" />
         </div>
      </CardFooter>
    </Card>
  );
}
