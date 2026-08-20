import * as React from "react";
import {
  motion,
  stagger as motionStagger,
  useAnimate,
  type Transition,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const radiusFromPercent = (width: number, height: number, percent: number) =>
  (Math.min(width, height) / 2) * (Math.max(0, Math.min(100, percent)) / 100);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const TRANSPARENT_SPLIT =
  "0px 0px 0px rgba(255,0,80,0), 0px 0px 0px rgba(0,220,255,0)";
const SECONDS_AT_SPEED_1 = 10;
const SCAN_BAND = 65;
const SCAN_FROM = "-100%";
const SCAN_TO = `${(100 / SCAN_BAND) * 100}%`;
const IDLE_BRACKET = 8;
const HOVER_BRACKET = 65;

type Colors = {
  fill?: string;
  textColor?: string;
  hoverFill?: string;
  hoverTextColor?: string;
};

type ScanConfig = {
  color?: string;
  speed?: number;
};

type ScanGridButtonProps = {
  label?: string;
  padding?: string;
  rounded?: number;
  colors?: Colors;
  gap?: number;
  border?: React.CSSProperties;
  glitchIntensity?: number;
  scan?: ScanConfig;
  transition?: Transition;
  className?: string;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
};

const borderWidthOf = (border: React.CSSProperties | undefined) => {
  const read = (value: unknown) => {
    const number = Number.parseFloat(String(value ?? ""));
    return Number.isFinite(number) && number > 0 ? number : 0;
  };

  return Math.max(
    read(border?.borderWidth),
    read(border?.borderTopWidth),
    read(border?.borderRightWidth),
    read(border?.borderBottomWidth),
    read(border?.borderLeftWidth)
  );
};

const armFor = (percent: number, width: number, height: number) =>
  ((percent / 100) * Math.min(width, height)) / 2;

const getCornerPaths = (
  width: number,
  height: number,
  radius: number,
  arm: number
) => {
  const clampedRadius = Math.min(radius, width / 2, height / 2);
  const strokeOffset = 0.75;
  const innerRadius = Math.max(0.01, clampedRadius - strokeOffset);
  const availableHeight = Math.max(0, height / 2 - clampedRadius);
  const availableWidth = Math.max(0, width / 2 - clampedRadius);
  const armHeight = Math.min(arm, availableHeight);
  const armWidth = Math.min(arm, availableWidth);

  return {
    tl: `M ${strokeOffset} ${clampedRadius + armHeight} L ${strokeOffset} ${clampedRadius} A ${innerRadius} ${innerRadius} 0 0 1 ${clampedRadius} ${strokeOffset} L ${clampedRadius + armWidth} ${strokeOffset}`,
    tr: `M ${width - clampedRadius - armWidth} ${strokeOffset} L ${width - clampedRadius} ${strokeOffset} A ${innerRadius} ${innerRadius} 0 0 1 ${width - strokeOffset} ${clampedRadius} L ${width - strokeOffset} ${clampedRadius + armHeight}`,
    br: `M ${width - strokeOffset} ${height - clampedRadius - armHeight} L ${width - strokeOffset} ${height - clampedRadius} A ${innerRadius} ${innerRadius} 0 0 1 ${width - clampedRadius} ${height - strokeOffset} L ${width - clampedRadius - armWidth} ${height - strokeOffset}`,
    bl: `M ${clampedRadius + armWidth} ${height - strokeOffset} L ${clampedRadius} ${height - strokeOffset} A ${innerRadius} ${innerRadius} 0 0 1 ${strokeOffset} ${height - clampedRadius} L ${strokeOffset} ${height - clampedRadius - armHeight}`,
  };
};

export function ScanGridButton({
  label = "STEMARCADE",
  padding = "10px 12px",
  rounded = 0,
  colors = {
    fill: "#000000",
    hoverFill: "#000000",
    textColor: "#FFFFFF",
    hoverTextColor: "#FFFFFF",
  },
  border = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  glitchIntensity = 0,
  scan = { color: "#FF5722", speed: 50 },
  transition = { type: "tween", ease: "easeInOut", duration: 0.3 },
  className,
  variant,
  onClick,
}: ScanGridButtonProps) {
  const fill = colors.fill ?? "#000000";
  const textColor = colors.textColor ?? "#FFFFFF";
  const hoverFill = colors.hoverFill ?? "#000000";
  const hoverTextColor = colors.hoverTextColor ?? "#FFFFFF";
  const scanColor = scan.color ?? "#FF8400";
  const speed =
    5 * (Math.max(0, Math.min(100, Math.round(scan.speed ?? 50))) / 50);
  const [scope, animate] = useAnimate();
  const [radiusBox, setRadiusBox] = useState({ width: 0, height: 0 });
  const [dimensions, setDimensions] = useState({ width: 160, height: 48 });
  const scanLoopRef = useRef<{ stop: () => void } | null>(null);
  const glitchTimerRef = useRef<number[]>([]);
  const hovered = useRef(false);

  const clearGlitchTimers = useCallback(() => {
    glitchTimerRef.current.forEach(timer => window.clearTimeout(timer));
    glitchTimerRef.current = [];
  }, []);

  const setCharacterShadow = useCallback(
    (shadow: string) => {
      const characters = (
        scope.current as HTMLElement | null
      )?.querySelectorAll(".char");
      characters?.forEach(character => {
        (character as HTMLElement).style.textShadow = shadow;
      });
    },
    [scope]
  );

  useIsoLayoutEffect(() => {
    const element = scope.current as HTMLElement | null;
    if (!element) return;
    const read = () =>
      setRadiusBox(previous =>
        previous.width === element.offsetWidth &&
        previous.height === element.offsetHeight
          ? previous
          : { width: element.offsetWidth, height: element.offsetHeight }
      );
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [scope]);

  useLayoutEffect(() => {
    const element = scope.current as HTMLElement | null;
    if (!element) return;
    const read = () => {
      if (element.clientWidth > 0 && element.clientHeight > 0) {
        setDimensions({
          width: element.clientWidth,
          height: element.clientHeight,
        });
      }
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [scope]);

  const radius = radiusFromPercent(radiusBox.width, radiusBox.height, rounded);
  const borderWidth = borderWidthOf(border);
  const bracketRadius = Math.max(0, radius - borderWidth);
  const initialPaths = useMemo(
    () =>
      getCornerPaths(
        dimensions.width,
        dimensions.height,
        bracketRadius,
        armFor(IDLE_BRACKET, dimensions.width, dimensions.height)
      ),
    [dimensions.height, dimensions.width, bracketRadius]
  );

  const resetToIdle = useCallback(() => {
    if (!scope.current) return;
    scanLoopRef.current?.stop();
    scanLoopRef.current = null;
    clearGlitchTimers();
    setCharacterShadow(TRANSPARENT_SPLIT);
    animate(
      scope.current,
      { backgroundColor: fill, color: textColor },
      { duration: 0 }
    );

    const paths = getCornerPaths(
      dimensions.width,
      dimensions.height,
      bracketRadius,
      armFor(IDLE_BRACKET, dimensions.width, dimensions.height)
    );
    const filter = `drop-shadow(0px 0px 0px ${scanColor})`;
    animate(".bracket-tl", { d: paths.tl, filter }, { duration: 0 });
    animate(".bracket-tr", { d: paths.tr, filter }, { duration: 0 });
    animate(".bracket-br", { d: paths.br, filter }, { duration: 0 });
    animate(".bracket-bl", { d: paths.bl, filter }, { duration: 0 });
    animate(".scanline", { y: SCAN_FROM, opacity: 0 }, { duration: 0 });
    animate(".char", { x: 0 }, { duration: 0 });
  }, [
    animate,
    bracketRadius,
    dimensions.height,
    dimensions.width,
    fill,
    scanColor,
    scope,
    textColor,
  ]);

  const runHover = useCallback(() => {
    if (!scope.current) return;
    hovered.current = true;
    animate(
      scope.current,
      { backgroundColor: hoverFill, color: hoverTextColor },
      transition
    );

    const paths = getCornerPaths(
      dimensions.width,
      dimensions.height,
      bracketRadius,
      armFor(HOVER_BRACKET, dimensions.width, dimensions.height)
    );
    const filter = `drop-shadow(0px 0px 4px ${scanColor})`;
    animate(".bracket-tl", { d: paths.tl, filter }, transition);
    animate(".bracket-tr", { d: paths.tr, filter }, transition);
    animate(".bracket-br", { d: paths.br, filter }, transition);
    animate(".bracket-bl", { d: paths.bl, filter }, transition);

    scanLoopRef.current?.stop();
    animate(".scanline", { opacity: 1 }, { duration: 0.15 });
    scanLoopRef.current = animate(
      ".scanline",
      { y: [SCAN_FROM, SCAN_TO] },
      {
        duration: SECONDS_AT_SPEED_1 / Math.max(1, speed),
        ease: "linear",
        repeat: Infinity,
      }
    );
    animate(
      ".char",
      {
        x: [0, -glitchIntensity, glitchIntensity, -glitchIntensity, 0],
      },
      { duration: 0.32, ease: "easeOut", delay: motionStagger(0.03) }
    );
    if (glitchIntensity > 0) {
      clearGlitchTimers();
      const shadows = [
        TRANSPARENT_SPLIT,
        `${glitchIntensity}px 0px 0px rgba(255,0,80,0.75), ${-glitchIntensity}px 0px 0px rgba(0,220,255,0.75)`,
        `${-glitchIntensity}px 0px 0px rgba(255,0,80,0.75), ${glitchIntensity}px 0px 0px rgba(0,220,255,0.75)`,
        `${glitchIntensity}px 0px 0px rgba(255,0,80,0.75), ${-glitchIntensity}px 0px 0px rgba(0,220,255,0.75)`,
        TRANSPARENT_SPLIT,
      ];
      glitchTimerRef.current = shadows.map((shadow, index) =>
        window.setTimeout(() => setCharacterShadow(shadow), index * 80)
      );
    }
  }, [
    animate,
    bracketRadius,
    dimensions.height,
    dimensions.width,
    glitchIntensity,
    hoverFill,
    hoverTextColor,
    scanColor,
    scope,
    speed,
    transition,
  ]);

  const runLeave = useCallback(() => {
    if (!scope.current) return;
    hovered.current = false;
    animate(
      scope.current,
      { backgroundColor: fill, color: textColor },
      transition
    );
    const paths = getCornerPaths(
      dimensions.width,
      dimensions.height,
      bracketRadius,
      armFor(IDLE_BRACKET, dimensions.width, dimensions.height)
    );
    const filter = `drop-shadow(0px 0px 0px ${scanColor})`;
    animate(".bracket-tl", { d: paths.tl, filter }, transition);
    animate(".bracket-tr", { d: paths.tr, filter }, transition);
    animate(".bracket-br", { d: paths.br, filter }, transition);
    animate(".bracket-bl", { d: paths.bl, filter }, transition);
    const loop = scanLoopRef.current;
    clearGlitchTimers();
    setCharacterShadow(TRANSPARENT_SPLIT);
    animate(".scanline", { opacity: 0 }, { duration: 0.2 }).then(() =>
      loop?.stop()
    );
    animate(".char", { x: 0 }, transition);
  }, [
    animate,
    bracketRadius,
    dimensions.height,
    dimensions.width,
    fill,
    scanColor,
    scope,
    textColor,
    transition,
  ]);

  useEffect(() => {
    if (hovered.current) runHover();
    else resetToIdle();
  }, [resetToIdle, runHover]);

  useEffect(
    () => () => {
      scanLoopRef.current?.stop();
      clearGlitchTimers();
    },
    [clearGlitchTimers]
  );

  const chars = useMemo(() => label.split(""), [label]);

  return (
    <motion.button
      ref={scope}
      type="button"
      aria-label={label}
      data-stemarcade-variant={variant}
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 1,
        minHeight: 1,
        width: "100%",
        padding,
        ...border,
        borderRadius: radius,
        background: fill,
        color: textColor,
        cursor: "pointer",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={runHover}
      onMouseLeave={runLeave}
      onFocus={runHover}
      onBlur={runLeave}
      onClick={() => {
        runHover();
        onClick?.();
      }}
    >
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
          zIndex: 2,
        }}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
      >
        <motion.path
          className="bracket-tl"
          d={initialPaths.tl}
          stroke={scanColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <motion.path
          className="bracket-tr"
          d={initialPaths.tr}
          stroke={scanColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <motion.path
          className="bracket-br"
          d={initialPaths.br}
          stroke={scanColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <motion.path
          className="bracket-bl"
          d={initialPaths.bl}
          stroke={scanColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div
        className="scanline"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: `${SCAN_BAND}%`,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${scanColor} 45%, transparent) 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 2,
            background: scanColor,
            boxShadow: `0px 0px 6px 0px ${scanColor}`,
          }}
        />
      </div>
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          zIndex: 3,
          display: "inline-block",
          whiteSpace: "pre-wrap",
        }}
      >
        {chars.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="char"
            style={{
              display: "inline-block",
              color: index < 4 ? "#FFFFFF" : "#FF8400",
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </motion.button>
  );
}
