import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, UserPlus, UserMinus } from 'lucide-react';
import { farmAPI } from '../services/farmAPI';
import { useToast } from '@/hooks/use-toast';

interface GroupManagerProps {
  groups: any;
  devices: any;
  onRefresh: () => void;
  onDevicesRefresh: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ groups = {}, devices = {}, onRefresh, onDevicesRefresh }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageDevicesDialogOpen, setIsManageDevicesDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDeviceToAdd, setSelectedDeviceToAdd] = useState('');
  const { toast } = useToast();

  const safeGroups = groups || {};
  const safeDevices = devices || {};
  const hasGroups = Object.keys(safeGroups).length > 0;

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await farmAPI.setGroup({
        gid: "0", // 0 means create new
        name: newGroupName
      });

      if (response.status === 0) {
        toast({
          title: "Success",
          description: "Group created successfully",
        });
        setNewGroupName('');
        setIsCreateDialogOpen(false);
        onRefresh();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await farmAPI.deleteGroup(groupId);
      
      if (response.status === 0) {
        toast({
          title: "Success",
          description: "Group deleted successfully",
        });
        onRefresh();
        onDevicesRefresh();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const handleAddDeviceToGroup = async () => {
    if (!selectedDeviceToAdd || !selectedGroup) return;

    try {
      const response = await farmAPI.setDevice({
        deviceid: selectedDeviceToAdd,
        name: safeDevices[selectedDeviceToAdd]?.name || safeDevices[selectedDeviceToAdd]?.device_name,
        gid: selectedGroup.gid
      });

      if (response.status === 0) {
        toast({
          title: "Success",
          description: "Device added to group successfully",
        });
        setSelectedDeviceToAdd('');
        onDevicesRefresh();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add device to group",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDeviceFromGroup = async (deviceId: string) => {
    try {
      const response = await farmAPI.setDevice({
        deviceid: deviceId,
        name: safeDevices[deviceId]?.name || safeDevices[deviceId]?.device_name,
        gid: ""
      });

      if (response.status === 0) {
        toast({
          title: "Success",
          description: "Device removed from group successfully",
        });
        onDevicesRefresh();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove device from group",
        variant: "destructive",
      });
    }
  };

  const getGroupDevices = (groupId: string) => {
    return Object.values(safeDevices).filter((device: any) => device.gid === groupId);
  };

  const getAvailableDevicesForGroup = () => {
    if (!selectedGroup) return [];
    return Object.values(safeDevices).filter((device: any) => 
      !device.gid || device.gid === '' || device.gid !== selectedGroup.gid
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">Groups ({Object.keys(safeGroups).length})</span>
        </div>
        
        {/* Only show the Create Group button if there are existing groups */}
        {hasGroups && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
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
                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!hasGroups ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            No groups created yet. Click "Create Group" to add your first group.
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
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
                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group ID</TableHead>
              <TableHead>Group Name</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(safeGroups).map((group: any) => {
              const groupDevices = getGroupDevices(group.gid);
              return (
                <TableRow key={group.gid}>
                  <TableCell className="font-mono text-sm">{group.gid}</TableCell>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {groupDevices.length === 0 ? (
                        <span className="text-muted-foreground text-sm">No devices</span>
                      ) : (
                        groupDevices.map((device: any) => (
                          <Badge key={device.deviceid} variant="outline" className="text-xs">
                            {device.name || device.device_name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={isManageDevicesDialogOpen && selectedGroup?.gid === group.gid} 
                              onOpenChange={(open) => {
                                setIsManageDevicesDialogOpen(open);
                                if (open) setSelectedGroup(group);
                                else setSelectedGroup(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Add & Remove Devices
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Devices - {group.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Add device section */}
                            <div>
                              <Label>Add Device to Group</Label>
                              <div className="flex space-x-2 mt-2">
                                <Select value={selectedDeviceToAdd} onValueChange={setSelectedDeviceToAdd}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select device to add" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableDevicesForGroup().map((device: any) => (
                                      <SelectItem key={device.deviceid} value={device.deviceid}>
                                        {device.name || device.device_name} ({device.deviceid})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button onClick={handleAddDeviceToGroup} disabled={!selectedDeviceToAdd}>
                                  Add
                                </Button>
                              </div>
                            </div>

                            {/* Current devices in group */}
                            <div>
                              <Label>Current Devices in Group</Label>
                              <div className="space-y-2 mt-2">
                                {groupDevices.length === 0 ? (
                                  <p className="text-muted-foreground text-sm">No devices in this group</p>
                                ) : (
                                  groupDevices.map((device: any) => (
                                    <div key={device.deviceid} className="flex items-center justify-between p-2 border rounded">
                                      <span className="text-sm">
                                        {device.name || device.device_name} ({device.deviceid})
                                      </span>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleRemoveDeviceFromGroup(device.deviceid)}
                                      >
                                        <UserMinus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteGroup(group.gid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default GroupManager;
