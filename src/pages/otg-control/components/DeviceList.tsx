
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, Trash2 } from 'lucide-react';
import { farmAPI } from '../services/farmAPI';
import { useToast } from '@/hooks/use-toast';
import { Device, DeviceGroup } from '@/types/common';

interface DeviceListProps {
  devices: Record<string, Device>;
  groups: Record<string, DeviceGroup>;
  onDeviceSelect: (deviceId: string) => void;
  onRefresh: () => void;
}

// A responsive device table with prettier cards, headers, and empty state.
const DeviceList: React.FC<DeviceListProps> = ({
  devices = {},
  groups = {},
  onDeviceSelect,
  onRefresh
}) => {
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [deviceGroup, setDeviceGroup] = useState('');
  const { toast } = useToast();

  const safeDevices = devices || {};
  const safeGroups = groups || {};

  /**
   * Handle editing a device
   */
  const handleEditDevice = (device: Device) => {
    setEditDevice(device);
    setDeviceName(device.name || '');
    setDeviceGroup(device.gid || '');
  };

  const handleSaveDevice = async () => {
    if (!editDevice) return;

    try {
      const response = await farmAPI.setDevice({
        deviceid: editDevice.deviceid,
        name: deviceName,
        gid: deviceGroup
      });

      if (response.status === 0) {
        toast({
          title: 'Success',
          description: 'Device updated successfully'
        });
        setEditDevice(null);
        onRefresh();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update device',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const response = await farmAPI.deleteDevice(deviceId);

      if (response.status === 0) {
        toast({
          title: 'Success',
          description: 'Device deleted successfully'
        });
        onRefresh();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete device',
        variant: 'destructive'
      });
    }
  };

  const getGroupName = (gid: string) => {
    return safeGroups[gid]?.name || 'No Group';
  };

  const devicesArray = Object.values(safeDevices);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-2xl font-semibold text-foreground">Devices</h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow-lg border border-border px-2 py-4 md:px-4 md:py-6 animate-fade-in transition">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">Device Name</TableHead>
              <TableHead className="w-1/6 hidden md:table-cell">Model</TableHead>
              <TableHead className="w-1/6">IP</TableHead>
              <TableHead className="w-1/12">Status</TableHead>
              <TableHead className="w-1/6">Group</TableHead>
              <TableHead className="w-1/6 hidden md:table-cell">Resolution</TableHead>
              <TableHead className="w-1/6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {devicesArray.length > 0 ? (
            <TableBody>
              {devicesArray.map((device: Device) => (
                <TableRow
                  key={device.deviceid}
                  className="hover:bg-accent transition-colors duration-150 group"
                >
                  <TableCell className="font-medium">
                    <span className="truncate block max-w-[150px]">{device.name || device.device_name}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{device.device_name}</TableCell>
                  <TableCell>
                    <span className="text-xs md:text-sm">{device.ip}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={device.state === 0 ? 'secondary' : 'default'}
                      className={`px-2 py-1 rounded ${
                        device.state === 0
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {device.state === 0 ? 'Offline' : 'Online'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="truncate block max-w-[120px]">{getGroupName(device.gid)}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {device.width}x{device.height}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1 md:gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Edit device"
                            className="hover:scale-110"
                            onClick={() => handleEditDevice(device)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Device</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="device-name">Device Name</Label>
                              <Input
                                id="device-name"
                                value={deviceName}
                                onChange={e => setDeviceName(e.target.value)}
                                placeholder="Enter device name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="device-group">Group</Label>
                              <Select value={deviceGroup} onValueChange={setDeviceGroup}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No Group</SelectItem>
                                  {Object.values(safeGroups).map((group: DeviceGroup) => (
                                    <SelectItem key={group.gid} value={group.gid}>
                                      {group.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={handleSaveDevice}
                              className="w-full"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Delete device"
                        onClick={() => handleDeleteDevice(device.deviceid)}
                        disabled={device.state !== 0}
                        className={`hover:scale-110 ${device.state === 0 ? "hover:bg-destructive/10" : "opacity-60"}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">🖥️</span>
                    <span className="text-base text-muted-foreground font-medium">
                      No devices found. Please add a device to get started.
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </div>
    </div>
  );
};

export default DeviceList;
