
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import EmailSubscription from './EmailSubscription';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  showEmailField: boolean;
  showSuccessMessage: boolean;
  email: string;
  isSubmitting: boolean;
  onEmailSubmit: (e: React.FormEvent) => void;
  onEmailChange: (email: string) => void;
  onSubscribe: () => void;
}

const mobileLinks = [
  {
    href: "https://www.linkedin.com/in/julianivaldy/",
    src: "/uploads/ac3b60b9-4a44-443e-823b-4845ff625df7.png",
    alt: "LinkedIn",
    label: "LinkedIn"
  },
  {
    href: "https://julianivaldy.substack.com/",
    src: "/uploads/642d171c-7d25-4d61-b0c9-66e70a4da6a3.png",
    alt: "Substack",
    label: "Substack"
  },
  {
    href: "https://x.com/julianivaldy",
    src: "/uploads/0b8a1c66-2e82-4779-b3a2-e9a79f21ecdb.png",
    alt: "X",
    label: "X"
  },
  {
    href: "https://julianivaldy.medium.com/",
    src: "/uploads/38611089-37dc-41e8-b345-200b47fa1277.png",
    alt: "Medium",
    label: "Medium"
  }
];

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  showEmailField,
  showSuccessMessage,
  email,
  isSubmitting,
  onEmailSubmit,
  onEmailChange,
  onSubscribe
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden">
        <div className="p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {mobileLinks.map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={onClose}
              >
                <img 
                  src={link.src} 
                  alt={link.alt} 
                  width={36} 
                  height={36} 
                  style={{ borderRadius: '4px' }} 
                />
                <span className="text-gray-700 font-medium">{link.label}</span>
              </a>
            ))}
          </div>

          {showSuccessMessage ? (
            <Button 
              className="w-full bg-gray-500 text-white cursor-default"
              disabled
            >
              Successfully Subscribed!
            </Button>
          ) : showEmailField ? (
            <form onSubmit={onEmailSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus-ring-blue-500"
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          ) : (
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={onSubscribe}
            >
              Subscribe by Email
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
