import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import { AutomationConfig, AutomationTrigger, TriggerCondition } from '../services/standardizedAutomationEngine';

interface AutomationFlowConfigProps {
  config: AutomationConfig;
  onConfigChange: (config: AutomationConfig) => void;
}

const AutomationFlowConfig: React.FC<AutomationFlowConfigProps> = ({
  config,
  onConfigChange
}) => {
  // --- MultipleComment (NEW STATE) ---
  const [newTrigger, setNewTrigger] = useState<Partial<AutomationTrigger> & { commentTexts?: string[], commentMode?: 'manual' | 'ai' }>({
    name: '',
    action: 'like',
    commentMode: 'manual',
    conditions: [],
    enabled: true,
    commentTexts: ['']
  });

  // --- INTERVAL SKIP & DELAY STATE ---
  const [skipPostsMin, setSkipPostsMin] = useState(config.skipPostsCountMin ?? (config.skipPostsCount ?? 1));
  const [skipPostsMax, setSkipPostsMax] = useState(config.skipPostsCountMax ?? (config.skipPostsCount ?? 1));

  useEffect(() => {
    setSkipPostsMin(config.skipPostsCountMin ?? (config.skipPostsCount ?? 1));
    setSkipPostsMax(config.skipPostsCountMax ?? (config.skipPostsCount ?? 1));
  }, [config.skipPostsCountMin, config.skipPostsCountMax, config.skipPostsCount]);

  const handleSkipPostsMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = Math.max(1, parseInt(e.target.value) || 1);
    setSkipPostsMin(min);
    const max = Math.max(min, skipPostsMax);
    setSkipPostsMax(max);
    onConfigChange({
      ...config,
      skipPostsCountMin: min,
      skipPostsCountMax: max,
    });
  };

  const handleSkipPostsMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = Math.max(skipPostsMin, parseInt(e.target.value) || skipPostsMin);
    setSkipPostsMax(max);
    onConfigChange({
      ...config,
      skipPostsCountMin: skipPostsMin,
      skipPostsCountMax: max,
    });
  };
  // --- END SKIP/DELAY UI ---

  const updateConfig = (updates: Partial<AutomationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const addTrigger = () => {
    if (!newTrigger.name || !newTrigger.conditions?.length) return;

    // Migrate support for both single and multiple text
    let commentTexts: string[] | undefined = undefined;
    if (newTrigger.action === 'comment' && newTrigger.commentMode !== 'ai') {
      // if user hasn't entered anything, don't allow creation
      commentTexts = (newTrigger.commentTexts || []).map(t => t.trim()).filter(Boolean);
      if (!commentTexts.length) return;
    }

    const trigger: AutomationTrigger = {
      id: Date.now().toString(),
      name: newTrigger.name,
      action: newTrigger.action as 'like' | 'comment' | 'save',
      // Only include relevant properties for comment triggers
      ...(newTrigger.action === 'comment'
        ? {
          commentMode: newTrigger.commentMode || 'manual',
          ...(newTrigger.commentMode !== 'ai' ? { commentTexts } : {})
        }
        : {}),
      commentText: undefined, // always prefer new style
      conditions: newTrigger.conditions,
      enabled: true
    };

    updateConfig({
      triggers: [...config.triggers, trigger]
    });

    // Reset form
    setNewTrigger({
      name: '',
      action: 'like',
      commentMode: 'manual',
      conditions: [],
      enabled: true,
      commentTexts: ['']
    });
  };

  const removeTrigger = (triggerId: string) => {
    updateConfig({
      triggers: config.triggers.filter(t => t.id !== triggerId)
    });
  };

  const toggleTrigger = (triggerId: string) => {
    updateConfig({
      triggers: config.triggers.map(t => 
        t.id === triggerId ? { ...t, enabled: !t.enabled } : t
      )
    });
  };

  const addCondition = () => {
    setNewTrigger({
      ...newTrigger,
      conditions: [
        ...(newTrigger.conditions || []),
        { type: 'ocr_contains', value: '' }
      ]
    });
  };

  const updateCondition = (index: number, updates: Partial<TriggerCondition>) => {
    const conditions = [...(newTrigger.conditions || [])];
    conditions[index] = { ...conditions[index], ...updates };
    setNewTrigger({ ...newTrigger, conditions });
  };

  const removeCondition = (index: number) => {
    setNewTrigger({
      ...newTrigger,
      conditions: newTrigger.conditions?.filter((_, i) => i !== index) || []
    });
  };

  const getConditionTypeLabel = (type: string) => {
    switch (type) {
      case 'ocr_contains':
        return 'Video Contains';
      case 'description_contains':
        return 'Description Contains';
      default:
        return type;
    }
  };

  // --- AI comment generation state & function ---
  const [generatingComment, setGeneratingComment] = useState(false);

  // Helper to call OpenAI ChatGPT for a comment suggestion
  const generateCommentAIForLast = async () => {
    setGeneratingComment(true);
    const videoContext = "This is a TikTok video; describe and generate a relevant comment.";
    const templates = (newTrigger.commentTexts || []).filter(Boolean);

    try {
      const apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        alert("Please set your OpenAI API key in Settings first.");
        setGeneratingComment(false);
        return;
      }
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: "Generate a short, authentic, under 100 character TikTok comment for this video context. Use the provided templates for inspiration, but rephrase or mix up as needed.",
            },
            {
              role: 'user',
              content: `Video context: ${videoContext}
Comment templates: ${templates.join(' | ')}`
            }
          ],
          temperature: 0.8,
          max_tokens: 100
        })
      });
      if (!response.ok) throw new Error(await response.text());
      let suggestion = (await response.json()).choices[0]?.message?.content || '';
      suggestion = suggestion.trim();
      // Sanitize: Remove surrounding quotes if present
      if (suggestion.startsWith('"') && suggestion.endsWith('"') && suggestion.length > 1) {
        suggestion = suggestion.slice(1, -1).trim();
      }
      // If suggestion is empty or looks like an error/apology, fallback to generic comment
      if (
        !suggestion ||
        suggestion.toLowerCase().includes('sorry') ||
        suggestion.toLowerCase().includes('no context') ||
        suggestion.toLowerCase().match(/need (more )?context/i) ||
        suggestion.length === 0
      ) {
        suggestion = "Cool!";
      }
      if (suggestion) {
        // Fill last input
        const arr = [...(newTrigger.commentTexts || [])];
        const lastIdx = arr.length - 1;
        arr[lastIdx] = suggestion;
        setNewTrigger({ ...newTrigger, commentTexts: arr });
      }
    } catch (err) {
      // fallback to safe generic
      const arr = [...(newTrigger.commentTexts || [])];
      const lastIdx = arr.length - 1;
      arr[lastIdx] = "Cool!";
      setNewTrigger({ ...newTrigger, commentTexts: arr });
    }
    setGeneratingComment(false);
  };

  // --- NEW: Info for comment modes ---
  const commentModeInfo = {
    manual: "Write the message you would like to be sent, and they will be sent randomly",
    ai: "Unique comment will be automatically generated for each video using OpenAI."
  };

  // --- Multiple Comment Template: UI handlers ---
  const handleCommentTextChange = (idx: number, value: string) => {
    const arr = [...(newTrigger.commentTexts || [])];
    arr[idx] = value;
    setNewTrigger({ ...newTrigger, commentTexts: arr });
  };
  const handleAddCommentText = () => {
    setNewTrigger({ ...newTrigger, commentTexts: [...(newTrigger.commentTexts || []), ''] });
  };
  const handleRemoveCommentText = (idx: number) => {
    let arr = [...(newTrigger.commentTexts || [])];
    arr.splice(idx, 1);
    if (arr.length === 0) arr = [''];
    setNewTrigger({ ...newTrigger, commentTexts: arr });
  };

  // --- Normalize triggers for display (supporting mode) ---
  const getDisplayTemplates = (trigger: AutomationTrigger) => {
    if (Array.isArray((trigger as any).commentTexts)) {
      return ((trigger as any).commentTexts as string[]).filter(Boolean);
    }
    if (trigger.commentText) {
      return [trigger.commentText];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            Automation settings
          </CardTitle>
          <CardDescription>
            Setup the basic automation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skip-posts">Set the post interval for interaction</Label>
              {/* --- INTERVAL INPUT (min/max) --- */}
              <div className="flex gap-2">
                <Input
                  id="skip-posts-min"
                  type="number"
                  min={1}
                  max={skipPostsMax}
                  value={skipPostsMin}
                  onChange={handleSkipPostsMin}
                  placeholder="Min"
                />
                <Input
                  id="skip-posts-max"
                  type="number"
                  min={skipPostsMin}
                  value={skipPostsMax}
                  onChange={handleSkipPostsMax}
                  placeholder="Max"
                />
              </div>
              {/* Removed OCR helper text */}
            </div>
            <div>
              <Label>Set the scroll delay for interaction</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={config.scrollIntervalMin}
                  onChange={(e) => updateConfig({ scrollIntervalMin: parseInt(e.target.value) || 1 })}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={config.scrollIntervalMax}
                  onChange={(e) => updateConfig({ scrollIntervalMax: parseInt(e.target.value) || 5 })}
                  placeholder="Max"
                />
              </div>
              {/* Removed delay randomness helper text */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Actions (Create New Trigger) */}
      <Card>
        <CardHeader>
          <CardTitle>Automation actions</CardTitle>
          <CardDescription>
            Define automation actions and associated triggers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trigger-name">Automation name</Label>
              <Input
                id="trigger-name"
                value={newTrigger.name || ''}
                onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                placeholder="e.g., Dancing Videos"
              />
            </div>
            <div>
              <Label htmlFor="trigger-action">Action</Label>
              <Select
                value={newTrigger.action}
                onValueChange={(value) => {
                  setNewTrigger({
                    ...newTrigger,
                    action: value as any,
                    ...(value === 'comment'
                      ? {
                        commentTexts: newTrigger.commentTexts?.length ? newTrigger.commentTexts : [''],
                        commentMode: newTrigger.commentMode || 'manual',
                      }
                      : {
                        commentTexts: undefined,
                        commentMode: undefined,
                      })
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="like">Like</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="save">Save</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mode Toggle - only for comment action */}
          {newTrigger.action === 'comment' && (
            <div className="my-2 flex flex-col gap-2">
              {/* The actual mode toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  className={`rounded-l font-medium px-3 ${newTrigger.commentMode === 'manual' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTrigger({ ...newTrigger, commentMode: 'manual' })}
                >
                  Write custom comments
                </Button>
                <Button
                  type="button"
                  className={`rounded-r font-medium px-3 ${newTrigger.commentMode === 'ai' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTrigger({ ...newTrigger, commentMode: 'ai' })}
                >
                  AI-Generated Comments
                </Button>
              </div>
              {/* Mode info below toggle */}
              <div className="text-xs text-muted-foreground mt-2">
                {commentModeInfo[newTrigger.commentMode || "manual"]}
              </div>
            </div>
          )}

          {/* Extra space between the toggle and "Template messages" */}
          {newTrigger.action === 'comment' && newTrigger.commentMode === 'manual' && (
            <>
              <div className="mt-6" />
              <Label>
                Template messages
              </Label>
              <div className="space-y-2">
                {(newTrigger.commentTexts || ['']).map((text, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={text}
                      onChange={e => handleCommentTextChange(idx, e.target.value)}
                      placeholder={`Message ${idx + 1}`}
                      className="flex-1"
                      data-testid={`comment-message-input-${idx}`}
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveCommentText(idx)}
                      size="sm"
                      variant="outline"
                      disabled={(newTrigger.commentTexts?.length ?? 1) === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    onClick={generateCommentAIForLast}
                    size="sm"
                    variant="ghost"
                    style={{ backgroundColor: 'black', color: 'white' }}
                    className="hover:bg-gray-900 focus:bg-black active:bg-black text-white px-3"
                    disabled={generatingComment}
                  >
                    <span className="text-xs text-white">
                      {generatingComment ? "Generating..." : "Generate comment with AI"}
                    </span>
                  </Button>
                  <Button type="button" onClick={handleAddCommentText} size="sm" variant="secondary">
                    <Plus className="h-4 w-4 mr-1" />
                    Add comment text
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Conditions */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Trigger Conditions</Label>
              <Button onClick={addCondition} size="sm" variant="outline" type="button">
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>
            
            {newTrigger.conditions?.map((condition, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <Select
                    value={condition.type}
                    onValueChange={(value) =>
                      updateCondition(index, { type: value as any })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ocr_contains">Video Contains</SelectItem>
                      <SelectItem value="description_contains">Description Contains</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(index, { value: e.target.value })
                    }
                    placeholder={
                      condition.type === 'ocr_contains'
                        ? "Describe video content (e.g., dancing, cooking, girl)..."
                        : "Enter text to match in description..."
                    }
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeCondition(index)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={addTrigger} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Trigger
          </Button>
        </CardContent>
      </Card>

      {/* Active Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Active automations ({config.triggers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {config.triggers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No triggers created yet. Create your first trigger above.
            </p>
          ) : (
            <div className="space-y-3">
              {config.triggers.map((trigger) => (
                <div key={trigger.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{trigger.name}</h4>
                        <Badge variant={trigger.enabled ? "default" : "secondary"}>
                          {trigger.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge variant="outline">{trigger.action}</Badge>
                        {/* If comment trigger with mode, show mode */}
                        {trigger.action === 'comment' && (
                          <Badge variant="secondary" className="ml-1">
                            {trigger.commentMode === 'ai' ? 'AI' : 'Manual'}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        {trigger.conditions.map((condition, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {getConditionTypeLabel(condition.type)}: "{condition.value}"
                          </div>
                        ))}
                      </div>
                      {/* Display comment templates for comment actions & manual mode */}
                      {trigger.action === 'comment'
                        && trigger.commentMode !== 'ai'
                        && getDisplayTemplates(trigger).length > 0 && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          Comment templates: {getDisplayTemplates(trigger).map((t, i) =>
                            <span key={i} className="inline-block bg-muted px-1 rounded mr-1">{JSON.stringify(t)}</span>
                          )}
                        </div>
                      )}
                      {/* Show explanation for AI mode */}
                      {trigger.action === 'comment' && trigger.commentMode === 'ai' && (
                        <div className="mt-1 text-xs text-blue-700">
                          Comments will be generated using AI for each post.
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Switch
                        checked={trigger.enabled}
                        onCheckedChange={() => toggleTrigger(trigger.id)}
                      />
                      <Button
                        onClick={() => removeTrigger(trigger.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationFlowConfig;
