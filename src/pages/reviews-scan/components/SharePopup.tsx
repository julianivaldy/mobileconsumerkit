
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ isOpen, onClose, url }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "The link has been copied to your clipboard.",
      duration: 3000,
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaEmail = () => {
    window.open(`mailto:?subject=Check out this site&body=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this page</DialogTitle>
          <DialogDescription>
            Choose how you'd like to share this page
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm text-gray-600 truncate">{url}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className={copied ? "bg-green-100" : ""}
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </div>
        <div className="flex justify-center space-x-4 py-4">
          <Button variant="outline" size="icon" className="rounded-full bg-green-500 hover:bg-green-600" onClick={shareViaEmail}>
            <Mail className="h-5 w-5 text-white" />
            <span className="sr-only">Email</span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full p-1 overflow-hidden" onClick={shareViaLinkedIn}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/LinkedIn_icon_circle.svg/1024px-LinkedIn_icon_circle.svg.png" 
              alt="LinkedIn" 
              className="h-full w-full object-cover" 
            />
            <span className="sr-only">LinkedIn</span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full p-0 overflow-hidden bg-black hover:bg-black/90" onClick={shareViaTwitter}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png" 
              alt="X (Twitter)" 
              className="h-full w-full object-contain p-2" 
            />
            <span className="sr-only">X (Twitter)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePopup;
