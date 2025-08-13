
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const PageHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <button 
        onClick={() => navigate("/")}
        className="flex items-center text-black hover:text-gray-700 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>
      
      <div className="text-left space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Idea Scan</h1>
        <p className="text-xl text-muted-foreground">Get feedback from industry experts on your app idea.</p>
      </div>
    </>
  );
};

export default PageHeader;
