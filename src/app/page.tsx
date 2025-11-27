import { FeedGrid } from "@/components/feed/FeedGrid";
import { FilterSidebar } from "@/components/feed/FilterSidebar";
import { MobileFilterButton } from "@/components/feed/MobileFilterButton";
import { PopularTags } from "@/components/feed/PopularTags";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTags } from "@/lib/tags";

export default async function Home() {
  const groupedTags = await getTags();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-b">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Discover innovative code projects</h1>
          <p className="text-muted-foreground text-lg">
            A curated feed of projects, ranked by merit and community engagement.
          </p>
        </div>
        <Link href="/submit" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />
          Submit Project
        </Link>
      </section>

      <div className="flex gap-8">
        {/* Sidebar */}
        <FilterSidebar groupedTags={groupedTags} />
        
        {/* Main Feed */}
        <main className="flex-1 min-w-0">
          <FeedGrid />
        </main>

        {/* Right Sidebar (Popular Tags) - Desktop only */}
        <div className="hidden xl:block w-80 flex-shrink-0">
           <PopularTags />
        </div>
      </div>

      <MobileFilterButton groupedTags={groupedTags} />
    </div>
  );
}
