import React, { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import { motion, AnimatePresence } from "framer-motion";

// Use a constant to bypass strict JSX intrinsic checks for the Web Component
const ModelViewer = "model-viewer" as any;

export default function ARScene({ modelData, initialSelectedIndex = 0 }: any) {
  const mvRef = useRef<any>(null);
  const [status, setStatus] = useState<"finding" | "locked" | "placed">("finding");
  const [inAR, setInAR] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const currentProduct = modelData[selectedIndex];

  // Logic: Mirroring the reference code's rescan
  const handleRescan = () => {
    if (!mvRef.current) return;
    const currentSrc = mvRef.current.src;
    mvRef.current.src = ""; // Flash the source to reset tracking
    setTimeout(() => {
      mvRef.current.src = currentSrc;
      setStatus("finding");
    }, 100);
  };

  useEffect(() => {
    setSelectedIndex(initialSelectedIndex);
  }, [initialSelectedIndex]);

  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;

    const onArStatus = (event: any) => {
      setInAR(event.detail.status === "session-started");
      if (event.detail.status === "not-presenting") {
        setStatus("finding");
      }
    };

    const onHitTest = () => {
      if (status !== "placed") {
        setStatus("locked");
      }
    };

    // When the user taps to place, the model becomes 'stable'
    const onSelect = () => {
        if (status === "locked") {
            setStatus("placed");
        }
    };

    mv.addEventListener("ar-status", onArStatus);
    mv.addEventListener("ar-hit-test-achieved", onHitTest);
    mv.addEventListener("click", onSelect); // model-viewer interprets taps as clicks

    return () => {
      mv.removeEventListener("ar-status", onArStatus);
      mv.removeEventListener("ar-hit-test-achieved", onHitTest);
      mv.removeEventListener("click", onSelect);
    };
  }, [status]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "#f8f9fa", overflow: "hidden" }}>
      
      {/* 1. Model Viewer Engine */}
      <ModelViewer
        ref={mvRef}
        src={currentProduct.url}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-placement="floor"
        ar-scale="fixed"
        scale={currentProduct.scale ? `${currentProduct.scale} ${currentProduct.scale} ${currentProduct.scale}` : "1 1 1"}
        camera-controls
        touch-action="pan-y"
        environment-image="neutral"
        exposure="1"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      >
        {/* Launch AR Button Slot */}
        <button slot="ar-button" style={{
          position: "absolute", bottom: "85px", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a1a", color: "white", padding: "16px 40px", borderRadius: "40px",
          border: "none", fontWeight: 700, fontSize: "14px", textTransform: "uppercase",
          letterSpacing: "0.1em", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 1001,
          cursor: "pointer"
        }}>
          START AR Session
        </button>

        {/* 2. Professional HUD Overlay */}
        <AnimatePresence>
          {inAR && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2000 }}
            >
              {/* Rescan Button */}
              <button 
                onClick={handleRescan}
                style={{ 
                    position: "fixed", top: "40px", left: "20px", 
                    background: "rgba(255, 255, 255, 0.9)", border: "none",
                    padding: "12px 18px", borderRadius: "12px", 
                    fontWeight: "bold", fontSize: "13px", color: "#1a1a1a",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)", pointerEvents: "auto"
                }}
              >
     RESCAN FLOOR
              </button>

              {/* Status Instructional Text */}
              {status !== "placed" && (
                <div style={{ position: "fixed", top: "15%", width: "100%", textAlign: "center" }}>
                    <motion.p 
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        style={{ 
                            background: status === "locked" ? "rgba(0, 128, 0, 0.85)" : "rgba(0, 0, 0, 0.75)",
                            color: "white", display: "inline-block", padding: "14px 28px", 
                            borderRadius: "50px", fontSize: "15px", fontWeight: 500,
                            backdropFilter: "blur(5px)", boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
                        }}
                    >
                    {status === "locked" ? "Floor locked. Tap to place." : "Scanning floor... move phone side-to-side."}
                    </motion.p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ModelViewer>

      {/* Product Information Card (always visible on desktop/initial load) */}
      {!inAR && (
          <div style={{
            position: "absolute",
            top: "50px",
            left: "20px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "24px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <img 
                src={currentProduct.image} 
                alt={currentProduct.name} 
                style={{ width: "60px", height: "60px", borderRadius: "16px", objectFit: "cover" }} 
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1a1a1a", fontWeight: 700 }}>{currentProduct.name}</h3>
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Ready for Staging</p>
            </div>
          </div>
      )}
    </div>
  );
}
