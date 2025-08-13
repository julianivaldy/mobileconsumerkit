
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import SocialLinks from './SocialLinks';
import EmailSubscription from './EmailSubscription';

interface HeaderContentProps {
  showEmailField: boolean;
  showSuccessMessage: boolean;
  email: string;
  isSubmitting: boolean;
  onEmailSubmit: (e: React.FormEvent) => void;
  onEmailChange: (email: string) => void;
  onSubscribe: () => void;
  onMenuToggle: () => void;
}

const HeaderContent: React.FC<HeaderContentProps> = ({
  showEmailField,
  showSuccessMessage,
  email,
  isSubmitting,
  onEmailSubmit,
  onEmailChange,
  onSubscribe,
  onMenuToggle
}) => {
  return (
    <section className="border-b border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 md:gap-3">
          {/* Top Row: Name and Badge */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl sm:text-4xl font-bold text-black font-sans">Julian Ivaldy</span>
            <span className="bg-green-500 text-white text-sm tracking-wide px-3 py-1 rounded-full font-semibold">
              Open tools
            </span>
          </div>
          
          {/* Bottom Row: Subtitle + Right Block */}
          <div className="flex flex-row items-center justify-between w-full">
            <div className="space-y-1 text-sm sm:text-base text-gray-600 font-normal tracking-wide text-left flex-1">
              <p>Marketing tactics for consumer apps.</p>
              <p>
                Co-Founder & Partner @{' '}
                <a 
                  href="https://jointhequest.co/?utm_source=ju&utm_medium=blog&utm_campaign=blog&utm_id=ju" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-medium tracking-wide"
                >
                  THE QUEST
                </a>
                .
              </p>
            </div>
            
            {/* Right block: subscribe + icons (desktop), hamburger (mobile) */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              <EmailSubscription
                showEmailField={showEmailField}
                showSuccessMessage={showSuccessMessage}
                email={email}
                isSubmitting={isSubmitting}
                onEmailSubmit={onEmailSubmit}
                onEmailChange={onEmailChange}
                onSubscribe={onSubscribe}
              />
              <SocialLinks />
            </div>
            
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-gray-700 focus:outline-none ml-4 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Writings / Tools Selector (in articles section) */}
        <div className="mt-8 flex gap-2 items-center">
          <a
            href="https://julianivaldy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-base tracking-wide px-4 py-1 rounded-full font-semibold transition-colors duration-200"
          >
            Writings
          </a>
          <span className="flex items-center bg-gray-500 text-white text-base tracking-wide px-4 py-1 rounded-full font-semibold cursor-default">
            Tools
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeaderContent;
