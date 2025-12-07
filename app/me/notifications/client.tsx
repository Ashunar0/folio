"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationsClient() {
  const digestFrequencies = [
    { id: "realtime", name: "Real-time" },
    { id: "daily", name: "Daily digest" },
    { id: "weekly", name: "Weekly digest" },
    { id: "never", name: "Never" },
  ];

  // Email notification states
  const [emailExpenseApproved, setEmailExpenseApproved] = useState(true);
  const [emailExpenseRejected, setEmailExpenseRejected] = useState(true);
  const [emailNewExpense, setEmailNewExpense] = useState(true);
  const [emailDigest, setEmailDigest] = useState("daily");

  return (
    <div className="w-full max-w-3xl space-y-10">
      {/* Section 1: Email Notifications */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Mail size={18} />
          Email Notifications
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Expense Approved */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Expense approved</div>
                <div className="text-xs text-muted-foreground">
                  Receive an email when your expense is approved
                </div>
              </div>
              <Switch
                checked={emailExpenseApproved}
                onCheckedChange={setEmailExpenseApproved}
              />
            </div>
            <Separator />

            {/* Expense Rejected */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Expense rejected</div>
                <div className="text-xs text-muted-foreground">
                  Receive an email when your expense is rejected
                </div>
              </div>
              <Switch
                checked={emailExpenseRejected}
                onCheckedChange={setEmailExpenseRejected}
              />
            </div>
            <Separator />

            {/* New Expense Submitted (for managers) */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">New expense submitted</div>
                <div className="text-xs text-muted-foreground">
                  Receive an email when a team member submits an expense
                </div>
              </div>
              <Switch
                checked={emailNewExpense}
                onCheckedChange={setEmailNewExpense}
              />
            </div>
            <Separator />

            {/* Email Digest Frequency */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Email digest</div>
                <div className="text-xs text-muted-foreground">
                  How often to receive summary emails
                </div>
              </div>
              <Select value={emailDigest} onValueChange={setEmailDigest}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {digestFrequencies.map((freq) => (
                    <SelectItem key={freq.id} value={freq.id}>
                      {freq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
