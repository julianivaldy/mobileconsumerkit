export interface DeviceCoordinates {
  like: { x: number; y: number };
  comment: { x: number; y: number };
  save: { x: number; y: number };
}

export interface DeviceMapping {
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
  coordinates: DeviceCoordinates;
}

// Predefined coordinate mappings for different device types
const DEVICE_COORDINATE_MAPPINGS: DeviceMapping[] = [
  {
    deviceType: "default_android",
    screenWidth: 1080,
    screenHeight: 1920,
    coordinates: {
      like: { x: 972, y: 800 },
      comment: { x: 972, y: 880 },
      save: { x: 972, y: 1040 }
    }
  },
  {
    deviceType: "small_android",
    screenWidth: 720,
    screenHeight: 1280,
    coordinates: {
      like: { x: 648, y: 533 },
      comment: { x: 648, y: 587 },
      save: { x: 648, y: 693 }
    }
  },
  // iPhone SE models
  {
    deviceType: "iphone_se_1st_gen",
    screenWidth: 640,
    screenHeight: 1136,
    coordinates: {
      like: { x: 610, y: 280 },
      comment: { x: 610, y: 350 },
      save: { x: 610, y: 420 }
    }
  },
  {
    deviceType: "iphone_se_2nd_gen",
    screenWidth: 750,
    screenHeight: 1334,
    coordinates: {
      like: { x: 720, y: 329 },
      comment: { x: 720, y: 409 },
      save: { x: 720, y: 489 }
    }
  },
  {
    deviceType: "iphone_se_3rd_gen",
    screenWidth: 750,
    screenHeight: 1334,
    coordinates: {
      like: { x: 720, y: 329 },
      comment: { x: 720, y: 409 },
      save: { x: 720, y: 489 }
    }
  },
  // iPhone models from iPhone 8 onwards - CORRECTED COORDINATES WITH PROPER RIGHT-SIDE POSITIONING
  {
    deviceType: "iphone_8",
    screenWidth: 750,
    screenHeight: 1334,
    coordinates: {
      like: { x: 720, y: 329 },  // Moved further right
      comment: { x: 720, y: 409 },
      save: { x: 720, y: 489 }
    }
  },
  {
    deviceType: "iphone_8_plus",
    screenWidth: 1080,
    screenHeight: 1920,
    coordinates: {
      like: { x: 1020, y: 470 },
      comment: { x: 1020, y: 570 },
      save: { x: 1020, y: 670 }
    }
  },
  {
    deviceType: "iphone_x",
    screenWidth: 1125,
    screenHeight: 2436,
    coordinates: {
      like: { x: 1080, y: 585 },
      comment: { x: 1080, y: 705 },
      save: { x: 1080, y: 825 }
    }
  },
  {
    deviceType: "iphone_xs",
    screenWidth: 1125,
    screenHeight: 2436,
    coordinates: {
      like: { x: 1080, y: 585 },
      comment: { x: 1080, y: 705 },
      save: { x: 1080, y: 825 }
    }
  },
  {
    deviceType: "iphone_xs_max",
    screenWidth: 1242,
    screenHeight: 2688,
    coordinates: {
      like: { x: 1190, y: 645 },
      comment: { x: 1190, y: 775 },
      save: { x: 1190, y: 905 }
    }
  },
  {
    deviceType: "iphone_xr",
    screenWidth: 828,
    screenHeight: 1792,
    coordinates: {
      like: { x: 795, y: 430 },
      comment: { x: 795, y: 520 },
      save: { x: 795, y: 610 }
    }
  },
  {
    deviceType: "iphone_11",
    screenWidth: 828,
    screenHeight: 1792,
    coordinates: {
      like: { x: 795, y: 430 },
      comment: { x: 795, y: 520 },
      save: { x: 795, y: 610 }
    }
  },
  {
    deviceType: "iphone_11_pro",
    screenWidth: 1125,
    screenHeight: 2436,
    coordinates: {
      like: { x: 1080, y: 585 },
      comment: { x: 1080, y: 705 },
      save: { x: 1080, y: 825 }
    }
  },
  {
    deviceType: "iphone_11_pro_max",
    screenWidth: 1242,
    screenHeight: 2688,
    coordinates: {
      like: { x: 1190, y: 645 },
      comment: { x: 1190, y: 775 },
      save: { x: 1190, y: 905 }
    }
  },
  {
    deviceType: "iphone_12_mini",
    screenWidth: 1080,
    screenHeight: 2340,
    coordinates: {
      like: { x: 1035, y: 562 },
      comment: { x: 1035, y: 677 },
      save: { x: 1035, y: 792 }
    }
  },
  {
    deviceType: "iphone_12",
    screenWidth: 1170,
    screenHeight: 2532,
    coordinates: {
      like: { x: 1120, y: 608 },
      comment: { x: 1120, y: 733 },
      save: { x: 1120, y: 858 }
    }
  },
  {
    deviceType: "iphone_12_pro",
    screenWidth: 1170,
    screenHeight: 2532,
    coordinates: {
      like: { x: 1120, y: 608 },
      comment: { x: 1120, y: 733 },
      save: { x: 1120, y: 858 }
    }
  },
  {
    deviceType: "iphone_12_pro_max",
    screenWidth: 1284,
    screenHeight: 2778,
    coordinates: {
      like: { x: 1230, y: 667 },
      comment: { x: 1230, y: 802 },
      save: { x: 1230, y: 937 }
    }
  },
  {
    deviceType: "iphone_13_mini",
    screenWidth: 1080,
    screenHeight: 2340,
    coordinates: {
      like: { x: 1035, y: 562 },
      comment: { x: 1035, y: 677 },
      save: { x: 1035, y: 792 }
    }
  },
  {
    deviceType: "iphone_13",
    screenWidth: 1170,
    screenHeight: 2532,
    coordinates: {
      like: { x: 1120, y: 608 },
      comment: { x: 1120, y: 733 },
      save: { x: 1120, y: 858 }
    }
  },
  {
    deviceType: "iphone_13_pro",
    screenWidth: 1170,
    screenHeight: 2532,
    coordinates: {
      like: { x: 1120, y: 608 },
      comment: { x: 1120, y: 733 },
      save: { x: 1120, y: 858 }
    }
  },
  {
    deviceType: "iphone_13_pro_max",
    screenWidth: 1284,
    screenHeight: 2778,
    coordinates: {
      like: { x: 1230, y: 667 },
      comment: { x: 1230, y: 802 },
      save: { x: 1230, y: 937 }
    }
  },
  {
    deviceType: "iphone_14",
    screenWidth: 1170,
    screenHeight: 2532,
    coordinates: {
      like: { x: 1120, y: 608 },
      comment: { x: 1120, y: 733 },
      save: { x: 1120, y: 858 }
    }
  },
  {
    deviceType: "iphone_14_plus",
    screenWidth: 1284,
    screenHeight: 2778,
    coordinates: {
      like: { x: 1230, y: 667 },
      comment: { x: 1230, y: 802 },
      save: { x: 1230, y: 937 }
    }
  },
  {
    deviceType: "iphone_14_pro",
    screenWidth: 1179,
    screenHeight: 2556,
    coordinates: {
      like: { x: 1130, y: 613 },
      comment: { x: 1130, y: 738 },
      save: { x: 1130, y: 863 }
    }
  },
  {
    deviceType: "iphone_14_pro_max",
    screenWidth: 1290,
    screenHeight: 2796,
    coordinates: {
      like: { x: 1235, y: 670 },
      comment: { x: 1235, y: 805 },
      save: { x: 1235, y: 940 }
    }
  },
  {
    deviceType: "iphone_15",
    screenWidth: 1179,
    screenHeight: 2556,
    coordinates: {
      like: { x: 1130, y: 613 },
      comment: { x: 1130, y: 738 },
      save: { x: 1130, y: 863 }
    }
  },
  {
    deviceType: "iphone_15_plus",
    screenWidth: 1290,
    screenHeight: 2796,
    coordinates: {
      like: { x: 1235, y: 670 },
      comment: { x: 1235, y: 805 },
      save: { x: 1235, y: 940 }
    }
  },
  {
    deviceType: "iphone_15_pro",
    screenWidth: 1179,
    screenHeight: 2556,
    coordinates: {
      like: { x: 1130, y: 613 },
      comment: { x: 1130, y: 738 },
      save: { x: 1130, y: 863 }
    }
  },
  {
    deviceType: "iphone_15_pro_max",
    screenWidth: 1290,
    screenHeight: 2796,
    coordinates: {
      like: { x: 1235, y: 670 },
      comment: { x: 1235, y: 805 },
      save: { x: 1235, y: 940 }
    }
  },
  {
    deviceType: "tablet",
    screenWidth: 1200,
    screenHeight: 1920,
    coordinates: {
      like: { x: 1080, y: 900 },
      comment: { x: 1080, y: 990 },
      save: { x: 1080, y: 1170 }
    }
  }
];

