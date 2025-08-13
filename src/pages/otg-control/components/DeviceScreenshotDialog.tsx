
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveIcon } from "lucide-react";

interface DeviceScreenshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screenshot: string | null;
  deviceName: string;
  initialCoords: { [K in "like" | "comment" | "save"]: { x: number; y: number } };
  onSave: (coords: { [K in "like" | "comment" | "save"]: { x: number; y: number } }) => void;
}

const actionLabels = {
  like: "❤️ Like",
  comment: "💬 Comment",
  save: "🔖 Save",
};

const actionColors: Record<"like" | "comment" | "save", string> = {
  like: "bg-pink-600 border-white",
  comment: "bg-blue-500 border-white",
  save: "bg-yellow-500 border-white",
};

const DeviceScreenshotDialog: React.FC<DeviceScreenshotDialogProps> = ({
  open,
  onOpenChange,
  screenshot,
  deviceName,
  initialCoords,
  onSave,
}) => {
  const [activeAction, setActiveAction] = useState<"like" | "comment" | "save">("like");
  const [coords, setCoords] = useState(initialCoords);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (open) {
      setCoords(initialCoords);
      setPointer(null);
      setActiveAction("like");
    }
  }, [open, initialCoords]);

  const handleImgClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    setPointer({ x, y });
    // Set only for active action:
    setCoords((prev) => ({
      ...prev,
      [activeAction]: { x, y },
    }));
  };

  const handleActionChange = (action: "like" | "comment" | "save") => {
    setActiveAction(action);
    setPointer(coords[action]);
  };

  const handleSave = () => {
    onSave(coords);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Action Coordinates</DialogTitle>
          <DialogDescription>
            Tap/click on the image to set coordinates for each action. Device: <span className="font-semibold">{deviceName}</span>
          </DialogDescription>
        </DialogHeader>
        {screenshot ? (
          <div>
            <div className="flex gap-2 mb-2">
              {(Object.keys(actionLabels) as ("like" | "comment" | "save")[]).map((action) => (
                <Button
                  key={action}
                  size="sm"
                  variant={activeAction === action ? "default" : "outline"}
                  onClick={() => handleActionChange(action)}
                >
                  {actionLabels[action]}
                </Button>
              ))}
            </div>
            <div className="w-full flex justify-center items-center">
              <div className="relative">
                <img
                  ref={imgRef}
                  src={screenshot}
                  alt="Device Screenshot"
                  className="max-w-xs md:max-w-md border rounded shadow cursor-crosshair"
                  onClick={handleImgClick}
                  style={{ maxHeight: 400, display: "block" }}
                />
                {/* Render action markers */}
                {(Object.keys(coords) as ("like" | "comment" | "save")[]).map((action) => {
                  if (!coords[action]) return null;
                  const x = coords[action].x;
                  const y = coords[action].y;
                  // Calculate marker position
                  // Compute scale for preview
                  let markerStyle = {};
                  if (imgRef.current) {
                    const rect = imgRef.current.getBoundingClientRect();
                    const scaleX = rect.width / imgRef.current.naturalWidth;
                    const scaleY = rect.height / imgRef.current.naturalHeight;
                    markerStyle = {
                      position: "absolute" as const,
                      left: x * scaleX,
                      top: y * scaleY,
                      width: 18,
                      height: 18,
                      zIndex: 10,
                      transform: "translate(-50%,-50%)",
                    };
                  }
                  return (
                    <span
                      key={action}
                      title={actionLabels[action]}
                      className={
                        "absolute rounded-full border-2 ring-2 ring-white pointer-events-none " +
                        actionColors[action]
                      }
                      style={markerStyle}
                    ></span>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center mt-3 gap-3">
              <div className="flex gap-2">
                <Badge>
                  X: {coords[activeAction].x} &nbsp; Y: {coords[activeAction].y}
                </Badge>
              </div>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" size="sm">
                <SaveIcon className="h-4 w-4 mr-1" />
                Save & Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-6">Loading screenshot...</div>
        )}
        <DialogFooter>
          <span className="text-xs text-muted-foreground">Coordinates are saved per action and device.</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceScreenshotDialog;
