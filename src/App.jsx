import { useEffect, useRef, useState } from "react";
import './index.css'

const WORDS = [
  { foreign: "apple", native: "яблоко" },
  { foreign: "house", native: "дом" },
  { foreign: "water", native: "вода" },
];

export default function App() {
  const videoRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | listening | success | error
  const [heard, setHeard] = useState("");
  const [isDemo, setIsDemo] = useState(false)
  const recognitionRef = useRef(null);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(); // для Safari
    }
    setIsDemo(true); // сразу запускаем игру/распознавание
  };

  // Camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    }).then(stream => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  // Speech recognition
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech API not supported");
      return;
    }

    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = "ru-RU";
      rec.interimResults = false;
      rec.continuous = false;

      rec.onstart = () => {
        console.log("🎤 listening");
        setStatus("listening");
      };

      rec.onend = () => {
        console.log("🛑 stopped");
        setStatus("idle");
      };

      rec.onerror = e => {
        console.error("Speech error", e);
        setStatus("idle");
      };

      rec.onresult = e => {
        const text = e.results[0][0].transcript.toLowerCase();
        setHeard(text);

        if (text.includes(WORDS[current].native)) {
          success();
        } else {
          error();
        }
      };

      recognitionRef.current = rec;
    }

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus("idle");
    }
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
            {isDemo ? (
              <>
                <div className="word jump">{WORDS[current].foreign}</div>
                {heard && <div className="heard">You said: {heard}</div>}
                {status === "idle" && (
                  <button onClick={startListening} className="mic">
                    🎤 SAY IT
                  </button>
                )}

                {status === "listening" && (
                  <>
                    <button className="mic listening">
                      👂 СЛУШАЮ…
                    </button>
                    <button onClick={stopListening} className="cancelButton">
                      отмена
                    </button>
                  </>
                )}
              </>
            ) : (
              <button onClick={enterFullscreen} className="demoButton">
                Enter demo mode
              </button>
            )}

            
          </div>
        </div>
      </div>

    </div>
  );
}




