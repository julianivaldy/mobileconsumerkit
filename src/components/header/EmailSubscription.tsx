
import React from 'react';
import { Button } from "@/components/ui/button";

interface EmailSubscriptionProps {
  showEmailField: boolean;
  showSuccessMessage: boolean;
  email: string;
  isSubmitting: boolean;
  onEmailSubmit: (e: React.FormEvent) => void;
  onEmailChange: (email: string) => void;
  onSubscribe: () => void;
}

const EmailSubscription: React.FC<EmailSubscriptionProps> = ({
  showEmailField,
  showSuccessMessage,
  email,
  isSubmitting,
  onEmailSubmit,
  onEmailChange,
  onSubscribe
}) => {
  if (showSuccessMessage) {
    return (
      <Button 
        className="bg-gray-500 text-white px-6 rounded-md cursor-default"
        disabled
      >
        Successfully Subscribed!
      </Button>
    );
  }

  if (showEmailField) {
    return (
      <form onSubmit={onEmailSubmit} className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter your email"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={isSubmitting}
        />
        <Button 
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 rounded-md text-sm font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <Button 
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-md text-sm font-bold"
      onClick={onSubscribe}
    >
      Subscribe by Email
    </Button>
  );
};

export default EmailSubscription;
