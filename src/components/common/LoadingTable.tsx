import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingTable() {
  return (
    <Card className="overflow-hidden">
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
      />
      <CardHeader className="space-y-3 pb-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-7 w-56 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-xl" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}
