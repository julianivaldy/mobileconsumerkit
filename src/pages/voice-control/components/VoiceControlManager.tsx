import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { farmAPI } from "../../otg-control/services/farmAPI";
import DeviceList from "./DeviceList";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Plus, Play, Trash, Edit } from "lucide-react";
import clsx from "clsx";
import { useVoiceAutomation, AutomationLogEntry as VoiceAutomationLogEntry } from "../hooks/useVoiceAutomation";
import AutomationLog from "./AutomationLog";
import { 
  VoiceDevice, 
  DeviceActions
} from '../types/voice-control';

// Utility to generate 5 random words, allowing exclusion of words
function getRandomWords(count = 5, exclude: string[] = [], language = "en") {
  // Language-specific word sets
  const wordSets = {
    en: [
      "apple", "banana", "table", "ocean", "dream", "orange", "moon", "machine", "river", "garden",
      "train", "camera", "voice", "cloud", "window", "forest", "silver", "mountain", "guitar", "coffee",
      "planet", "star", "music", "butter", "flower", "robot", "mirror", "castle", "pencil", "storm",
    ],
    fr: [
      "pomme", "banane", "table", "océan", "rêve", "orange", "lune", "machine", "rivière", "jardin",
      "train", "caméra", "voix", "nuage", "fenêtre", "forêt", "argent", "montagne", "guitarre", "café",
      "planète", "étoile", "musique", "beurre", "fleur", "robot", "miroir", "château", "crayon", "tempête",
    ],
    es: [
      "manzana", "plátano", "mesa", "océano", "sueño", "naranja", "luna", "máquina", "río", "jardín",
      "tren", "cámara", "voz", "nube", "ventana", "bosque", "plata", "montaña", "guitarra", "café",
      "planeta", "estrella", "música", "mantequilla", "flor", "robot", "espejo", "castillo", "lápiz", "tormenta",
    ],
    de: [
      "apfel", "banane", "tisch", "ozean", "traum", "orange", "mond", "maschine", "fluss", "garten",
      "zug", "kamera", "stimme", "wolke", "fenster", "wald", "silber", "berg", "gitarre", "kaffee",
      "planet", "stern", "musik", "butter", "blume", "robo", "spiegel", "schloss", "bleistift", "sturm",
    ],
    it: [
      "mela", "banana", "tavolo", "oceano", "sogno", "arancia", "luna", "macchina", "fiume", "giardino",
      "treno", "camera", "voce", "nuvola", "finestra", "foresta", "argento", "montagna", "chitarra", "caffè",
      "pianeta", "stella", "musica", "burro", "fiore", "robot", "specchio", "castello", "matita", "tempesta",
    ],
    pt: [
      "maçã", "banana", "mesa", "oceano", "sonho", "laranja", "lua", "máquina", "rio", "jardim",
      "trem", "câmera", "voz", "nuvem", "janela", "floresta", "prata", "montanha", "guitarra", "café",
      "planeta", "estrela", "música", "manteiga", "flor", "robô", "espelho", "castelo", "lápis", "tempestade",
    ],
    zh: [
      "苹果", "香蕉", "桌子", "海洋", "梦想", "橙子", "月亮", "机器", "河流", "花园",
      "火车", "相机", "声音", "云朵", "窗户", "森林", "银色", "山脉", "吉他", "咖啡",
      "星球", "星星", "音乐", "黄油", "花朵", "机器人", "镜子", "城堡", "铅笔", "暴风雨",
    ],
    ja: [
      "りんご", "バナナ", "テーブル", "海", "夢", "オレンジ", "月", "機械", "川", "庭",
      "電車", "カメラ", "声", "雲", "窓", "森", "銀", "山", "ギター", "コーヒー",
      "惑星", "星", "音楽", "バター", "花", "ロボット", "鏡", "城", "鉛筆", "嵐",
    ],
    ko: [
      "사과", "바나나", "테이블", "바다", "꿈", "오렌지", "달", "기계", "강", "정원",
      "기차", "카메라", "목소리", "구름", "창문", "숲", "은색", "산", "기타", "커피",
      "행성", "별", "음악", "버터", "꽃", "로봇", "거울", "성", "연필", "폭풍",
    ],
    ru: [
      "яблоко", "банан", "стол", "океан", "мечта", "апельсин", "луна", "машина", "река", "сад",
      "поезд", "камера", "голос", "облако", "окно", "лес", "серебро", "гора", "гитара", "кофе",
      "планета", "звезда", "музыка", "масло", "цветок", "робот", "зеркало", "замок", "карандаш", "буря",
    ]
  };

  const words = wordSets[language as keyof typeof wordSets] || wordSets.en;
  let result: string[] = [];
  const used = new Set(exclude);
  const candidates = words.filter(w => !used.has(w));
  // Defensive: Take min(count, available words)
  while (result.length < count && candidates.length > result.length) {
    const idx = Math.floor(Math.random() * candidates.length);
    const candidate = candidates[idx];
    if (!result.includes(candidate)) {
      result.push(candidate);
    }
  }
  return result;
}

// Audio Recorder hook (simple implementation)
const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    setAudioUrl(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunks.current = [];
    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach(tr => tr.stop());
    };
    setIsRecording(true);
    mediaRecorder.start();
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, audioUrl, start, stop };
};

