
import React from 'react';
import { Link } from "react-router-dom";
import { Tool } from '@/data/tools';
import { Badge } from '@/components/ui/badge';

interface ToolsListProps {
  tools: Tool[];
}

const ToolsList: React.FC<ToolsListProps> = ({ tools }) => {
  return (
    <div className="space-y-4">
      {tools.map((tool) => (
        <div key={tool.id} className="flex items-start">
          <span className="text-foreground mr-3 mt-1">•</span>
          <Link 
            to={tool.link}
            className="block flex-1"
          >
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-foreground text-left">{tool.name}</h2>
              {tool.beta && (
                <Badge variant="secondary" className="text-xs">
                  BETA
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm text-left">{tool.description}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ToolsList;
