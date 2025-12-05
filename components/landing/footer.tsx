import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-bold">Folio</h4>
            <p className="text-sm text-muted-foreground">
              サークル・学生団体のための
              <br />
              モダンな会計管理プラットフォーム
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">プロダクト</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  機能一覧
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  導入事例
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">サポート</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">開発者</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/Ashunar0"
                  target="_blank"
                  className="hover:text-foreground"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/aka_dev_ex"
                  className="hover:text-foreground"
                >
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Folio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
