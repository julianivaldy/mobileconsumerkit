import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Users, Smartphone, Plus, Trash } from 'lucide-react';
import { farmAPI } from '../services/farmAPI';
import { useToast } from '@/hooks/use-toast';

interface DeviceSelectorProps {
  devices: any;
  groups: any;
  selectedDevices: string[];
  onSelectionChange: (devices: string[]) => void;
  onDevicesRefresh?: () => void;
  onGroupsRefresh?: () => void;
}

type SelectionMode = 'device' | 'group' | null;

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices = {},
  groups = {},
  selectedDevices,
  onSelectionChange,
  onDevicesRefresh,
  onGroupsRefresh
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedDevicesForGroup, setSelectedDevicesForGroup] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  const safeDevices = devices || {};
  const safeGroups = groups || {};

  // Helper: get all deviceIds for a group
  const getGroupDeviceIds = (groupId: string) =>
    Object.values(safeDevices)
      .filter((device: any) => device.gid === groupId)
      .map((device: any) => device.deviceid);

  // Device toggle: always allow selecting/unselecting a device,
  // EVEN if this is the only device in a group.
  const handleDeviceToggle = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      const newSelected = selectedDevices.filter(id => id !== deviceId);
      onSelectionChange(newSelected);
    } else {
      const newSelected = [...selectedDevices, deviceId];
      onSelectionChange(newSelected);
    }
  };

  // Group toggle: select or unselect ALL devices in the group (even 1-device groups)
  const handleGroupToggle = (groupId: string) => {
    const groupDeviceIds = getGroupDeviceIds(groupId);

    const allSelected = groupDeviceIds.length > 0 && groupDeviceIds.every(deviceId => selectedDevices.includes(deviceId));
    if (allSelected) {
      // Unselect ALL devices in the group (even if this would leave 0 selected)
      onSelectionChange(selectedDevices.filter(id => !groupDeviceIds.includes(id)));
    } else {
      // Select all devices in the group (avoid duplicates)
      onSelectionChange(Array.from(new Set([...selectedDevices, ...groupDeviceIds])));
    }
  };

  // Devices selected for group creation
  const handleDeviceForGroupToggle = (deviceId: string) => {
    if (selectedDevicesForGroup.includes(deviceId)) {
      setSelectedDevicesForGroup(selectedDevicesForGroup.filter(id => id !== deviceId));
    } else {
      setSelectedDevicesForGroup([...selectedDevicesForGroup, deviceId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    if (selectedDevicesForGroup.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one device for the group",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingGroup(true);

    try {
      // First create the group - use "0" to create new group
      const groupResponse = await farmAPI.setGroup({
        name: newGroupName,
        gid: "0", // "0" means create new group
      });

      if (groupResponse.status !== 0) {
        throw new Error(groupResponse.message || 'Failed to create group');
      }

      // Wait a moment for the group to be created
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh groups to get the new group ID
      if (onGroupsRefresh) {
        onGroupsRefresh();
      }

      // Wait another moment for the refresh to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the updated groups list to find the new group
      const updatedGroupsResponse = await farmAPI.getGroupList();
      if (updatedGroupsResponse.status === 0) {
        const updatedGroups = updatedGroupsResponse.data;
        // Find the group with the matching name (assuming it's the newest one)
        const newGroup = Object.values(updatedGroups).find((group: any) => group.name === newGroupName);
        
        if (newGroup) {
          const newGroupId = (newGroup as any).gid;
          
          // Now assign devices to the group
          for (const deviceId of selectedDevicesForGroup) {
            const device = safeDevices[deviceId];
            if (device) {
              await farmAPI.setDevice({
                deviceid: deviceId,
                name: device.name || device.device_name,
                gid: newGroupId
              });
            }
          }

          toast({
            title: "Success",
            description: `Group "${newGroupName}" created with ${selectedDevicesForGroup.length} devices`,
          });

          // Reset form
          setNewGroupName('');
          setSelectedDevicesForGroup([]);
          setIsDialogOpen(false);

          // Final refresh to update everything
          if (onDevicesRefresh) onDevicesRefresh();
          if (onGroupsRefresh) onGroupsRefresh();
        } else {
          throw new Error('Could not find the newly created group');
        }
      }
    } catch (error) {
      console.error('Group creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const getDeviceName = (deviceId: string) => {
    const device = safeDevices[deviceId];
    return device?.name || device?.device_name || deviceId;
  };

  const getGroupName = (groupId: string) => {
    return safeGroups[groupId]?.name || 'Unknown Group';
  };

  // --- New: Delete group with confirmation ---
  const handleDeleteGroup = async (groupId: string) => {
    const groupName = getGroupName(groupId);
    try {
      const resp = await farmAPI.deleteGroup(groupId);
      if (resp.status === 0) {
        toast({
          title: "Group deleted",
          description: groupName ? `Group "${groupName}" has been deleted` : "Group has been deleted"
        });
        // Refresh data after delete
        if (onGroupsRefresh) onGroupsRefresh();
        if (onDevicesRefresh) onDevicesRefresh();
      } else {
        toast({
          title: "Delete failed",
          description: resp.message ?? "Could not delete group",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "Could not delete group",
        variant: "destructive"
      });
    } finally {
      setDeletingGroupId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Tabs for selection type */}
      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices">Select by Devices</TabsTrigger>
          <TabsTrigger value="groups">Select by Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="border rounded-lg p-4 bg-white">
            <Label className="font-medium mb-3 block flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              All Devices ({Object.keys(safeDevices).length})
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(safeDevices).map((device: any) => (
                <div key={device.deviceid} className="flex items-center space-x-2 p-2 rounded border bg-gray-50">
                  <Checkbox
                    checked={selectedDevices.includes(device.deviceid)}
                    onCheckedChange={() => handleDeviceToggle(device.deviceid)}
                    // ALWAYS allow toggling the checkbox, never hard-disable
                  />
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm cursor-pointer truncate block" onClick={() => handleDeviceToggle(device.deviceid)}>
                      {device.name || device.device_name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{device.deviceid}</p>
                    {device.gid && (
                      <p className="text-xs text-blue-600">Group: {safeGroups[device.gid]?.name || 'Unknown Group'}</p>
                    )}
                  </div>
                  <Badge variant={device.state === 0 ? "secondary" : "default"} className="text-xs shrink-0">
                    {device.state === 0 ? "Offline" : "Online"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {/* Create Group Button - only show when there are existing groups */}
          {Object.keys(safeGroups).length > 0 && (
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a new group and assign devices to it
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div>
                      <Label>Select Devices for Group</Label>
                      <div className="mt-2 max-h-64 overflow-y-auto border rounded p-2">
                        {Object.values(safeDevices).map((device: any) => (
                          <div key={device.deviceid} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={selectedDevicesForGroup.includes(device.deviceid)}
                              onCheckedChange={() => handleDeviceForGroupToggle(device.deviceid)}
                            />
                            <Label className="text-sm cursor-pointer" onClick={() => handleDeviceForGroupToggle(device.deviceid)}>
                              {device.name || device.device_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateGroup} 
                      disabled={isCreatingGroup}
                      className="w-full"
                    >
                      {isCreatingGroup ? 'Creating...' : 'Create Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {Object.keys(safeGroups).length === 0 ? (
            <div className="text-center text-muted-foreground py-8 border rounded-lg bg-gray-50">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No groups available</p>
              <p className="text-sm mb-4">Create your first group to organize your devices</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a new group and assign devices to it
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div>
                      <Label>Select Devices for Group</Label>
                      <div className="mt-2 max-h-64 overflow-y-auto border rounded p-2">
                        {Object.values(safeDevices).map((device: any) => (
                          <div key={device.deviceid} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={selectedDevicesForGroup.includes(device.deviceid)}
                              onCheckedChange={() => handleDeviceForGroupToggle(device.deviceid)}
                            />
                            <Label className="text-sm cursor-pointer" onClick={() => handleDeviceForGroupToggle(device.deviceid)}>
                              {device.name || device.device_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateGroup} 
                      disabled={isCreatingGroup}
                      className="w-full"
                    >
                      {isCreatingGroup ? 'Creating...' : 'Create Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid gap-3">
              {Object.values(safeGroups).map((group: any) => {
                const groupDevices = Object.values(safeDevices)
                  .filter((device: any) => device.gid === group.gid);

                if (groupDevices.length === 0) return null;

                const groupDeviceIds = groupDevices.map((device: any) => device.deviceid);
                const allSelected = groupDeviceIds.length > 0 && groupDeviceIds.every(id => selectedDevices.includes(id));
                const someSelected = groupDeviceIds.some(id => selectedDevices.includes(id)) && !allSelected;

                let checked: boolean | "indeterminate" = false;
                if (allSelected) checked = true;
                else if (someSelected) checked = "indeterminate";
                else checked = false;

                return (
                  <div key={group.gid} className="border rounded-lg p-4 bg-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleGroupToggle(group.gid)}
                      />
                      <div>
                        <Label className="font-semibold text-base cursor-pointer" onClick={() => handleGroupToggle(group.gid)}>
                          <Users className="h-4 w-4 inline mr-2" />
                          {getGroupName(group.gid)}
                        </Label>
                        <p className="text-sm text-muted-foreground">{groupDevices.length} devices</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {checked === true ? 'All Selected' : checked === "indeterminate" ? 'Partial' : 'None Selected'}
                      </Badge>
                    </div>
                    {/* NEW: Delete button for group */}
                    <div>
                      <Dialog open={deletingGroupId === group.gid} onOpenChange={open => setDeletingGroupId(open ? group.gid : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600" aria-label="Delete group">
                            <Trash className="w-5 h-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Group?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the group "{getGroupName(group.gid)}"? This removes the group, but the devices will not be deleted.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2 justify-end mt-4">
                            <Button variant="outline" onClick={() => setDeletingGroupId(null)}>Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteGroup(group.gid)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceSelector;
