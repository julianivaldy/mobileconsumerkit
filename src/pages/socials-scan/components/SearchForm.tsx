import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// Form validation schema
const formSchema = z.object({
  usernames: z.array(z.string()).min(1, "At least one username is required"),
  trackingMode: z.enum(["relative", "absolute"]).default("relative"),
  customDays: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0 && num <= 365;
  }, "Days must be a number between 1 and 365").optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface SearchFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

// Function to extract username from TikTok URL
const extractUsernameFromUrl = (input: string): string => {
  // Remove whitespace
  const trimmed = input.trim();
  
  // Check if it's a TikTok URL
  const tiktokUrlPattern = /^https?:\/\/(?:www\.)?tiktok\.com\/@([^\/?\s]+)/i;
  const match = trimmed.match(tiktokUrlPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If not a URL, return as is (assume it's already a username)
  return trimmed;
};

export const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const [trackingMode, setTrackingMode] = useState<"relative" | "absolute">("relative");
  const [bulkInput, setBulkInput] = useState("");
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usernames: [],
      trackingMode: "relative",
      customDays: "7",
    }
  });

  const processBulkUsernames = () => {
    if (!bulkInput.trim()) return;
    
    // Split by newlines and filter out empty lines
    const rawInputs = bulkInput
      .split('\n')
      .map(input => input.trim())
      .filter(input => input !== "");
    
    if (rawInputs.length === 0) return;
    
    // Extract usernames from URLs or use as-is
    const newUsernames = rawInputs.map(input => extractUsernameFromUrl(input));
    
    const currentUsernames = form.getValues("usernames") || [];
    const uniqueNewUsernames = newUsernames.filter(
      username => !currentUsernames.includes(username)
    );
    
    if (uniqueNewUsernames.length === 0) {
      toast({
        title: "No new usernames",
        description: "All usernames have already been added to the list.",
        variant: "destructive",
      });
      return;
    }
    
    // Add unique usernames to the form
    form.setValue("usernames", [...currentUsernames, ...uniqueNewUsernames]);
    setBulkInput("");
    
    toast({
      title: "Usernames added",
      description: `Added ${uniqueNewUsernames.length} new username${uniqueNewUsernames.length > 1 ? 's' : ''} to the list.`,
    });
  };

  const removeUsername = (username: string) => {
    const currentUsernames = form.getValues("usernames");
    form.setValue("usernames", currentUsernames.filter(u => u !== username));
  };

  const goToSettings = () => {
    navigate("/settings");
  };

  const handleFormSubmit = async (data: FormValues) => {
    const apiToken = localStorage.getItem("apify_api_token");
    if (!apiToken) {
      toast({
        title: "API Token Required",
        description: "Please add your Apify API token in the settings page to use this feature.",
        variant: "destructive",
      });
      goToSettings();
      return;
    }
    
    onSubmit(data);
  };

  // Watch for tracking mode changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "trackingMode") {
        setTrackingMode(value.trackingMode as "relative" | "absolute");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="usernames"
          render={() => (
            <FormItem>
              <FormLabel>TikTok Usernames</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.getValues("usernames")?.map((username) => (
                  <Badge key={username} variant="secondary" className="flex items-center gap-1">
                    {username}
                    <button
                      type="button"
                      onClick={() => removeUsername(username)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2">
                <Textarea 
                  placeholder="Paste usernames or TikTok URLs separated by new lines"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={processBulkUsernames}
                  className="w-full sm:w-auto flex items-center justify-center gap-1"
                >
                  Add Usernames
                </Button>
              </div>
              
              {form.formState.errors.usernames && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {form.formState.errors.usernames.message}
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackingMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Mode</FormLabel>
              <FormControl>
                <Tabs 
                  defaultValue={field.value} 
                  className="w-full"
                  onValueChange={(value: "relative" | "absolute") => {
                    field.onChange(value);
                    form.setValue("startDate", undefined);
                    form.setValue("endDate", undefined);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="relative">Relative Days</TabsTrigger>
                    <TabsTrigger value="absolute">Specific Date Range</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {trackingMode === "relative" ? (
          <FormField
            control={form.control}
            name="customDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Days</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter number of days (1-365)" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate");
                          return date > new Date() || (startDate && date < startDate);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : "Analyze Performance"}
        </Button>
      </form>
    </Form>
  );
};

export default SearchForm;
