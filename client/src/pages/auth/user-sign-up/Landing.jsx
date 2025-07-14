import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GradientBackground } from "react-gradient-animation";

const blinkKeyframes = `
@keyframes softBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.1; }
}`;

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleContinue = () => navigate("/auth/login");
    window.addEventListener("keydown", handleContinue);
    window.addEventListener("mousedown", handleContinue);
    return () => {
      window.removeEventListener("keydown", handleContinue);
      window.removeEventListener("mousedown", handleContinue);
    };
  }, [navigate]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <style>{blinkKeyframes}</style>
      <GradientBackground
        colors={{
          background: "#e6f4fa",
          particles: [
            "#7fd8e7",
            "#ffd6a0",
            "#b8aaff",
          ],
        }}
        count={14}
        size={{ min: 1800, max: 2600, pulse: 0.5 }}
        speed={{ x: { min: 0.4, max: 1.2 }, y: { min: 0.4, max: 1.2 } }}
        blending="lighten"
        opacity={{ center: 0.18, edge: 0.05 }}
        shapes={["c"]}
        skew={0}
        style={{ opacity: 1 }}
      />
      <img
        src={"/logo.png"}
        alt="Mobius Logo"
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "320px",
          maxWidth: "80vw",
          height: "auto",
          zIndex: 10,
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.10))"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "calc(42% + 80px)",
          left: "50%",
          transform: "translate(-50%, 0)",
          color: "#8a8fa3",
          fontSize: "1.18rem",
          fontWeight: 500,
          fontStyle: "italic",
          letterSpacing: "0.04em",
          zIndex: 11,
          animation: "softBlink 3s infinite"
        }}
      >
        Interact to continue
      </div>
    </div>
  );
} 