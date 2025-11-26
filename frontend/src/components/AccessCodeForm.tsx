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

    if (!enteredCode || enteredCode.trim() === "") {
      setError("Please enter an access code.");
      toast.error("Invalid input", { description: "Please enter an access code." });
      return;
    }

    // Case-insensitive comparison
    if (enteredCode.toUpperCase() === expectedCode.toUpperCase()) {
      toast.success("Access Granted!");
      onAccessGranted();
    } else {
      setError("Invalid access code. Please try again.");
      toast.error("Access Denied", { description: "Invalid access code. Please try again." });
      setEnteredCode(""); // Clear input on error
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 space-y-8">
      {/* Preview Content - Rendered OUTSIDE the access code box */}
      {children && (
        <div className="w-full max-w-4xl">
          {children}
        </div>
      )}

      {/* Access Code Input Box - Clean and Focused */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border-2 border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Enter Access Code</h2>
          <p className="text-sm text-gray-600 mt-2">
            Please enter your access code to unlock this section.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="access-code" className="sr-only">
              Access Code
            </Label>
            <Input
              id="access-code"
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
              maxLength={20}
              placeholder="ENTER ACCESS CODE (E.G., FIREDEMO)"
              className="text-center tracking-wider uppercase text-lg font-semibold py-6"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
          <Button type="submit" className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            🔓 Unlock Access
          </Button>
        </form>
      </div>
    </div>
  );
};
