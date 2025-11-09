import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  expectedCode: string;
  onAccessGranted: () => void;
  children?: React.ReactNode; // To show teaser content
}

export const AccessCodeForm: React.FC<Props> = ({ expectedCode, onAccessGranted, children }) => {
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (enteredCode.length !== 6 || !/^\d{6}$/.test(enteredCode)) {
      setError("Please enter a 6-digit code.");
      toast.error("Invalid input", { description: "Please enter a 6-digit code." });
      return;
    }

    if (enteredCode === expectedCode) {
      toast.success("Access Granted!");
      onAccessGranted();
    } else {
      setError("Invalid access code. Please try again.");
      toast.error("Access Denied", { description: "Invalid access code. Please try again." });
      setEnteredCode(""); // Clear input on error
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Enter Access Code</h2>
          <p className="text-sm text-gray-600">
            Please enter the 6-digit code to access this section.
          </p>
        </div>
        {children && <div className="my-4 p-4 border rounded-md bg-gray-50">{children}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="access-code" className="sr-only">
              Access Code
            </Label>
            <Input
              id="access-code"
              type="text"
              inputMode="numeric"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="text-center tracking-[0.3em]"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full">
            Unlock Access
          </Button>
        </form>
      </div>
    </div>
  );
};
