type GradientEllipseProps = Readonly<{
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "custom";
  customPosition?: Readonly<{
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  }>;
  width?: string;
  height?: string;
  opacity?: number;
  color?: string;
  blur?: string;
  zIndex?: number;
}>;

export default function GradientEllipse({
  position = "center",
  customPosition,
  width = "40%",
  height = "40%",
  opacity = 0.5,
  color = "#1E99A2",
  blur = "80px",
  zIndex = -1,
}: GradientEllipseProps) {
  const getPositionStyles = () => {
    if (position === "custom" && customPosition) {
      return customPosition;
    }

    switch (position) {
      case "top-left":
        return { top: "0", left: "0", transform: "translate(-30%, -30%)" };
      case "top-center":
        return { top: "0", left: "50%", transform: "translate(-50%, -30%)" };
      case "top-right":
        return { top: "0", right: "0", transform: "translate(30%, -30%)" };
      case "center-left":
        return { top: "50%", left: "0", transform: "translate(-30%, -50%)" };
      case "center":
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      case "center-right":
        return { top: "50%", right: "0", transform: "translate(30%, -50%)" };
      case "bottom-left":
        return { bottom: "0", left: "0", transform: "translate(-30%, 30%)" };
      case "bottom-center":
        return { bottom: "0", left: "50%", transform: "translate(-50%, 30%)" };
      case "bottom-right":
        return { bottom: "0", right: "0", transform: "translate(30%, 30%)" };
      default:
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width,
        height,
        zIndex,
        ...getPositionStyles(),
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: color,
          opacity,
          filter: `blur(${blur})`,
        }}
      />
    </div>
  );
}
