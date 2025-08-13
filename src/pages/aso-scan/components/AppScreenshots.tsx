
import React from "react";
import { Download, Figma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AppScreenshotsProps {
  screenshots: string[];
}

const AppScreenshots = ({ screenshots }: AppScreenshotsProps) => {
  const { toast } = useToast();

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `screenshot-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Success",
        description: `Screenshot ${index + 1} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download screenshot",
        variant: "destructive",
      });
    }
  };

  const handleExportToFigma = (imageUrl: string, index: number) => {
    window.open('https://www.figma.com/file/new', '_blank');
    
    toast({
      title: "Info",
      description: "Figma opened in a new tab. You can now import the screenshot.",
    });
  };

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold mb-3 text-left">App Screenshots</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="relative aspect-[9/16] rounded-lg overflow-hidden shadow-md">
              <img
                src={screenshot}
                alt={`App Screenshot ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleDownload(screenshot, index)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Screenshot
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleExportToFigma(screenshot, index)}
            >
              <Figma className="mr-2 h-4 w-4" />
              Export to Figma
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppScreenshots;