// Add TTS function for OpenAI (returns an audio URL blob)
async function openaiTTS(text: string, language: string = "en"): Promise<string> {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error("No OpenAI API Key. Please set your OpenAI API Key in Settings.");
  }

  // Map language codes to OpenAI voice options
  const voiceMap: Record<string, string> = {
    en: "nova",
    fr: "nova", 
    es: "nova",
    de: "nova",
    it: "nova",
    pt: "nova",
    zh: "nova",
    ja: "nova", 
    ko: "nova",
    ru: "nova"
  };

  const voice = voiceMap[language] || "nova";

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: voice
    })
  });
  if (!response.ok) {
    throw new Error("TTS generation failed");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

function VoiceControlManager() {
  // Load from localStorage (if exists), otherwise fallback
  const defaultDevices = {};
  const defaultDeviceActions = {};
  const defaultSampleAudio = {};

  // --- Local Storage Recovery ---
  React.useEffect(() => {
    try {
      const devs = localStorage.getItem("voice_devices");
      const acts = localStorage.getItem("voice_device_actions");
      const auds = localStorage.getItem("voice_sample_audio");
      if (devs) setDevices(JSON.parse(devs));
      if (acts) setDeviceActions(JSON.parse(acts));
      if (auds) setSampleAudio(JSON.parse(auds));
    } catch {}
    // eslint-disable-next-line
  }, []);

  // Devices state with proper typing
  const [devices, setDevices] = useState<Record<string, VoiceDevice>>(defaultDevices);

  // Shared state
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedActionName, setSelectedActionName] = useState<string>("");
  const [commandSampleText, setCommandSampleText] = useState<string>("");
  const [deviceActions, setDeviceActions] = useState<DeviceActions>(defaultDeviceActions);

  // Only keep ONE toast reference alive!
  const { toast } = useToast();

  // Device creation dialog state
  const [openCreateDevice, setOpenCreateDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceLanguage, setNewDeviceLanguage] = useState("en");

  // Device edit dialog state
  const [openEditDevice, setOpenEditDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<VoiceDevice | null>(null);
  const [editDeviceName, setEditDeviceName] = useState("");
  const [editDeviceLanguage, setEditDeviceLanguage] = useState("en");

  // Store audio blobs for each sample: { [deviceId]: { [actionName]: { [index]: { word, audioUrl, audioBlob, isConfirmed }[] } } }
  type Sample = { word: string; audioUrl?: string; audioBlob?: Blob; isConfirmed?: boolean };
  const [sampleAudio, setSampleAudio] = useState<Record<string, Record<string, Sample[]>>>(defaultSampleAudio);

  // Persist in localStorage on state change
  React.useEffect(() => {
    localStorage.setItem("voice_devices", JSON.stringify(devices));
  }, [devices]);
  React.useEffect(() => {
    localStorage.setItem("voice_device_actions", JSON.stringify(deviceActions));
  }, [deviceActions]);
  React.useEffect(() => {
    // audioBlob can't be stored, so we omit them during save
    const audioForStorage = JSON.parse(JSON.stringify(sampleAudio, (key, value) => {
      if (key === 'audioBlob') return undefined;
      return value;
    }));
    localStorage.setItem("voice_sample_audio", JSON.stringify(audioForStorage));
  }, [sampleAudio]);

  // On mount, load existing devices only once (removed groups)
  React.useEffect(() => {
    // If we already loaded from localStorage, don't replace with farmAPI
    const devs = localStorage.getItem("voice_devices");
    if (devs) return;
    const load = async () => {
      try {
        const devRes = await farmAPI.getDeviceList();
        if (devRes.status === 0) setDevices(devRes.data);
      } catch (e) {
        toast({ title: "Error", description: "Failed to load devices", variant: "destructive" });
      }
    };
    load();
    // eslint-disable-next-line
  }, []);

  // Handler for renaming a device
  const handleRenameDevice = (deviceId: string, newName: string) => {
    setDevices((prev: Record<string, VoiceDevice>) => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], name: newName }
    }));
    // Persisted by useEffect
  };

  // Handler for removing a device
  const handleRemoveDevice = (deviceId: string) => {
    setDevices((prev: Record<string, VoiceDevice>) => {
      const copy = { ...prev };
      delete copy[deviceId];
      return copy;
    });
    setEnabledActions(prev => {
      const copy = { ...prev };
      delete copy[deviceId];
      return copy;
    });
    setDeviceActions(prev => {
      const copy = { ...prev };
      delete copy[deviceId];
      return copy;
    });
    setSampleAudio(prev => {
      const copy = { ...prev };
      delete copy[deviceId];
      return copy;
    });
    if (selectedDevice === deviceId) setSelectedDevice("");
    if (automationDeviceIds.includes(deviceId)) setAutomationDeviceIds(ids => ids.filter(id => id !== deviceId));
  };

  // Handler for changing device language
  const handleChangeDeviceLanguage = (deviceId: string, lang: string) => {
    setDevices((prev: Record<string, VoiceDevice>) => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], language: lang }
    }));
  };

  // Helper: Ensure device always has a language field
  const getDeviceLanguage = (deviceId: string) =>
    devices?.[deviceId]?.language || "en";

  // When creating a device, use the selected language
  const handleCreateDevice = () => {
    if (!newDeviceName.trim()) {
      toast({ title: "Error", description: "Please enter a device name.", variant: "destructive" });
      return;
    }
    const newId = "dev_" + Math.random().toString(36).substring(2, 10);
    const newDevice = {
      deviceid: newId,
      name: newDeviceName,
      language: newDeviceLanguage
    };
    setDevices((prev: Record<string, VoiceDevice>) => ({ ...prev, [newId]: newDevice }));
    toast({ title: "Device Created!", description: `Device "${newDeviceName}" added.` });
    setNewDeviceName("");
    setNewDeviceLanguage("en");
    setOpenCreateDevice(false);
  };

  // Handler for opening edit dialog
  const handleOpenEditDevice = (device: VoiceDevice) => {
    setEditingDevice(device);
    setEditDeviceName(device.name || device.deviceid);
    setEditDeviceLanguage(device.language || "en");
    setOpenEditDevice(true);
  };

  // Handler for saving device edits
  const handleSaveDeviceEdit = () => {
    if (!editingDevice || !editDeviceName.trim()) {
      toast({ title: "Error", description: "Please enter a device name.", variant: "destructive" });
      return;
    }
    
    setDevices((prev: Record<string, VoiceDevice>) => ({
      ...prev,
      [editingDevice.deviceid]: {
        ...prev[editingDevice.deviceid],
        name: editDeviceName,
        language: editDeviceLanguage
      }
    }));
    
    toast({ title: "Device Updated!", description: `Device "${editDeviceName}" has been updated.` });
    setOpenEditDevice(false);
    setEditingDevice(null);
    setEditDeviceName("");
    setEditDeviceLanguage("en");
  };

  // Auto-generate TTS audio for a word
  const autoGenerateVoice = async (deviceId: string, action: string, idx: number, word: string) => {
    const deviceLanguage = getDeviceLanguage(deviceId);
    try {
      const url = await openaiTTS(word, deviceLanguage);
      setSampleAudio(prev => {
        const actionSamples = prev[deviceId]?.[action]?.slice() || [];
        actionSamples[idx] = { ...actionSamples[idx], audioUrl: url };
        return {
          ...prev,
          [deviceId]: {
            ...(prev[deviceId] || {}),
            [action]: actionSamples,
          }
        };
      });
    } catch (error) {
      // Silently handle voice generation errors
    }
  };

  // Add new action to device (now with random samples, unique per device, using device language)
  const handleAddAction = async () => {
    if (!selectedDevice || !selectedActionName) return;

    const deviceLanguage = getDeviceLanguage(selectedDevice);
    const allWordsInDevice = getAllWordsForDevice(selectedDevice);
    // Generate 5 random words excluding any used so far, using device language
    const randomWords = getRandomWords(5, allWordsInDevice, deviceLanguage);

    setDeviceActions(prev => ({
      ...prev,
      [selectedDevice]: {
        ...prev[selectedDevice],
        [selectedActionName]: { samples: randomWords }
      }
    }));

    // Set up audio records for these samples (no audio yet)
    setSampleAudio(prev => ({
      ...prev,
      [selectedDevice]: {
        ...(prev[selectedDevice] || {}),
        [selectedActionName]: randomWords.map(w => ({ word: w }))
      }
    }));

    // Auto-generate TTS for each word
    randomWords.forEach((word, idx) => {
      autoGenerateVoice(selectedDevice, selectedActionName, idx, word);
    });

    setSelectedActionName("");
  };

  // Add sample (text as placeholder for voice/TTS) to an action (unchanged; extra manual samples allowed)
  const handleAddSample = async () => {
    if (!selectedDevice || !selectedActionName || !commandSampleText) return;
    setDeviceActions(prev => {
      const existing = prev[selectedDevice]?.[selectedActionName]?.samples || [];
      return {
        ...prev,
        [selectedDevice]: {
          ...prev[selectedDevice],
          [selectedActionName]: {
            samples: [...existing, commandSampleText]
          }
        }
      };
    });
    setSampleAudio(prev => {
      const currentSamples = prev[selectedDevice]?.[selectedActionName] || [];
      const newIdx = currentSamples.length;
      return {
        ...prev,
        [selectedDevice]: {
          ...(prev[selectedDevice] || {}),
          [selectedActionName]: [
            ...currentSamples,
            { word: commandSampleText }
          ]
        }
      };
    });

    // Auto-generate TTS for the new word
    const newIdx = (sampleAudio[selectedDevice]?.[selectedActionName] || []).length;
    await autoGenerateVoice(selectedDevice, selectedActionName, newIdx, commandSampleText);
    
    setCommandSampleText("");
  };

  // Handle recording for a specific sample index
  const handleStartRecord = async (deviceId: string, action: string, idx: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setSampleAudio(prev => {
          const actionSamples = prev[deviceId]?.[action]?.slice() || [];
          actionSamples[idx] = { ...actionSamples[idx], audioUrl: url, audioBlob };
          return {
            ...prev,
            [deviceId]: {
              ...(prev[deviceId] || {}),
              [action]: actionSamples,
            }
          };
        });
        stream.getTracks().forEach(tr => tr.stop());
      };
      recorder.start();
      setIsSampleRecording({ deviceId, action, idx, recorder });
    } catch (e) {
      toast({ title: "Mic Error", description: "Microphone not available", variant: "destructive" });
    }
  };

  const [isSampleRecording, setIsSampleRecording] = useState<null | { deviceId: string, action: string, idx: number, recorder: MediaRecorder }> (null);

  const handleStopRecord = () => {
    isSampleRecording?.recorder.stop();
    setIsSampleRecording(null);
  };

  // Play command audio: Play first sample audio blob if present, fallback to toast
  const playVoiceCommand = (deviceId: string, action: string) => {
    const audioArr = sampleAudio[deviceId]?.[action] || [];
    const firstAudio = audioArr.find(s => s.audioUrl);
    if (firstAudio?.audioUrl) {
      const audio = new Audio(firstAudio.audioUrl);
      audio.play();
      toast({ title: "Playing Recording", description: `Playing your recorded sample for ${action}` });
    } else {
      toast({ title: "No recording", description: "No sample audio recording for this action/device.", variant: "destructive" });
    }
  };

  // New: Popup state for setup-in-phone flow
  const [setupInPhoneDialog, setSetupInPhoneDialog] = useState<null | {
    deviceId: string;
    action: string;
    word: string;
  }>(null);

  // Add Word Dialog State
  const [addWordDialog, setAddWordDialog] = useState<null | { deviceId: string, action: string }> (null);
  const [newWordInput, setNewWordInput] = useState("");

  // --- Automation section state ---
  const [automationDeviceIds, setAutomationDeviceIds] = useState<string[]>([]);
  const [automationAction, setAutomationAction] = useState<string>("");

  // Updated predefined actions
  const PREDEFINED_ACTIONS = ["scroll", "tiktok-like", "tiktok-save", "instagram-like"];

  // Store enabled actions per device: fallback to all false
  const [enabledActions, setEnabledActions] = React.useState<Record<string, Record<string, boolean>>>({});

  // On device change, ensure enabledActions is tracked
  React.useEffect(() => {
    if (selectedDevice && !enabledActions[selectedDevice]) {
      setEnabledActions(prev => ({
        ...prev,
        [selectedDevice]: PREDEFINED_ACTIONS.reduce((a, act) => ({ ...a, [act]: false }), {})
      }));
    }
    // eslint-disable-next-line
  }, [selectedDevice]);

  // Handler for manually adding a word to a device's action
  const handleAddWord = async (deviceId: string, action: string, word: string) => {
    if (!word.trim()) return;
    setDeviceActions(prev => {
      const prevSamples = prev[deviceId]?.[action]?.samples || [];
      return {
        ...prev,
        [deviceId]: {
          ...(prev[deviceId] || {}),
          [action]: {
            ...prev[deviceId]?.[action],
            samples: [...prevSamples, word],
          }
        }
      };
    });
    setSampleAudio(prev => {
      const prevArr = prev[deviceId]?.[action] || [];
      const newIdx = prevArr.length;
      const newSampleAudio = {
        ...prev,
        [deviceId]: {
          ...(prev[deviceId] || {}),
          [action]: [...prevArr, { word }],
        }
      };
      
      // Auto-generate TTS for the new word
      autoGenerateVoice(deviceId, action, newIdx, word);
      
      return newSampleAudio;
    });
    setNewWordInput("");
    setAddWordDialog(null);
  };

  // Handler to add a generated word (random) - now uses device language
  const handleAddGeneratedWord = async (deviceId: string, action: string) => {
    const deviceLanguage = getDeviceLanguage(deviceId);
    const existingWords = (deviceActions[deviceId]?.[action]?.samples || []).map((w: string) => w);
    const newRandoms = getRandomWords(5, existingWords, deviceLanguage).filter(w => !existingWords.includes(w));
    if (!newRandoms.length) return;
    const word = newRandoms[0];
    await handleAddWord(deviceId, action, word);
  };

  // Handler to delete a word from a device's action
  const handleDeleteWord = (deviceId: string, action: string, idx: number) => {
    setDeviceActions(prev => {
      const prevSamples = prev[deviceId]?.[action]?.samples || [];
      const newSamples = prevSamples.filter((_, i: number) => i !== idx);
      return {
        ...prev,
        [deviceId]: {
          ...(prev[deviceId] || {}),
          [action]: {
            ...prev[deviceId]?.[action],
            samples: newSamples,
          }
        }
      };
    });
    setSampleAudio(prev => {
      const prevArr = prev[deviceId]?.[action] || [];
      const newArr = prevArr.filter((_, i: number) => i !== idx);
      return {
        ...prev,
        [deviceId]: {
          ...(prev[deviceId] || {}),
          [action]: newArr,
        }
      };
    });
  };

  // Handle toggling actions for selected device - now uses device language for word generation
  const handleToggleAction = async (action: string, checked: boolean) => {
    setEnabledActions(prev => ({
      ...prev,
      [selectedDevice]: {
        ...(prev[selectedDevice] || {}),
        [action]: checked
      }
    }));
    if (checked) {
      const deviceLanguage = getDeviceLanguage(selectedDevice);
      // Ensure uniqueness across all device actions
      const allWordsInDevice = getAllWordsForDevice(selectedDevice);
      const randomWords = getRandomWords(5, allWordsInDevice, deviceLanguage);
      
      setDeviceActions(prev => ({
        ...prev,
        [selectedDevice]: {
          ...(prev[selectedDevice] || {}),
          [action]: prev[selectedDevice]?.[action] || { samples: randomWords }
        }
      }));
      
      setSampleAudio(prev => {
        if (prev[selectedDevice]?.[action]) {
          return prev; // Already exists
        }
        return {
          ...prev,
          [selectedDevice]: {
            ...(prev[selectedDevice] || {}),
            [action]: randomWords.map(w => ({ word: w }))
          }
        };
      });

      // Auto-generate TTS for each word if not already existing
      if (!sampleAudio[selectedDevice]?.[action]) {
        randomWords.forEach((word, idx) => {
          autoGenerateVoice(selectedDevice, action, idx, word);
        });
      }
    }
  };

  // Update data persistence for enabledActions state
  React.useEffect(() => {
    localStorage.setItem("voice_enabled_actions", JSON.stringify(enabledActions));
  }, [enabledActions]);

  // Restore enabledActions on mount
  React.useEffect(() => {
    try {
      const enabled = localStorage.getItem("voice_enabled_actions");
      if (enabled) setEnabledActions(JSON.parse(enabled));
    } catch {}
    // eslint-disable-next-line
  }, []);

  // Add helper for marking sample as confirmed
  function confirmVoiceControlSample(deviceId: string, action: string, word: string) {
    setSampleAudio((prev) => {
      const samples = prev[deviceId]?.[action]?.map((sample) =>
        sample.word === word
          ? { ...sample, isConfirmed: true }
          : sample
      );
      return {
        ...prev,
        [deviceId]: {
          ...(prev[deviceId] || {}),
          [action]: samples || [],
        },
      };
    });
    setSetupInPhoneDialog(null);
    toast({ title: "Command Added", description: "Sample confirmed and added to voice control!" });
  }

  // Loading state for each word audio generation
  const [ttsLoading, setTtsLoading] = useState<{ [key: string]: boolean }>({});

  // Generate voice audio using OpenAI for a specific word sample - now uses device language
  const handleGenerateVoice = async (deviceId: string, action: string, idx: number, word: string) => {
    const deviceLanguage = getDeviceLanguage(deviceId);
    setTtsLoading({ ...ttsLoading, [`${deviceId}_${action}_${idx}`]: true });
    try {
      const url = await openaiTTS(word, deviceLanguage);
      setSampleAudio(prev => {
        const actionSamples = prev[deviceId]?.[action]?.slice() || [];
        actionSamples[idx] = { ...actionSamples[idx], audioUrl: url };
        return {
          ...prev,
          [deviceId]: {
            ...(prev[deviceId] || {}),
            [action]: actionSamples,
          }
        };
      });
      toast({ title: "Voice Generated!", description: `Voice for '${word}' generated successfully.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "TTS Error", description: errorMessage, variant: "destructive" });
    } finally {
      setTtsLoading(ts => ({ ...ts, [`${deviceId}_${action}_${idx}`]: false }));
    }
  };

  const deviceOptionsExist = Object.values(devices).length > 0;

  // --- NEW: Automation controls state for Voice Control Page ---
  // Scroll delay (seconds)
  const [scrollDelayMin, setScrollDelayMin] = useState(2);
  const [scrollDelayMax, setScrollDelayMax] = useState(5);
  // Post interval (posts)
  const [postIntervalMin, setPostIntervalMin] = useState(3);
  const [postIntervalMax, setPostIntervalMax] = useState(6);
  // Behavior Mode
  const [automationMode, setAutomationMode] = useState<'random' | 'like' | 'save'>('random');

  // Optionally, persist in localStorage:
  useEffect(() => {
    const cached = localStorage.getItem("voice_automation_settings");
    if (cached) {
      try {
        const s = JSON.parse(cached);
        if (s && typeof s === 'object') {
          if (typeof s.scrollDelayMin === 'number') setScrollDelayMin(s.scrollDelayMin);
          if (typeof s.scrollDelayMax === 'number') setScrollDelayMax(s.scrollDelayMax);
          if (typeof s.postIntervalMin === 'number') setPostIntervalMin(s.postIntervalMin);
          if (typeof s.postIntervalMax === 'number') setPostIntervalMax(s.postIntervalMax);
          if (['random', 'like', 'save'].includes(s.automationMode)) setAutomationMode(s.automationMode);
        }
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "voice_automation_settings",
      JSON.stringify({ scrollDelayMin, scrollDelayMax, postIntervalMin, postIntervalMax, automationMode })
    );
  }, [scrollDelayMin, scrollDelayMax, postIntervalMin, postIntervalMax, automationMode]);

  // Helper: Get all words for a device (all actions)
  function getAllWordsForDevice(deviceId: string): string[] {
    const da = deviceActions[deviceId] || {};
    const all: string[] = [];
    Object.values(da).forEach((act) => {
      if (Array.isArray(act.samples)) {
        all.push(...act.samples);
      }
    });
    return all;
  }

  // Helper function to get progress for device/action
  const getActionProgress = (deviceId: string, action: string) => {
    const validSamples = (sampleAudio?.[deviceId]?.[action] || []).filter(
      (s) => s.audioUrl && s.isConfirmed
    );
    return validSamples.length;
  };

  // Check if automation can be started
  const canStartAutomation = () => {
    return Object.values(devices).every((dev: VoiceDevice) => {
      const did = dev.deviceid;
      if (!enabledActions[did]) return true;
      
      return PREDEFINED_ACTIONS.every((action) => {
        if (!enabledActions[did][action]) return true;
        return getActionProgress(did, action) >= 5;
      });
    });
  };

  // Handler for launching automation (placeholder for real logic)
  const handleLaunchAutomation = () => {
    toast({
      title: "Automation Started",
      description: "Automation has been launched using your current settings.",
    });
    // TODO: Integrate with standardizedAutomationEngine or your actual automation logic.
  };

  // New: Automation log state
  const [automationLog, setAutomationLog] = React.useState<VoiceAutomationLogEntry[]>([]);

  // Use automation custom hook (might need to pass params)
  const {
    isRunning: isAutomationRunning,
    start: startAutomation,
    stop: stopAutomation,
  } = useVoiceAutomation({
    devices,
    enabledActions,
    sampleAudio,
    automationMode,
    scrollDelayMin,
    scrollDelayMax,
    postIntervalMin,
    postIntervalMax,
    onLog: (entry) =>
      setAutomationLog((prev) => [...prev, entry])
  });

  // Automation Start Handler with validation
  const handleValidatedAutomationStart = () => {
    // For every device and enabled action, ensure there are at least 5 confirmed + audioUrl samples
    const errors: string[] = [];
    const deviceErrors: { [deviceId: string]: string[] } = {};
    
    Object.values(devices).forEach((dev: VoiceDevice) => {
      const did = dev.deviceid;
      const deviceName = dev.name || did;
      if (!enabledActions[did]) return;
      
      const deviceErrorList: string[] = [];
      PREDEFINED_ACTIONS.forEach((action) => {
        if (enabledActions[did][action]) {
          const validSamples = (sampleAudio?.[did]?.[action] || []).filter(
            (s) => s.audioUrl && s.isConfirmed
          );
          if (validSamples.length < 5) {
            let actionDisplayName = action;
            switch(action) {
              case "tiktok-like": actionDisplayName = "TikTok Like"; break;
              case "tiktok-save": actionDisplayName = "TikTok Save"; break;
              case "instagram-like": actionDisplayName = "Instagram Like"; break;
              default: actionDisplayName = action;
            }
            deviceErrorList.push(`${actionDisplayName}: ${validSamples.length}/5 voice commands`);
          }
        }
      });
      
      if (deviceErrorList.length > 0) {
        deviceErrors[did] = deviceErrorList;
        errors.push(`${deviceName}: ${deviceErrorList.join(", ")}`);
      }
    });
    
    if (errors.length) {
      toast({
        title: "Cannot Start Automation",
        description: (
          <div className="space-y-2">
            <p className="font-medium">You need at least 5 confirmed voice commands per enabled action:</p>
            <ul className="text-sm space-y-1">
              {errors.map((error, i) => (
                <li key={i} className="text-red-600">• {error}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Add more words, generate voice audio, and confirm them in "Command setup" section.
            </p>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    
    setAutomationLog((prev) => [
      ...prev,
      {
        timestamp: Date.now(),
        deviceId: "-",
        action: "-",
        word: "-",
        message: "Automation started",
      },
    ]);
    startAutomation();
  };

  // Helper function to get action display name
  const getActionDisplayName = (action: string) => {
    switch(action) {
      case "tiktok-like": return "TikTok Like";
      case "tiktok-save": return "TikTok Save";
      case "instagram-like": return "Instagram Like";
      default: return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Device Management Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Devices management</CardTitle>
            <CardDescription>
              Create and manage devices for use in automations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Devices</h3>
                </div>
                {/* Device List with updated design */}
                <ul className="space-y-4">
                  {Object.values(devices).map((dev: VoiceDevice) =>
                    dev.deviceid && (
                      <li key={dev.deviceid} className="border p-3 rounded flex items-center justify-between bg-muted">
                        <span className="font-medium">{dev.name || dev.deviceid}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditDevice(dev)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveDevice(dev.deviceid)}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    )
                  )}
                </ul>
                <div className="mt-4">
                  <Dialog open={openCreateDevice} onOpenChange={setOpenCreateDevice}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex gap-1 items-center">
                        <Plus className="w-4 h-4" />
                        Create new device
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Device</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Device Name</label>
                          <Input
                            autoFocus
                            placeholder="Device Name"
                            value={newDeviceName}
                            onChange={e => setNewDeviceName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Language</label>
                          <Select value={newDeviceLanguage} onValueChange={setNewDeviceLanguage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="it">Italian</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                              <SelectItem value="ko">Korean</SelectItem>
                              <SelectItem value="ru">Russian</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateDevice}>Add device</Button>
                        <Button variant="ghost" onClick={() => setOpenCreateDevice(false)}>Cancel</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Edit Device Dialog */}
                <Dialog open={openEditDevice} onOpenChange={setOpenEditDevice}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Device</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Device Name</label>
                        <Input
                          autoFocus
                          placeholder="Device Name"
                          value={editDeviceName}
                          onChange={e => setEditDeviceName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Language</label>
                        <Select value={editDeviceLanguage} onValueChange={setEditDeviceLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="ko">Korean</SelectItem>
                            <SelectItem value="ru">Russian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveDeviceEdit}>Save Changes</Button>
                      <Button variant="ghost" onClick={() => setOpenEditDevice(false)}>Cancel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Command setting Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Command setup</CardTitle>
            <CardDescription>
              Record and set voice commands for device actions. <strong>Minimum 5 confirmed voice commands required per action for automation.</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 max-w-md">
              <label className="text-sm font-medium">Device</label>
              <Select
                value={selectedDevice}
                onValueChange={setSelectedDevice}
                disabled={!deviceOptionsExist}
              >
                <SelectTrigger
                  disabled={!deviceOptionsExist}
                  className={!deviceOptionsExist ? "opacity-60 pointer-events-none cursor-not-allowed" : ""}
                  aria-disabled={!deviceOptionsExist}
                >
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(devices).map((dev: VoiceDevice) => (
                    dev.deviceid && (
                      <SelectItem key={dev.deviceid} value={dev.deviceid}>
                        {dev.name || dev.device_name || dev.deviceid}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDevice && deviceOptionsExist && (
              <div>
                {/* 1. Setup voice commands label */}
                <div className="flex flex-col gap-2 mt-4 max-w-md">
                  <label className="text-sm font-medium mb-1">Setup voice commands</label>
                  <div className="flex gap-4">
                    {PREDEFINED_ACTIONS.map(action => {
                      const progress = getActionProgress(selectedDevice, action);
                      const isEnabled = !!enabledActions[selectedDevice]?.[action];
                      const displayName = getActionDisplayName(action);
                      return (
                        <label key={action} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={isEnabled}
                            onChange={e => handleToggleAction(action, e.target.checked)}
                          />
                          <span>{displayName}</span>
                          {isEnabled && (
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              progress >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {progress}/5
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
                {/* 2. Show per-action word list and controls */}
                {enabledActions[selectedDevice] &&
                  Object.entries(enabledActions[selectedDevice]).filter(([, val]) => val).length > 0 && (
                    <div className="mt-6 space-y-4">
                      {PREDEFINED_ACTIONS.filter(
                        act => enabledActions[selectedDevice]?.[act]
                      ).map(action => {
                        // Get the words
                        const wordsList = (sampleAudio[selectedDevice]?.[action] ||
                          deviceActions[selectedDevice]?.[action]?.samples?.map((w: string) => ({ 
                            word: w, 
                            audioUrl: undefined, 
                            isConfirmed: false 
                          })) ||
                          getRandomWords(5, [], getDeviceLanguage(selectedDevice)).map(w => ({ 
                            word: w, 
                            audioUrl: undefined, 
                            isConfirmed: false 
                          }))
                        );
                        const displayName = getActionDisplayName(action);
                        return (
                          <div key={action} className="p-3 border rounded mb-2 bg-muted">
                            <span className="text-base font-semibold">{displayName}</span>
                            <ul className="mt-3 ml-2 space-y-2">
                              {wordsList.map((s, idx) => {
                                const isRec = !!s.audioUrl;
                                const k = `${selectedDevice}_${action}_${idx}`;
                                // New: check if this sample is confirmed
                                const isConfirmed = !!s.isConfirmed;
                                return (
                                  <li key={idx} className="flex flex-wrap items-center gap-3 py-1">
                                    <span className="text-sm font-medium min-w-[72px]">{s.word}</span>
                                    {/* PLAY icon button - now green */}
                                    {isRec && (
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => {
                                          const a = new Audio(s.audioUrl!);
                                          a.play();
                                        }}
                                        aria-label="Play"
                                      >
                                        <Play size={18} />
                                      </Button>
                                    )}
                                    {/* Add custom command button, now green if confirmed */}
                                    {isRec && (
                                      <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        className={isConfirmed
                                          ? "bg-green-600 hover:bg-green-700 text-white"
                                          : "bg-black hover:bg-neutral-800 text-white"
                                        }
                                        onClick={() =>
                                          setSetupInPhoneDialog({
                                            deviceId: selectedDevice,
                                            action,
                                            word: s.word,
                                          })
                                        }
                                      >
                                        {isConfirmed ? "✓ Voice command added" : "Add custom command"}
                                      </Button>
                                    )}
                                    {/* Delete button */}
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="destructive"
                                      aria-label="Delete word"
                                      onClick={() => handleDeleteWord(selectedDevice, action, idx)}
                                    >
                                      <Trash size={16} />
                                    </Button>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="flex gap-2 mt-3">
                              {/* Add Word Manually */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAddWordDialog({ deviceId: selectedDevice, action })
                                }
                              >
                                + Add word
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
            {/* Add Word Dialog */}
            {addWordDialog && (
              <Dialog open={!!addWordDialog} onOpenChange={v => !v && setAddWordDialog(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a custom word</DialogTitle>
                  </DialogHeader>
                  <div>
                    <Input
                      autoFocus
                      value={newWordInput}
                      onChange={e => setNewWordInput(e.target.value)}
                      placeholder="Custom word"
                      className="mb-4"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          handleAddWord(addWordDialog.deviceId, addWordDialog.action, newWordInput)
                        }}
                        disabled={!newWordInput.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setAddWordDialog(null);
                          setNewWordInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {/* POPUP for setup-in-phone */}
            {setupInPhoneDialog && (() => {
              const { deviceId, action, word } = setupInPhoneDialog;
              const displayName = getActionDisplayName(action);
              return (
                <Dialog open={!!setupInPhoneDialog} onOpenChange={v => !v && setSetupInPhoneDialog(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Setup voice command in your phone</DialogTitle>
                    </DialogHeader>
                    <div>
                      <p className="text-sm mb-3 font-semibold">
                        Follow these simple steps to add your voice command for:
                      </p>
                      <ol className="list-decimal ml-5 text-sm space-y-3 mb-6">
                        <li>
                          <div>
                            <span className="font-medium">Activate Voice Control on your phone</span>
                            <div className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded w-fit">
                              Settings &rarr; Accessibility &rarr; <span className="font-semibold">Voice Control: ON</span>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div>
                            <span className="font-medium">Add a new custom command</span>
                            <div className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded w-fit">
                              Voice Control &rarr; Commands &rarr; Custom &rarr; <span className="font-semibold">Create New Command</span>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div>
                            <span className="font-medium">Set the command:</span>
                            <ul className="ml-4 mt-2">
                              <li>
                                <span className="text-xs">Phrase:</span>{" "}
                                <span className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded">{word}</span>
                              </li>
                              <li className="mt-1">
                                <span className="text-xs">Action:</span>{" "}
                                <span className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded">Run Custom Gesture</span>
                              </li>
                            </ul>
                            <div className="ml-4 mt-3">
                              <span className="text-xs text-muted-foreground">
                                ➔ For <span className="font-semibold">{displayName}</span>: Simulate the action by doing the same gesture you'd do manually.<br />
                                <span>
                                  Tip: To help, switch between your social app and settings while recording the gesture.
                                </span>
                              </span>
                            </div>
                          </div>
                        </li>
                      </ol>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-black hover:bg-neutral-800 text-white"
                          onClick={() => {
                            confirmVoiceControlSample(deviceId, action, word);
                          }}
                        >
                          I confirm I've setup the command
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSetupInPhoneDialog(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })()}
          </CardContent>
        </Card>
      </section>

      {/* Automation Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
            <CardDescription>
              Set scroll intervals, post intervals, and choose interaction mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 max-w-lg">
              {/* 1. Scroll Delay (interval) */}
              <div>
                <label className="font-medium block mb-2">Scroll delay (seconds)</label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    step={1}
                    value={scrollDelayMin}
                    onChange={e => setScrollDelayMin(Number(e.target.value))}
                    className="w-24"
                    aria-label="Minimum scroll delay (seconds)"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    min={scrollDelayMin}
                    max={120}
                    step={1}
                    value={scrollDelayMax}
                    onChange={e => setScrollDelayMax(Number(e.target.value))}
                    className="w-24"
                    aria-label="Maximum scroll delay (seconds)"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This delay will be randomly applied to trigger a scroll action, playing one word from your scroll word list at random.
                </p>
              </div>
              {/* 2. Post Interval for interaction (like/save) */}
              <div>
                <label className="font-medium block mb-2">
                  Scroll interval for interaction
                </label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    value={postIntervalMin}
                    onChange={e => setPostIntervalMin(Number(e.target.value))}
                    className="w-24"
                    aria-label="Minimum post interval"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    min={postIntervalMin}
                    max={100}
                    step={1}
                    value={postIntervalMax}
                    onChange={e => setPostIntervalMax(Number(e.target.value))}
                    className="w-24"
                    aria-label="Maximum post interval"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This post interval will be randomly applied to trigger an interaction (like or save), playing one word from the corresponding list at random.
                </p>
              </div>
              {/* 3. Interaction Mode Selection */}
              <div>
                <label className="font-medium block mb-2">Interaction mode</label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="automation-mode"
                      value="random"
                      checked={automationMode === "random"}
                      onChange={() => setAutomationMode("random")}
                    />
                    <span>Random</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="automation-mode"
                      value="like"
                      checked={automationMode === "like"}
                      onChange={() => setAutomationMode("like")}
                    />
                    <span>Only Like</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="automation-mode"
                      value="save"
                      checked={automationMode === "save"}
                      onChange={() => setAutomationMode("save")}
                    />
                    <span>Only Save</span>
                  </label>
                </div>
              </div>
              {/* Optionally, show summary */}
              <div className="mt-4">
                <span className="text-xs text-muted-foreground">
                  Scrolls randomly every <b>{scrollDelayMin}–{scrollDelayMax}</b> seconds.<br />
                  Performs {automationMode === "random" ? "like or save actions" : automationMode} every <b>{postIntervalMin}–{postIntervalMax}</b> posts.
                </span>
              </div>
            </div>
            
            {/* Start/Stop Automation button directly after automation config */}
            <div className="flex flex-col items-center mt-8 gap-3">
              <Button
                size="lg"
                className={`px-8 py-3 rounded font-bold shadow transition-colors ${
                  canStartAutomation() && !isAutomationRunning
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={isAutomationRunning || !canStartAutomation()}
                onClick={handleValidatedAutomationStart}
              >
                {isAutomationRunning ? "Running..." : "Start Automation"}
              </Button>
              {!canStartAutomation() && !isAutomationRunning && (
                <p className="text-sm text-red-600 text-center max-w-md">
                  Complete setup by adding at least 5 confirmed voice commands for each enabled action before starting automation.
                </p>
              )}
              {isAutomationRunning && (
                <Button
                  size="sm"
                  className="bg-red-500 text-white px-4"
                  onClick={stopAutomation}
                  variant="destructive"
                >
                  Stop Automation
                </Button>
              )}
            </div>
            {/* Automation Log */}
            <AutomationLog log={automationLog} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default VoiceControlManager;
