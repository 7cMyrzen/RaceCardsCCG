"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AccountCreated() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] w-full h-full p-4 flex items-end justify-start pointer-events-none">
      <div className="max-w-xl w-full pointer-events-auto">
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Succès !</AlertTitle>
          <AlertDescription>
            Votre compte a été créé avec succès.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
