import { Clapperboard } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Clapperboard className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline tracking-tight">
            CineSync
          </span>
        </Link>
      </div>
    </header>
  );
}
