import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-zinc-800/50", className)}
            {...props}
        />
    )
}

function CardSkeleton() {
    return (
        <div className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-3 border-t border-zinc-700/50 flex justify-between items-center">
                <Skeleton className="h-7 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {/* Table Header */}
            <div className="flex gap-4 pb-3 border-b border-zinc-700">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3 border-b border-zinc-700/50">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                </div>
            ))}
        </div>
    )
}

function FormSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
        </div>
    )
}

function ListingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <Skeleton className="h-3 w-24 mb-2 mx-auto" />
                    <Skeleton className="h-8 w-16 mx-auto" />
                </div>
            ))}
        </div>
    )
}

export { Skeleton, CardSkeleton, TableSkeleton, FormSkeleton, ListingSkeleton, StatsSkeleton }
