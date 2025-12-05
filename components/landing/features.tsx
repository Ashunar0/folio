import { 
  Receipt, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Smartphone 
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "かんたん経費申請",
    description: "スマホでレシートを撮影して、金額を入力するだけ。面倒な経費精算が数秒で完了します。"
  },
  {
    icon: CheckCircle2,
    title: "スムーズな承認フロー",
    description: "申請内容は管理者に即座に通知。ワンタップで承認・差戻しができ、コミュニケーションコストを削減します。"
  },
  {
    icon: TrendingUp,
    title: "自動で台帳作成",
    description: "承認された経費は自動的に台帳に記録。カテゴリ別の支出分析や残高管理もリアルタイムで確認できます。"
  },
  {
    icon: Users,
    title: "チーム管理機能",
    description: "メンバーの招待や権限設定も簡単。サークルや学生団体など、複数人での運営に最適化されています。"
  },
  {
    icon: ShieldCheck,
    title: "安心のセキュリティ",
    description: "データは安全にクラウドに保存。端末の紛失や故障があっても、大切な会計データは守られます。"
  },
  {
    icon: Smartphone,
    title: "マルチデバイス対応",
    description: "PC、スマートフォン、タブレットなど、あらゆるデバイスから快適に利用できます。"
  }
];

export function LandingFeatures() {
  return (
    <section className="container mx-auto py-24 md:py-32 space-y-12">
      <div className="text-center space-y-4 max-w-[58rem] mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          会計業務に必要な機能を、<br />
          シンプルに凝縮。
        </h2>
        <p className="text-muted-foreground text-lg sm:text-xl">
          Folioは、専門知識がなくても直感的に使えるように設計されています。
          複雑な機能は省き、本当に必要な機能だけを厳選しました。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-start p-6 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
