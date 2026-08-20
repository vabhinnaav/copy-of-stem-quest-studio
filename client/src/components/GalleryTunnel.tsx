// Gallery Tunnel — Originkit
// Originkit preset `custom-style` — props baked into the default export.
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import * as THREE from "three";

const DEFAULT_IMAGES = [
  "/manus-storage/Clock_a77445b7.jpeg",
  "/manus-storage/Chem_87a26f53.jpeg",
  "/manus-storage/coding_d9da39cc.jpeg",
  "/manus-storage/cat1_6910ed7b.jpeg",
  "/manus-storage/cat2_4aafc53c.jpeg",
  "/manus-storage/Physics_537c0207.jpeg",
];

const DEFAULTS = {
  background: "#000000",
  lineColor: "#B0B0B0",
  lineOpacity: 50,
  colors: ["#FF6A00", "#AB54F7", "#EA3737", "#0072E3", "#00AA3C", "#FFB200"],
  grid: 4,
  speed: 100,
  boost: 100,
  fade: 100,
  label: true,
  labelText: "Press to Start",
  labelFill: "#FFFFFF",
  labelColor: "#000000",
  labelFont: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: 500,
  } as CSSProperties,
};

const TUNNEL_WIDTH = 2;
const TUNNEL_HEIGHT = 1.8;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS = 15;
const LINE_RADIUS = 0.003;
const SCROLL_TO_Z = 0.05;
const CAMERA_CHASE = 0.1;
const FADE_IN = 1;
const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;

interface ImageBoxImage {
  src: string;
  alt?: string;
}

interface ImageBoxProps {
  images: ImageBoxImage[];
  colors: string[];
  background: string;
  lineColor: string;
  lineOpacity: number;
  grid: number;
  speed: number;
  boost: number;
  fade: number;
  label: boolean | string;
  labelText: string;
  labelFill: string;
  labelColor: string;
  labelFont: CSSProperties;
  onHoldComplete?: () => void;
  style?: CSSProperties;
}

const srcOf = (image: unknown): string =>
  typeof image === "string"
    ? image
    : ((image as { src?: string } | undefined)?.src ?? "");

