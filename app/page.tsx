import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <div className="flex flex-col gap-3 mt-6 items-center">
        <Link href="/login">
          <Button>Go to login</Button>
        </Link>
        <Link
          href="/test/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Test login (for QA)
        </Link>
      </div>
    </div>
  );
}
