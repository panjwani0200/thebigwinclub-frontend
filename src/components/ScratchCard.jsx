import { useEffect, useRef, useState } from "react";
import "./ScratchCard.css";

export default function ScratchCard({ result, onReveal }) {
  const canvasRef = useRef(null);
  const [scratched, setScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 300;
    canvas.height = 150;

    // Grey scratch layer
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "destination-out";
  }, []);

  const scratch = (e) => {
    if (scratched) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x =
      (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y =
      (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Reveal after little scratch
    setTimeout(() => {
      setScratched(true);
      onReveal();
    }, 800);
  };

  return (
    <div className="scratch-wrapper">
      <div className="result-text">
        {result === "WIN" ? "🎉 YOU WIN" : "😢 YOU LOSE"}
      </div>

      {!scratched && (
        <canvas
          ref={canvasRef}
          onMouseMove={scratch}
          onTouchMove={scratch}
        />
      )}
    </div>
  );
}
