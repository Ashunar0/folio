import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