class DeviceCoordinateMappingService {
  private customMappings: Map<string, DeviceCoordinates> = new Map();

  getCoordinatesForDevice(deviceId: string, deviceInfo: any): DeviceCoordinates | null {
    // First check if we have custom mappings for this specific device
    if (this.customMappings.has(deviceId)) {
      return this.customMappings.get(deviceId)!;
    }

    // Find matching predefined mapping based on screen resolution or device type
    const screenWidth = deviceInfo.width || 1080;
    const screenHeight = deviceInfo.height || 1920;
    const deviceType = deviceInfo.deviceType; // New: check for specified device type
    
    // Try device type match first if specified
    let mapping = null;
    if (deviceType) {
      mapping = DEVICE_COORDINATE_MAPPINGS.find(m => m.deviceType === deviceType);
      if (mapping) {
        return mapping.coordinates;
      }
    }
    
    // Try exact resolution match
    mapping = DEVICE_COORDINATE_MAPPINGS.find(m => 
      m.screenWidth === screenWidth && m.screenHeight === screenHeight
    );
    
    // If no exact match, find closest match by screen size
    if (!mapping) {
      mapping = this.findClosestMapping(screenWidth, screenHeight);
      if (mapping) {
        // Scale coordinates to match actual device resolution
        const scaledCoords = this.scaleCoordinates(mapping.coordinates, mapping.screenWidth, mapping.screenHeight, screenWidth, screenHeight);
        return scaledCoords;
      }
    }
    
    if (mapping) {
      return mapping.coordinates;
    }
    
    const defaultCoords = this.getDefaultCoordinates(screenWidth, screenHeight);
    return defaultCoords;
  }

