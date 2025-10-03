'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { findGroupMovies } from '@/lib/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Flame, Ghost, Heart, Home, Smile, Wand2, LoaderCircle, Plus, Trash2, User } from 'lucide-react';
import { GroupMovieCard } from './group-movie-card';
import { Skeleton } from './ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import type { Participant, GroupMovieState } from '@/lib/types';

const initialState: GroupMovieState = {};

const moods = [
  { value: 'Chill', label: 'Chill', icon: Smile },
  { value: 'Hype', label: 'Hype', icon: Flame },
  { value: 'Cozy', label: 'Cozy', icon: Home },
  { value: 'Scared', label: 'Scared', icon: Ghost },
  { value: 'Emotional', label: 'Emotional', icon: Heart },
];

const allGenres = ['Horror', 'Comedy', 'Romance', 'Anime', 'Sci-Fi', 'Action', 'Thriller', 'Drama'];

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full text-lg h-14 mt-6">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
          Fusing Tastes...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Find Group Movies
        </>
      )}
    </Button>
  );
}

export default function GroupMode() {
  const [state, formAction] = useActionState(findGroupMovies, initialState);
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([
    { id: `p${Date.now()}`, mood: 'Chill', genres: ['Comedy'], vibe: '' },
    { id: `p${Date.now() + 1}`, mood: 'Hype', genres: ['Action'], vibe: '' },
  ]);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const addParticipant = () => {
    if (participants.length >= 5) {
        toast({ title: 'Group Full', description: 'You can have a maximum of 5 participants.' });
        return;
    }
    setParticipants([...participants, { id: `p${Date.now()}`, mood: 'Chill', genres: [], vibe: '' }]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipant = (id: string, newValues: Partial<Participant>) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, ...newValues } : p)));
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Assemble Your Crew</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="space-y-4">
              {participants.map((p, index) => (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  index={index}
                  onUpdate={updateParticipant}
                  onRemove={removeParticipant}
                  canRemove={participants.length > 1}
                />
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addParticipant} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
            <input type="hidden" name="participants" value={JSON.stringify(participants)} />
            <SubmitButton disabled={participants.length === 0} />
          </form>
        </CardContent>
      </Card>
      
      <Results movies={state.movies} />
    </div>
  );
}

function ParticipantCard({
  participant,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  participant: Participant;
  index: number;
  onUpdate: (id: string, newValues: Partial<Participant>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  return (
    <Card className="bg-background/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary"/>
            Person {index + 1}
        </CardTitle>
        {canRemove && (
          <Button variant="ghost" size="icon" onClick={() => onRemove(participant.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="font-semibold">Mood</Label>
          <ToggleGroup
            type="single"
            value={participant.mood}
            onValueChange={(mood) => {
              if (mood) onUpdate(participant.id, { mood });
            }}
            className="justify-start flex-wrap pt-2"
          >
            {moods.map(({ value, label }) => (
              <ToggleGroupItem key={value} value={value} aria-label={label}>
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <Label className="font-semibold">Genres (up to 3)</Label>
          <ToggleGroup
            type="multiple"
            value={participant.genres}
            onValueChange={(genres) => {
                if (genres.length <= 3) {
                    onUpdate(participant.id, { genres });
                }
            }}
            className="justify-start flex-wrap pt-2"
          >
            {allGenres.map((genre) => (
              <ToggleGroupItem key={genre} value={genre} aria-label={genre}>
                {genre}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <Label htmlFor={`vibe-${participant.id}`} className="font-semibold">Vibe (Optional)</Label>
          <Input
            id={`vibe-${participant.id}`}
            value={participant.vibe}
            onChange={(e) => onUpdate(participant.id, { vibe: e.target.value })}
            placeholder='e.g., "Lord of the Rings"'
          />
        </div>
      </CardContent>
    </Card>
  );
}


function Results({ movies }: { movies?: GroupMovieState['movies'] }) {
    const { pending } = useFormStatus();

    if (pending) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-0">
                            <Skeleton className="h-[450px] w-full" />
                        </CardContent>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                            <Skeleton className="h-4 w-full mt-1" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50">
            {movies.map((movie, index) => (
                <GroupMovieCard key={`${movie.title}-${index}`} movie={movie} />
            ))}
        </div>
    );
}
