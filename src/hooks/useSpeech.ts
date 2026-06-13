import { useState, useCallback, useEffect, useRef } from 'react';
import { Building } from '../algorithms/graph';
import { PathResult } from '../algorithms/dijkstra';
import { supportsSpeechSynthesis } from '../utils/helpers';

interface UseSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  narrateRoute: (route: PathResult) => void;
  narrateBuilding: (building: Building) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = supportsSpeechSynthesis();

  useEffect(() => {
    if (!isSupported) return;

    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);

    window.speechSynthesis.onvoiceschanged = () => {};

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) => voice.lang.startsWith('en') && voice.localService
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const narrateRoute = useCallback((route: PathResult) => {
    if (!isSupported) return;

    const buildingCount = route.buildings.length;
    const distance = Math.round(route.distance);
    const startBuilding = route.buildings[0]?.name || 'Starting point';
    const endBuilding = route.buildings[buildingCount - 1]?.name || 'Destination';

    let narration = `Navigation started from ${startBuilding} to ${endBuilding}. `;
    narration += `The route covers ${buildingCount} locations with a total distance of approximately ${distance} meters. `;
    narration += `It will take about ${Math.ceil(distance / 83)} minutes to walk. `;
    narration += `Following the route: `;

    route.buildings.forEach((building, index) => {
      if (index === 0) {
        narration += `Start at ${building.name}. `;
      } else if (index === buildingCount - 1) {
        narration += `Finally, arrive at ${building.name}.`;
      } else {
        narration += `Pass through ${building.name}. `;
      }
    });

    speak(narration);
  }, [isSupported, speak]);

  const narrateBuilding = useCallback((building: Building) => {
    if (!isSupported) return;

    const description = `${building.name}. ${building.description}. Type: ${building.type}.`;
    speak(description);
  }, [isSupported, speak]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    narrateRoute,
    narrateBuilding,
  };
}

export default useSpeech;
