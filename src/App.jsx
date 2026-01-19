import { useRef, useState, useEffect } from "react";
import './index.css'

const WORDS = [
  { foreign: "apple", native: "яблоко" },
  { foreign: "house", native: "дом" },
  { foreign: "water", native: "вода" },
];

export default function App() {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | listening | success | error
  const [heard, setHeard] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false); // разрешения получены
  const [isFullscreen, setIsFullscreen] = useState(false); // fullscreen включен

  // ⚡ создаём объект распознавания заранее
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = true;  // промежуточные результаты для быстрого отклика
    rec.continuous = false;

    rec.onstart = () => setStatus("listening");
    rec.onend = () => setStatus("idle");
    rec.onerror = () => setStatus("idle");

    rec.onresult = e => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
        .toLowerCase()
        .trim();
      setHeard(text);

      // проверка с очисткой текста
      const expected = WORDS[current].native.toLowerCase().trim();
      if (text.includes(expected)) success();
    };

    recognitionRef.current = rec;
  }, [current]);

  // кнопка СТАРТ
  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Permission denied:", err);
      alert("Нужны разрешения на камеру и микрофон");
    }
  };

  // кнопка FULLSCREEN
  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen().catch(() => {});
    }
    setIsFullscreen(true);
  };

  // запуск распознавания
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech API not supported");
      return;
    }
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setStatus("idle");
  };

  const success = () => {
    setStatus("success");
    playSound("success");
    setTimeout(() => {
      setStatus("idle");
      setHeard("");
      setCurrent((current + 1) % WORDS.length);
    }, 1200);
  };

  const error = () => {
    setStatus("error");
    playSound("fail");
    setTimeout(() => {
      setStatus("idle");
      setHeard("");
    }, 1000);
  };

  const playSound = type => {
    const audio = new Audio(
      type === "success" ? "/sounds/success.mp3" : "/sounds/fail.mp3"
    );
    audio.play();
  };

  return (
    <div className={`app ${status}`}>
      <video ref={videoRef} autoPlay playsInline muted />

      <div className="overlay">
        <div className="road">
          <div className={`box ${status}`}>
            {!isCameraOn && (
              <button 
                onClick={() => {
                  recognitionRef.current?.start(); // старт прямо в клике
                }} 
              className="demoButton">
                СТАРТ
              </button>
            )}

            {isCameraOn && !isFullscreen && (
              <button onClick={handleFullscreen} className="demoButton">
                FULLSCREEN
              </button>
            )}

            {isCameraOn && isFullscreen && status === "idle" && (
              <>
                <div className="word jump">{WORDS[current].foreign}</div>
                {heard && <div className="heard">You said: {heard}</div>}
                <button onClick={startListening} className="mic">
                  🎤 SAY IT
                </button>
              </>
            )}

            {status === "listening" && (
              <>
                <button className="mic listening">👂 СЛУШАЮ…</button>
                <button onClick={stopListening} className="cancelButton">
                  отмена
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
