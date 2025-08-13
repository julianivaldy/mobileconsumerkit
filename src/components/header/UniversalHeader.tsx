import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import HeaderContent from './HeaderContent';
import MobileSidebar from './MobileSidebar';

const UniversalHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = () => {
    setShowEmailField(true);
    setShowSuccessMessage(false);
    setIsMenuOpen(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("https://hook.eu2.make.com/wxg9xyotyv6j6duhrrpt95bdgrfsvn3x", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        mode: "no-cors",
        body: email,
      });

      toast({
        title: "Success!",
        description: "Thank you for subscribing! You'll receive email updates soon.",
      });
      
      setEmail("");
      setShowEmailField(false);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error sending webhook:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
  };

  return (
    <>
      <HeaderContent
        showEmailField={showEmailField}
        showSuccessMessage={showSuccessMessage}
        email={email}
        isSubmitting={isSubmitting}
        onEmailSubmit={handleEmailSubmit}
        onEmailChange={handleEmailChange}
        onSubscribe={handleSubscribe}
        onMenuToggle={toggleMenu}
      />
      
      <MobileSidebar
        isOpen={isMenuOpen}
        onClose={closeMenu}
        showEmailField={showEmailField}
        showSuccessMessage={showSuccessMessage}
        email={email}
        isSubmitting={isSubmitting}
        onEmailSubmit={handleEmailSubmit}
        onEmailChange={handleEmailChange}
        onSubscribe={handleSubscribe}
      />
    </>
  );
};

export default UniversalHeader;
