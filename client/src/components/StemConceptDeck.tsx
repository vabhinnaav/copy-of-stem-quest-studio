import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type WheelEvent,
} from "react";

type TitleCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface Slide {
  title: string;
  symbol: string;
  accent: string;
}

interface Smooth3DSlideshowProps {
  slides?: Slide[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tilt?: number;
  sideTilt?: number;
  gap?: number;
  opacity?: number;
  transition?: { duration?: number; ease?: string | number[]; delay?: number };
  autoplay?: boolean;
  showTitle?: boolean;
  titleFont?: CSSProperties;
  titleColor?: string;
  titlePosition?: {
    position?: TitleCorner;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
  };
  style?: CSSProperties;
}

const STEM_SLIDES: Slide[] = [
  { title: "Physics", symbol: "⚛", accent: "#59d8ff" },
  { title: "Chemistry", symbol: "⌘", accent: "#8a7dff" },
  { title: "Math", symbol: "π", accent: "#ff9b46" },
  { title: "Coding", symbol: "∑", accent: "#59d18c" },
];

const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
const DEPTH = 240;

function cssTransition(transition: Smooth3DSlideshowProps["transition"]) {
  const duration = transition?.duration ?? 0.6;
  let ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  if (Array.isArray(transition?.ease) && transition.ease.length === 4) {
    ease = `cubic-bezier(${transition.ease.join(", ")})`;
  } else if (typeof transition?.ease === "string") {
    const map: Record<string, string> = {
      linear: "linear",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    };
    ease = map[transition.ease] || "ease";
  }
  return { duration, ease };
}

function OriginkitBaseSmooth3DSlideshow(props: Smooth3DSlideshowProps) {
  const {
    slides = STEM_SLIDES,
    cardWidth = 400,
    cardHeight = 400,
    radius = 3,
    tilt = 12,
    sideTilt = 8,
    gap = 8,
    opacity = 60,
    transition = {
      duration: 0.6,
      delay: 2.5,
      ease: [0.22, 1, 0.36, 1],
    },
    autoplay = false,
    showTitle = true,
    titleFont = {
      fontFamily: "Inter",
      fontSize: "28px",
      letterSpacing: "-0.02em",
      lineHeight: "1.1em",
    },
    titleColor = "#ffffff",
    titlePosition = {
      position: "bottomLeft",
      paddingLeft: 22,
      paddingRight: 22,
      paddingTop: 24,
      paddingBottom: 24,
    },
    style,
  } = props;

  const list = slides.length ? slides : STEM_SLIDES;
  const count = list.length;
  const [active, setActive] = useState(0);
  const lockRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);
  const { duration, ease } = cssTransition(transition);

  useEffect(() => {
    setActive(current => Math.max(0, Math.min(count - 1, current)));
  }, [count]);

  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(
      () => {
        lockRef.current = false;
      },
      Math.max(50, duration * 1000)
    );
  }, [duration]);

  const step = useCallback(
    (direction: number) => {
      if (lockRef.current) return;
      lock();
      setActive(current => (((current + direction) % count) + count) % count);
    },
    [count, lock]
  );

  const handleCardClick = useCallback(
    (index: number) => {
      if (autoplay || lockRef.current) return;
      lock();
      setActive(current => (index === current ? (current + 1) % count : index));
    },
    [autoplay, count, lock]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    },
    [step]
  );

  const onWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (Math.abs(event.deltaX) < 2 && Math.abs(event.deltaY) < 2) return;
      event.preventDefault();
      step(event.deltaX + event.deltaY > 0 ? 1 : -1);
    },
    [step]
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") touchStartRef.current = event.clientX;
    },
    []
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (start === null || event.pointerType !== "touch") return;
      const distance = event.clientX - start;
      if (Math.abs(distance) < 32) return;
      step(distance < 0 ? 1 : -1);
    },
    [step]
  );

  const titleCorner = titlePosition.position ?? "bottomLeft";
  const isTop = titleCorner === "topLeft" || titleCorner === "topRight";
  const isRight = titleCorner === "topRight" || titleCorner === "bottomRight";
  const effectiveRadius =
    (Math.max(0, Math.min(20, radius)) / 20) *
    (Math.min(cardWidth, cardHeight) / 2);
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;
  const transitionCss = `transform ${duration}s ${ease}, opacity ${duration}s ${ease}`;

  return (
    <div
      style={{
        ...(style ?? {}),
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 320,
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${PERSPECTIVE}px`,
        overflow: "hidden",
        outline: "none",
      }}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="STEM concept deck"
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        touchStartRef.current = null;
      }}
    >
      <div
        style={{
          position: "relative",
          width: cardWidth,
          height: cardHeight,
          transformStyle: "preserve-3d",
        }}
      >
        {list.map((slide, index) => {
          let relative = index - active;
          if (relative > count / 2) relative -= count;
          if (relative < -count / 2) relative += count;

          const absolute = Math.abs(relative);
          const visible = absolute <= MAX_VISIBLE;
          const isActive = relative === 0;
          const scale = Math.max(0.4, 1 - absolute * SCALE_STEP);
          const translateX = relative * (gap * 30);
          const translateZ = -absolute * DEPTH;
          const rotateY = -relative * tilt;
          const rotateZ = relative * sideTilt;
          const cardStyle: CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: cardWidth,
            height: cardHeight,
            borderRadius: effectiveRadius,
            overflow: "hidden",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
            transition: transitionCss,
            opacity: visible ? 1 : 0,
            cursor: autoplay || isActive ? "default" : "pointer",
            pointerEvents: visible && !autoplay ? "auto" : "none",
            background: `radial-gradient(circle at 30% 20%, ${slide.accent}55, transparent 38%), #0b0b0d`,
            border: `1px solid ${slide.accent}80`,
          };

          return (
            <div
              key={slide.title}
              style={cardStyle}
              onClick={() => handleCardClick(index)}
              aria-label={slide.title}
              aria-hidden={!visible}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  color: slide.accent,
                  fontFamily: "Georgia, serif",
                  fontSize: 104,
                  lineHeight: 1,
                  textShadow: `0 0 45px ${slide.accent}66`,
                }}
              >
                {slide.symbol}
              </div>
              {showTitle && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isTop
                        ? "linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.74) 100%)"
                        : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.74) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: titlePosition.paddingLeft ?? 22,
                      right: titlePosition.paddingRight ?? 22,
                      [isTop ? "top" : "bottom"]: isTop
                        ? (titlePosition.paddingTop ?? 24)
                        : (titlePosition.paddingBottom ?? 24),
                      textAlign: isRight ? "right" : "left",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        color: titleColor,
                        fontSize: 28,
                        fontWeight: 700,
                        lineHeight: "1.1em",
                        letterSpacing: "-0.02em",
                        textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                        ...(titleFont ?? {}),
                      }}
                    >
                      {slide.title}
                    </span>
                  </div>
                </>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#000000",
                  opacity: isActive ? 0 : dim,
                  transition: `opacity ${duration}s ${ease}`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StemConceptDeck() {
  return <OriginkitBaseSmooth3DSlideshow />;
}
