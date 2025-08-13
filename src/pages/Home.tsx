
import React from "react";
import ToolsList from "@/components/home/ToolsList";
import { useToolsData } from "@/data/tools";
import { Settings, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const tools = useToolsData();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-4xl font-bold text-foreground text-left">All tools</h1>
            <Badge variant="secondary" className="text-sm w-fit">
              Mobile Consumer Kit
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open source on GitHub"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Open source</span>
            </a>
            <Link 
              to="/settings"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <ToolsList tools={tools} />
      </div>
    </div>
  );
};

export default Home;
