
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  apiKeyType: string;
  toolNames: string[];
}

const EmailVerificationDialog = ({
  open,
  onOpenChange,
  onVerified,
  apiKeyType,
  toolNames,
}: EmailVerificationDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://hook.eu2.make.com/wxg9xyotyv6j6duhrrpt95bdgrfsvn3x", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        mode: "no-cors",
        body: email,
      });

      // Since we're using no-cors, we assume success if no error is thrown
      setIsVerified(true);
      
      toast({
        title: "Email Saved Successfully",
        description: `Your email (${email}) has been saved for updates.`,
      });

      // Auto-proceed after showing success
      setTimeout(() => {
        onVerified();
        setIsVerified(false);
        setEmail("");
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      setIsVerified(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get full access</DialogTitle>
          <DialogDescription>
            To grant you full access to the tools, you need to add your email so I can send you updates about the tools. You can unsubscribe at any time, and rest assured—your API keys are never stored.
          </DialogDescription>
        </DialogHeader>

        {isVerified ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-center text-green-600 font-medium">
              Email saved successfully!
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Saving your API key...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-email">Email Address</Label>
              <Input
                id="verification-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationDialog;
