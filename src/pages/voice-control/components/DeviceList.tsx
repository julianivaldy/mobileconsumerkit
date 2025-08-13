
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";

interface Device {
  deviceid: string;
  name: string;
  language: string;
}

// Supported languages
const languages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "fr-FR", label: "French" },
  { value: "es-ES", label: "Spanish" },
  { value: "de-DE", label: "German" },
];

// Helper: Load/save devices from localStorage
function getDevicesFromStorage(): Device[] {
  try {
    return JSON.parse(localStorage.getItem("voice_devices") ?? "[]");
  } catch {
    return [];
  }
}
function saveDevicesToStorage(devices: Device[]) {
  localStorage.setItem("voice_devices", JSON.stringify(devices));
}

const DeviceList: React.FC = () => {
  const { toast } = useToast();

  const [devices, setDevices] = useState<Device[]>([]);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [addData, setAddData] = useState<{ name: string; language: string }>({
    name: "",
    language: "en-US",
  });
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editData, setEditData] = useState<{ name: string; language: string }>({
    name: "",
    language: "en-US",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load devices on mount
  useEffect(() => {
    setDevices(getDevicesFromStorage());
  }, []);

  // Helper to add a device
  const handleCreateDevice = () => {
    if (!addData.name.trim()) {
      toast({ title: "Device name cannot be empty", variant: "destructive" });
      return;
    }
    const newDevice: Device = {
      deviceid: Date.now().toString(),
      name: addData.name.trim(),
      language: addData.language,
    };
    const updated = [...devices, newDevice];
    setDevices(updated);
    saveDevicesToStorage(updated);
    setShowAdd(false);
    setAddData({ name: "", language: "en-US" });
    toast({ title: "Device created" });
  };

  // Helper to edit a device
  const handleEditDevice = () => {
    if (!editDevice) return;
    if (!editData.name.trim()) {
      toast({ title: "Device name cannot be empty", variant: "destructive" });
      return;
    }
    const updated = devices.map((dev) =>
      dev.deviceid === editDevice.deviceid
        ? { ...dev, name: editData.name.trim(), language: editData.language }
        : dev
    );
    setDevices(updated);
    saveDevicesToStorage(updated);
    setEditDevice(null);
    toast({ title: "Device updated" });
  };

  // Helper to delete device
  const handleDeleteDevice = () => {
    if (!deleteId) return;
    const updated = devices.filter((d) => d.deviceid !== deleteId);
    setDevices(updated);
    saveDevicesToStorage(updated);
    setDeleteId(null);
    toast({ title: "Device deleted" });
  };

  return (
    <section className="max-w-2xl mx-auto w-full bg-card rounded-xl shadow-md border px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Devices Management</h2>
          <div className="text-muted-foreground text-base mb-2">
            Create and manage devices for use in automations.
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Device
        </Button>
      </div>

      {/* Device List */}
      <div className="mt-4">
        {devices.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="text-base text-muted-foreground font-medium mb-2">
              No devices have been created yet.
            </span>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Device
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {devices.map((dev) => (
              <li
                key={dev.deviceid}
                className="flex items-center justify-between rounded-lg border bg-muted px-5 py-3 text-card-foreground shadow-sm"
              >
                <span className="font-medium text-lg truncate">{dev.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditDevice(dev);
                      setEditData({ name: dev.name, language: dev.language });
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(dev.deviceid)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Device Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Device</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="device-name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="device-name"
                value={addData.name}
                onChange={e => setAddData({ ...addData, name: e.target.value })}
                placeholder="Enter device name"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="device-lang" className="block text-sm font-medium mb-1">
                Language
              </label>
              <Select
                value={addData.language}
                onValueChange={(val) => setAddData({ ...addData, language: val })}
              >
                <SelectTrigger id="device-lang" className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateDevice}>
              Create
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={!!editDevice} onOpenChange={(v) => !v && setEditDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="edit-device-name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="edit-device-name"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="edit-device-lang" className="block text-sm font-medium mb-1">
                Language
              </label>
              <Select
                value={editData.language}
                onValueChange={(val) => setEditData({ ...editData, language: val })}
              >
                <SelectTrigger id="edit-device-lang" className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditDevice}>Save</Button>
            <Button variant="ghost" onClick={() => setEditDevice(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Device</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this device? This cannot be undone.</div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteDevice}>
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DeviceList;

