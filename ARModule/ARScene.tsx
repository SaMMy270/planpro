import React, { useEffect, useRef } from "react";

interface Props {
  model: string;
}

const ARScene: React.FC<Props> = ({ model }) => {
  const modelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Dynamic import for the custom element side-effects
    import("@google/model-viewer");
  }, []);

  if (!model) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>;
  }

  // We use React.createElement to avoid JSX validation errors
  return React.createElement(
    "model-viewer",
    {
      ref: modelRef,
      src: model,
      ar: true,
      "ar-modes": "webxr scene-viewer quick-look",
      "ar-placement": "floor",
      "camera-controls": true,
      "auto-rotate": true,
      "shadow-intensity": "1",
      style: {
        width: "100%",
        height: "80vh",
        background: "#eaeaea",
      },
    },
    // Children (the AR button)
    React.createElement(
      "button",
      {
        slot: "ar-button",
        style: {
          position: "absolute",
          bottom: "16px",
          right: "16px",
          // Add your styling here
        },
      },
      "View in your room"
    )
  );
};

export default ARScene;