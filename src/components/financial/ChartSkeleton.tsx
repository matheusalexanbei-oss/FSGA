'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartSkeletonProps {
  title?: string
  description?: string
}

export function ChartSkeleton({ title, description }: ChartSkeletonProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          {description && <Skeleton className="h-4 w-64 mt-2" />}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

