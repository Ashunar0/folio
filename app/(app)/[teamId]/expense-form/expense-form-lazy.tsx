"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

const ExpenseFormClient = dynamic(() => import("./client"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center">
      <Spinner className="h-5 w-5" />
    </div>
  ),
});

export default function ExpenseFormLazy() {
  return <ExpenseFormClient />;
}
