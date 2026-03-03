import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Seite nicht gefunden</CardTitle>
          <CardDescription>Die angeforderte Route existiert nicht.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Zur Startseite</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
