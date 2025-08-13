const API_BASE_URL = 'http://127.0.0.1:9912/api';

interface APIResponse {
  fun: string;
  msgid: number;
  status: number;
  message: string;
  data: any;
}

class FarmAPI {
  private async makeRequest(data: any): Promise<APIResponse> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Device Management
  async getDeviceList() {
    return this.makeRequest({
      fun: 'get_device_list',
      msgid: 0,
      data: {}
    });
  }

  async setDevice(deviceData: any) {
    return this.makeRequest({
      fun: 'set_dev',
      msgid: 0,
      data: deviceData
    });
  }

  async deleteDevice(deviceId: string) {
    return this.makeRequest({
      fun: 'del_dev',
      msgid: 0,
      data: { deviceid: deviceId }
    });
  }

  // Group Management
  async getGroupList() {
    return this.makeRequest({
      fun: 'get_group_list',
      msgid: 0,
      data: {}
    });
  }

  async setGroup(groupData: any) {
    return this.makeRequest({
      fun: 'set_group',
      msgid: 0,
      data: groupData
    });
  }

  async deleteGroup(groupId: string) {
    return this.makeRequest({
      fun: 'del_group',
      msgid: 0,
      data: { gid: groupId }
    });
  }

  // USB Management
  async getUSBList() {
    return this.makeRequest({
      fun: 'get_usb_list',
      msgid: 0,
      data: {}
    });
  }

  // Device Models
  async getDeviceModelList() {
    return this.makeRequest({
      fun: 'get_devicemodel_list',
      msgid: 0,
      data: {}
    });
  }

  // Screenshot
  async getDeviceScreenshot(deviceId: string, options: any = {}) {
    return this.makeRequest({
      fun: 'get_device_screenshot',
      msgid: 0,
      data: {
        deviceid: deviceId,
        gzip: false,
        binary: false,
        isjpg: true,
        original: false,
        ...options
      }
    });
  }

  // Mouse Control
  async mouseClick(deviceId: string, x: number, y: number, button: string = 'left', time: number = 0) {
    return this.makeRequest({
      fun: 'click',
      msgid: 0,
      data: {
        deviceid: deviceId,
        button,
        x,
        y,
        time
      }
    });
  }

  async mouseDoubleClick(deviceId: string, x?: number, y?: number, button: string = 'left') {
    // If coordinates are provided, click at specific location
    // If not provided, double-click at current mouse position
    if (x !== undefined && y !== undefined) {
      // Click twice at the specified coordinates
      const firstClick = await this.mouseClick(deviceId, x, y, button);
      if (firstClick.status !== 0) return firstClick;
      
      // Small delay between clicks
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return this.mouseClick(deviceId, x, y, button);
    } else {
      // Double-click at current position using the API's double-click function
      return this.makeRequest({
        fun: 'double_click',
        msgid: 0,
        data: {
          deviceid: deviceId,
          button
        }
      });
    }
  }

  async mouseMove(deviceId: string, x: number, y: number) {
    return this.makeRequest({
      fun: 'mouse_move',
      msgid: 0,
      data: {
        deviceid: deviceId,
        x,
        y
      }
    });
  }

  async mouseSwipe(deviceId: string, swipeData: any) {
    // Handle both old format and new format with coordinates
    if (swipeData.startX !== undefined && swipeData.startY !== undefined && 
        swipeData.endX !== undefined && swipeData.endY !== undefined) {
      // New coordinate-based swipe
      return this.makeRequest({
        fun: 'swipe',
        msgid: 0,
        data: {
          deviceid: deviceId,
          startX: swipeData.startX,
          startY: swipeData.startY,
          endX: swipeData.endX,
          endY: swipeData.endY,
          duration: swipeData.duration || 500
        }
      });
    } else {
      // Legacy direction-based swipe
      return this.makeRequest({
        fun: 'swipe',
        msgid: 0,
        data: {
          deviceid: deviceId,
          ...swipeData
        }
      });
    }
  }

  async mouseDown(deviceId: string, button: string = 'left') {
    return this.makeRequest({
      fun: 'mouse_down',
      msgid: 0,
      data: {
        deviceid: deviceId,
        button
      }
    });
  }

  async mouseUp(deviceId: string, button: string = 'left') {
    return this.makeRequest({
      fun: 'mouse_up',
      msgid: 0,
      data: {
        deviceid: deviceId,
        button
      }
    });
  }

  async mouseReset(deviceId: string) {
    return this.makeRequest({
      fun: 'mouse_reset_pos',
      msgid: 0,
      data: {
        deviceid: deviceId
      }
    });
  }

  async mouseWheel(deviceId: string, direction: string, length: number = 30, number: number = 1) {
    return this.makeRequest({
      fun: 'mouse_wheel',
      msgid: 0,
      data: {
        deviceid: deviceId,
        direction,
        length,
        number
      }
    });
  }

  // Keyboard Control
  async sendKey(deviceId: string, key?: string, fnKey?: string) {
    return this.makeRequest({
      fun: 'send_key',
      msgid: 0,
      data: {
        deviceid: deviceId,
        key: key || '',
        fn_key: fnKey || ''
      }
    });
  }

  // Type text (new method for automation)
  async typeText(deviceId: string, text: string) {
    return this.makeRequest({
      fun: 'send_key',
      msgid: 0,
      data: {
        deviceid: deviceId,
        key: text,
        fn_key: ''
      }
    });
  }

  async keyDown(deviceId: string, key: string) {
    return this.makeRequest({
      fun: 'key_down',
      msgid: 0,
      data: {
        deviceid: deviceId,
        key
      }
    });
  }

  async keyUp(deviceId: string, key: string) {
    return this.makeRequest({
      fun: 'key_up',
      msgid: 0,
      data: {
        deviceid: deviceId,
        key
      }
    });
  }

  async keyReleaseAll(deviceId: string) {
    return this.makeRequest({
      fun: 'key_release_all',
      msgid: 0,
      data: {
        deviceid: deviceId
      }
    });
  }

  // System Control
  async restart() {
    return this.makeRequest({
      fun: 'restart',
      msgid: 0
    });
  }

  async getAirplayServiceNumber() {
    return this.makeRequest({
      fun: 'get_airplaysrvnum',
      msgid: 0
    });
  }

  async setAirplayServiceNumber(number: number) {
    return this.makeRequest({
      fun: 'set_airplaysrvnum',
      msgid: 0,
      data: {
        airplaysrvnum: number
      }
    });
  }
}

export const farmAPI = new FarmAPI();