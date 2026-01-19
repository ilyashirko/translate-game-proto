import { useRef, useState } from "react";
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

  // 1️⃣ Кнопка СТАРТ — запрашивает разрешения
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

  // 2️⃣ Кнопка FULLSCREEN — включает полноэкранный режим
  const handleFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Fullscreen failed:", err);
    }
  };

  // 3️⃣ Кнопка SAY IT — старт распознавания речи
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech API not supported");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onstart = () => setStatus("listening");
    rec.onend = () => setStatus("idle");
    rec.onerror = () => setStatus("idle");

    rec.onresult = e => {
      const text = e.results[0][0].transcript.toLowerCase();
      setHeard(text);
      if (text.includes(WORDS[current].native)) success();
      else error();
    };

    recognitionRef.current = rec;
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
              <button onClick={handleStart} className="demoButton">
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
