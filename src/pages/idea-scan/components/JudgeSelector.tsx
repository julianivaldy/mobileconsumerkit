
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { judgeProfiles } from "./judgeData";

interface JudgeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const JudgeSelector = ({ value, onChange, disabled }: JudgeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="judge">Choose Judge Perspective</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <span>All Judges (Balanced View)</span>
            </div>
          </SelectItem>
          <SelectItem value="blake">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={judgeProfiles.blake.image} 
                  alt="Blake Anderson"
                  className="object-cover object-center" 
                />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <span>Blake Anderson (Product-Market Fit & Virality)</span>
            </div>
          </SelectItem>
          <SelectItem value="nikita">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={judgeProfiles.nikita.image} 
                  alt="Nikita Bier"
                  className="object-cover object-center" 
                />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <span>Nikita Bier (Growth & Viral Mechanics)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default JudgeSelector;
