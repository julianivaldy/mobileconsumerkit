
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import JudgeSelector from "./JudgeSelector";
import { IdeaScanData } from "./types";

interface IdeaScanFormProps {
  formData: IdeaScanData;
  loading: boolean;
  hasApiKey: boolean;
  onInputChange: (field: keyof IdeaScanData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const IdeaScanForm = ({ 
  formData, 
  loading, 
  hasApiKey, 
  onInputChange, 
  onSubmit 
}: IdeaScanFormProps) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Describe Your App Idea</CardTitle>
        <CardDescription>Describe your app to get feedback from industry experts.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idea">App Idea Description *</Label>
            <Textarea
              id="idea"
              placeholder="Describe your app idea in detail. What problem does it solve? How does it work?"
              value={formData.idea}
              onChange={(e) => onInputChange("idea", e.target.value)}
              className="min-h-[100px]"
              required
              disabled={!hasApiKey}
            />
          </div>

          <JudgeSelector
            value={formData.judge}
            onChange={(value) => onInputChange("judge", value)}
            disabled={!hasApiKey}
          />

          <Button type="submit" disabled={loading || !hasApiKey} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing Your Idea...
              </>
            ) : (
              "Get Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdeaScanForm;