function OriginkitBaseImageBox(props: Partial<ImageBoxProps>) {
  const {
    images,
    colors,
    background = DEFAULTS.background,
    lineColor = DEFAULTS.lineColor,
    lineOpacity = DEFAULTS.lineOpacity,
    grid = DEFAULTS.grid,
    speed = DEFAULTS.speed,
    boost = DEFAULTS.boost,
    fade = DEFAULTS.fade,
    label = DEFAULTS.label,
    labelText = DEFAULTS.labelText,
    labelFill = DEFAULTS.labelFill,
    labelColor = DEFAULTS.labelColor,
    labelFont = DEFAULTS.labelFont,
    onHoldComplete,
    style,
  } = props;

  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const onHoldCompleteRef = useRef(onHoldComplete);

  useEffect(() => {
    onHoldCompleteRef.current = onHoldComplete;
  }, [onHoldComplete]);

  const urls = useMemo(() => {
    const list = (images ?? []).map(srcOf).filter(Boolean);
    return list.length ? list : DEFAULT_IMAGES;
  }, [images]);

  const palette = useMemo(() => {
    const list = (colors ?? []).filter(Boolean);
    return list.length ? list : DEFAULTS.colors;
  }, [colors]);

  const cfgRef = useRef<{ speed: number; boost: number }>({
    speed: 1,
    boost: 1,
  });
  cfgRef.current = {
    speed: Math.max(0, speed) / 100,
    boost: Math.max(0, boost) / 10,
  };

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const fogNear = Math.min(
      FOG_FAR * (1 - Math.min(100, Math.max(0, fade)) / 100),
      FOG_FAR - 0.01
    );
    scene.fog = new THREE.Fog(new THREE.Color(background), fogNear, FOG_FAR);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(lineColor),
      transparent: true,
      opacity: Math.min(100, Math.max(0, lineOpacity)) / 100,
    });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const fading: THREE.MeshBasicMaterial[] = [];

    let imageIndex = 0;
    let colorIndex = 0;
    let populateIndex = 0;
    let scrollPos = 0;
    let raf = 0;
    let last = 0;
    let pressed = false;
    let holdTimer: number | null = null;
    let holdTriggered = false;
    let alive = true;

    const halfWidth = TUNNEL_WIDTH / 2;
    const halfHeight = TUNNEL_HEIGHT / 2;
    const columns = Math.max(1, Math.round(grid));
    const rows = Math.max(1, Math.round(grid));
    const columnWidth = TUNNEL_WIDTH / columns;
    const rowHeight = TUNNEL_HEIGHT / rows;

    const floorGeometry = new THREE.PlaneGeometry(columnWidth, SEGMENT_DEPTH);
    const wallGeometry = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowHeight);
    const zTubeGeometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -SEGMENT_DEPTH)
      ),
      1,
      LINE_RADIUS,
      8
    );
    const xTubeGeometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(TUNNEL_WIDTH, 0, 0)
      ),
      1,
      LINE_RADIUS,
      8
    );
    const yTubeGeometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, TUNNEL_HEIGHT, 0)
      ),
      1,
      LINE_RADIUS,
      8
    );

    const colorMaterials = palette.map(
      hex =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(hex),
          side: THREE.DoubleSide,
        })
    );
    const imageMaterials = urls.map(url => {
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      loader.load(
        url,
        texture => {
          if (!alive) {
            texture.dispose();
            return;
          }
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.needsUpdate = true;
          fading.push(material);
        },
        undefined,
        () => {
          // A dead URL should cost a blank slab, not a broken tunnel.
        }
      );
      return material;
    });

    const tube = (
      geometry: THREE.BufferGeometry,
      x: number,
      y: number,
      z = 0
    ) => {
      const mesh = new THREE.Mesh(geometry, lineMaterial);
      mesh.position.set(x, y, z);
      return mesh;
    };

    const slots: Array<{
      geometry: THREE.BufferGeometry;
      position: THREE.Vector3;
      rotation: THREE.Euler;
    }> = [];
    {
      const z = -SEGMENT_DEPTH / 2;
      for (let index = 0; index < columns; index++) {
        const x = -halfWidth + index * columnWidth + columnWidth / 2;
        slots.push({
          geometry: floorGeometry,
          position: new THREE.Vector3(x, -halfHeight, z),
          rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        });
        slots.push({
          geometry: floorGeometry,
          position: new THREE.Vector3(x, halfHeight, z),
          rotation: new THREE.Euler(Math.PI / 2, 0, 0),
        });
      }
      for (let index = 0; index < rows; index++) {
        const y = -halfHeight + index * rowHeight + rowHeight / 2;
        slots.push({
          geometry: wallGeometry,
          position: new THREE.Vector3(-halfWidth, y, z),
          rotation: new THREE.Euler(0, Math.PI / 2, 0),
        });
        slots.push({
          geometry: wallGeometry,
          position: new THREE.Vector3(halfWidth, y, z),
          rotation: new THREE.Euler(0, -Math.PI / 2, 0),
        });
      }
    }

    const populate = (group: THREE.Group) => {
      const takesSlabs = populateIndex % 2 === 0;
      populateIndex++;
      const slabs = group.userData.slabs as THREE.Mesh[];
      for (const slab of slabs) {
        if (!takesSlabs || Math.random() > 0.5) {
          slab.visible = false;
          continue;
        }
        slab.visible = true;
        if (Math.random() > 0.5) {
          slab.material =
            colorMaterials[(5 * colorIndex) % colorMaterials.length];
          colorIndex++;
        } else {
          slab.material =
            imageMaterials[(3 * imageIndex) % imageMaterials.length];
          imageIndex++;
        }
      }
    };

    const createSegment = (z: number) => {
      const group = new THREE.Group();
      group.position.z = z;
      for (let index = 0; index <= columns; index++) {
        const x = -halfWidth + index * columnWidth;
        group.add(tube(zTubeGeometry, x, -halfHeight));
        group.add(tube(zTubeGeometry, x, halfHeight));
      }
      for (let index = 1; index < rows; index++) {
        const y = -halfHeight + index * rowHeight;
        group.add(tube(zTubeGeometry, -halfWidth, y));
        group.add(tube(zTubeGeometry, halfWidth, y));
      }
      group.add(tube(xTubeGeometry, -halfWidth, -halfHeight));
      group.add(tube(xTubeGeometry, -halfWidth, halfHeight));
      group.add(tube(yTubeGeometry, -halfWidth, -halfHeight));
      group.add(tube(yTubeGeometry, halfWidth, -halfHeight));

      const slabs = slots.map(slot => {
        const mesh = new THREE.Mesh(slot.geometry, colorMaterials[0]);
        mesh.position.copy(slot.position);
        mesh.rotation.copy(slot.rotation);
        mesh.visible = false;
        group.add(mesh);
        return mesh;
      });
      group.userData.slabs = slabs;
      populate(group);
      return group;
    };

    const segments: THREE.Group[] = [];
    for (let index = 0; index < NUM_SEGMENTS; index++) {
      const group = createSegment(-index * SEGMENT_DEPTH);
      scene.add(group);
      segments.push(group);
    }

    const resize = () => {
      const width = Math.max(1, frame.clientWidth);
      const height = Math.max(1, frame.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    resize();

    const render = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(render);
      const delta = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      const configuration = cfgRef.current;
      scrollPos += pressed ? configuration.boost : configuration.speed;
      const wantedZ = -SCROLL_TO_Z * scrollPos;
      camera.position.z += CAMERA_CHASE * (wantedZ - camera.position.z);

      const span = NUM_SEGMENTS * SEGMENT_DEPTH;
      const z = camera.position.z;
      for (const segment of segments) {
        if (segment.position.z > z + SEGMENT_DEPTH) {
          let minimum = 0;
          for (const candidate of segments)
            minimum = Math.min(minimum, candidate.position.z);
          segment.position.z = minimum - SEGMENT_DEPTH;
          populate(segment);
        } else if (segment.position.z < z - span - SEGMENT_DEPTH) {
          let maximum = -999999;
          for (const candidate of segments)
            maximum = Math.max(maximum, candidate.position.z);
          segment.position.z = maximum + SEGMENT_DEPTH;
          populate(segment);
        }
      }

      for (let index = fading.length - 1; index >= 0; index--) {
        const material = fading[index];
        material.opacity = Math.min(1, material.opacity + delta / FADE_IN);
        if (material.opacity >= 1) fading.splice(index, 1);
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(render);

    const onMove = (event: PointerEvent) => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      const rect = frame.getBoundingClientRect();
      const scaleX = rect.width > 0 ? frame.clientWidth / rect.width : 1;
      const scaleY = rect.height > 0 ? frame.clientHeight / rect.height : 1;
      cursor.style.left = `${(event.clientX - rect.left) * scaleX}px`;
      cursor.style.top = `${(event.clientY - rect.top) * scaleY}px`;
    };
    const onEnter = () => {
      const cursor = cursorRef.current;
      if (cursor) cursor.style.opacity = "1";
    };
    const onLeave = () => {
      pressed = false;
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      holdTimer = null;
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.opacity = "0";
        cursor.style.transform = "translate(0%, -100%) scale(1)";
      }
    };
    const onDown = () => {
      pressed = true;
      holdTriggered = false;
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        holdTimer = null;
        holdTriggered = true;
        pressed = false;
        onHoldCompleteRef.current?.();
      }, 3000);
      const cursor = cursorRef.current;
      if (cursor) cursor.style.transform = "translate(0%, -100%) scale(0.85)";
    };
    const onUp = () => {
      pressed = false;
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      holdTimer = null;
      const cursor = cursorRef.current;
      if (cursor) cursor.style.transform = "translate(0%, -100%) scale(1)";
    };

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerenter", onEnter);
    frame.addEventListener("pointerleave", onLeave);
    frame.addEventListener("pointerdown", onDown);
    frame.addEventListener("pointercancel", onLeave);
    window.addEventListener("pointerup", onUp);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerenter", onEnter);
      frame.removeEventListener("pointerleave", onLeave);
      frame.removeEventListener("pointerdown", onDown);
      frame.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("pointerup", onUp);
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      floorGeometry.dispose();
      wallGeometry.dispose();
      zTubeGeometry.dispose();
      xTubeGeometry.dispose();
      yTubeGeometry.dispose();
      for (const material of colorMaterials) material.dispose();
      for (const material of imageMaterials) {
        material.map?.dispose();
        material.dispose();
      }
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [urls, palette, background, lineColor, lineOpacity, grid, fade]);

  return (
    <div
      ref={frameRef}
      style={{
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: label ? "none" : "default",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
      {label && (
        <div
          ref={cursorRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "translate(0%, -100%) scale(1)",
            pointerEvents: "none",
            opacity: 0,
            background: labelFill,
            borderRadius: 9999,
            padding: "10px 20px",
            transition: "transform 0.1s ease, opacity 0.2s ease",
            whiteSpace: "nowrap",
            userSelect: "none",
            ...labelFont,
            color: labelColor,
          }}
        >
          {labelText}
        </div>
      )}
    </div>
  );
}

const originkitPresetProps: Partial<ImageBoxProps> = {
  lineColor: "#DE5F10",
  speed: 32,
  boost: 37,
  label: "Encrypt data",
  labelText: "Enter ARCADE",
  labelFill: "#DD6216",
};

export default function GalleryTunnel(props: Partial<ImageBoxProps>) {
  return <OriginkitBaseImageBox {...originkitPresetProps} {...props} />;
}
