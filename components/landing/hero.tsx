import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="container mx-auto flex flex-col items-center justify-center gap-6 py-24 text-center md:py-32">
      <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
        <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
        <span>サークル・学生団体のための会計アプリ</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        会計管理を、
        <br className="hidden sm:inline" />
        もっとスマートに。
      </h1>
      <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        Folioは、経費申請から承認、台帳管理までをひとつのアプリで完結させる
        新しい会計プラットフォームです。
        面倒なスプレッドシート管理から解放されましょう。
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/register">
          <Button size="lg" className="gap-2">
            無料で始める <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">
            ログイン
          </Button>
        </Link>
      </div>

      {/* Dashboard Screenshot */}
      <div className="mt-16 w-full max-w-5xl rounded-xl border bg-muted/50 p-2 shadow-2xl lg:p-4">
        <div className="overflow-hidden rounded-lg border bg-background">
          <Image
            src="/dashboard.png"
            alt="Folio Dashboard"
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
