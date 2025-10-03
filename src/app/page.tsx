import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndividualMode from '@/components/individual-mode';
import GroupMode from '@/components/group-mode';

export default function Home() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
          Find Your Next Movie Night
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Whether you're flying solo or syncing with your crew, let our AI find the perfect movie for your vibe.
        </p>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12">
          <TabsTrigger value="individual" className="h-10 text-base">Solo Sync</TabsTrigger>
          <TabsTrigger value="group" className="h-10 text-base">Group Sync</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="mt-6">
          <IndividualMode />
        </TabsContent>
        <TabsContent value="group" className="mt-6">
          <GroupMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}
