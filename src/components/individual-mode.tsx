'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { findIndividualMovies } from '@/lib/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Flame, Ghost, Heart, Home, Smile, Wand2, LoaderCircle } from 'lucide-react';
import { MovieCard } from './movie-card';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import type { IndividualMovieState } from '@/lib/types';

const initialState: IndividualMovieState = {};

const moods = [
  { value: 'Chill', label: 'Chill', icon: Smile },
  { value: 'Hype', label: 'Hype', icon: Flame },
  { value: 'Cozy', label: 'Cozy', icon: Home },
  { value: 'Scared', label: 'Scared', icon: Ghost },
  { value: 'Emotional', label: 'Emotional', icon: Heart },
];

const allGenres = ['Horror', 'Comedy', 'Romance', 'Anime', 'Sci-Fi', 'Action', 'Thriller', 'Drama', 'Fantasy', 'Documentary'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full text-lg h-12">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Find Movies
        </>
      )}
    </Button>
  );
}

export default function IndividualMode() {
  const [state, formAction] = useFormState(findIndividualMovies, initialState);
  const { toast } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Find Your Vibe</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">1. Pick Your Mood</Label>
              <RadioGroup name="mood" className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2" required>
                {moods.map(({ value, label, icon: Icon }) => (
                  <div key={value}>
                    <RadioGroupItem value={value} id={`mood-${value}`} className="sr-only" />
                    <Label
                      htmlFor={`mood-${value}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                    >
                      <Icon className="mb-2 h-7 w-7" />
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label htmlFor="vibe" className="text-lg font-semibold">2. Match The Vibe (Optional)</Label>
              <Input
                id="vibe"
                name="vibe"
                placeholder='"Shrek", "Inception", "A quiet rainy day"'
                className="text-base"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label className="text-lg font-semibold">3. Filter by Genre (Optional)</Label>
              <input type="hidden" name="genres" value={selectedGenres.join(',')} />
              <div className="flex flex-wrap gap-2">
                {allGenres.map((genre) => (
                  <Button
                    key={genre}
                    type="button"
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Results movies={state.movies} />
    </div>
  );
}

function Results({ movies }: { movies?: IndividualMovieState['movies'] }) {
    const { pending } = useFormStatus();

    if (pending) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-0">
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    if (!movies) {
        return null;
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in-50">
            {movies.map((movie, index) => (
                <MovieCard key={`${movie.title}-${index}`} movie={movie} index={index} />
            ))}
        </div>
    );
}
