import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-12 text-center">
          <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Page Under Construction
          </h2>
          <p className="text-muted-foreground mb-6">
            This page is currently being developed. Please continue prompting to
            have me implement the specific features you need for this section.
          </p>
          <Button variant="outline">Request Implementation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