  private findClosestMapping(targetWidth: number, targetHeight: number): DeviceMapping | null {
    let closest: DeviceMapping | null = null;
    let minDifference = Infinity;
    
    for (const mapping of DEVICE_COORDINATE_MAPPINGS) {
      const widthDiff = Math.abs(mapping.screenWidth - targetWidth);
      const heightDiff = Math.abs(mapping.screenHeight - targetHeight);
      const totalDiff = widthDiff + heightDiff;
      
      if (totalDiff < minDifference) {
        minDifference = totalDiff;
        closest = mapping;
      }
    }
    
    return closest;
  }

  private scaleCoordinates(
    originalCoords: DeviceCoordinates,
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number
  ): DeviceCoordinates {
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;
    
    return {
      like: {
        x: Math.round(originalCoords.like.x * scaleX),
        y: Math.round(originalCoords.like.y * scaleY)
      },
      comment: {
        x: Math.round(originalCoords.comment.x * scaleX),
        y: Math.round(originalCoords.comment.y * scaleY)
      },
      save: {
        x: Math.round(originalCoords.save.x * scaleX),
        y: Math.round(originalCoords.save.y * scaleY)
      }
    };
  }

  private getDefaultCoordinates(screenWidth: number, screenHeight: number): DeviceCoordinates {
    // Generate default coordinates based on typical TikTok layout - RIGHT SIDE positioning
    const rightEdge = screenWidth * 0.96; // 96% from left (further right)
    const verticalCenter = screenHeight * 0.65; // Center vertically in content area
    const buttonSpacing = screenHeight * 0.08; // 8% spacing between buttons
    
    return {
      like: { x: Math.round(rightEdge), y: Math.round(verticalCenter) },
      comment: { x: Math.round(rightEdge), y: Math.round(verticalCenter + buttonSpacing) },
      save: { x: Math.round(rightEdge), y: Math.round(verticalCenter + buttonSpacing * 2) }
    };
  }

  // Method to save custom coordinates for a specific device
  setCustomCoordinates(deviceId: string, coordinates: DeviceCoordinates): void {
    this.customMappings.set(deviceId, coordinates);
  }

  // Method to clear custom coordinates for a device
  clearCustomCoordinates(deviceId: string): void {
    this.customMappings.delete(deviceId);
  }

  // Get all available device mappings
  getAvailableMappings(): DeviceMapping[] {
    return [...DEVICE_COORDINATE_MAPPINGS];
  }

  // Get iPhone models specifically
  getIPhoneModels(): DeviceMapping[] {
    return DEVICE_COORDINATE_MAPPINGS.filter(mapping => 
      mapping.deviceType.startsWith('iphone_')
    );
  }

  // Get Android models specifically
  getAndroidModels(): DeviceMapping[] {
    return DEVICE_COORDINATE_MAPPINGS.filter(mapping => 
      mapping.deviceType.includes('android') || mapping.deviceType === 'tablet'
    );
  }
}

export const deviceCoordinateMappingService = new DeviceCoordinateMappingService();