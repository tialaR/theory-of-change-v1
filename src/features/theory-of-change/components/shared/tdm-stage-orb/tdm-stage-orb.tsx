'use client';

import { Mesh, Program, Renderer, Triangle, Vec2, Vec3 } from 'ogl';
import { useEffect, useRef } from 'react';
import styles from './tdm-stage-orb.module.sass';

export type TdmStageOrbProps = {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  /** Soft mono wash for theory / opening stage (grey · white · black). */
  neutral?: boolean;
  /** Punch out the orb center so the rim reads as a liquid ring. */
  transparentCenter?: boolean;
  ringThickness?: number;
  ringSoftness?: number;
  ringIntensity?: number;
  /** Cycle violet → blue → amber → teal around the ring. */
  connectMode?: boolean;
  backgroundColor?: string;
  className?: string;
};

const VERT = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  uniform float neutral;
  uniform float hollowCenter;
  uniform float connectMode;
  uniform float ringThickness;
  uniform float ringSoftness;
  uniform float ringIntensity;
  uniform float ringInner;
  uniform float saturationMultiplier;
  uniform vec2 iMouse;
  uniform vec3 backgroundColor;
  varying vec2 vUv;

  vec3 rgb2yiq(vec3 c) {
    float y = dot(c, vec3(0.299, 0.587, 0.114));
    float i = dot(c, vec3(0.596, -0.274, -0.322));
    float q = dot(c, vec3(0.211, -0.523, 0.312));
    return vec3(y, i, q);
  }

  vec3 yiq2rgb(vec3 c) {
    float r = c.x + 0.956 * c.y + 0.621 * c.z;
    float g = c.x - 0.272 * c.y - 0.647 * c.z;
    float b = c.x - 1.106 * c.y + 1.703 * c.z;
    return vec3(r, g, b);
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = hueDeg * 3.14159265 / 180.0;
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    float i = yiq.y * cosA - yiq.z * sinA;
    float q = yiq.y * sinA + yiq.z * cosA;
    yiq.y = i;
    yiq.z = q;
    return yiq2rgb(yiq);
  }

  vec3 desaturate(vec3 color, float amount) {
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(luma), amount);
  }

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
      p3.x + p3.y,
      p3.x + p3.z,
      p3.y + p3.z
    ) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(
      dot(d0, d0),
      dot(d1, d1),
      dot(d2, d2),
      dot(d3, d3)
    ), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
  const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
  const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
  const float innerRadius = 0.6;
  const float noiseScale = 0.65;

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }

  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec3 stageHueColor(float stageHue) {
    return adjustHue(baseColor1, stageHue);
  }

  vec3 connectRingColor(float ang) {
    float t = fract((ang + 3.14159265) / 6.2831853 + iTime * 0.04);
    vec3 violet = stageHueColor(265.0);
    vec3 blue = stageHueColor(208.0);
    vec3 amber = stageHueColor(32.0);
    vec3 teal = stageHueColor(160.0);
    if (t < 0.25) return mix(violet, blue, t / 0.25);
    if (t < 0.5) return mix(blue, amber, (t - 0.25) / 0.25);
    if (t < 0.75) return mix(amber, teal, (t - 0.5) / 0.25);
    return mix(teal, violet, (t - 0.75) / 0.25);
  }

  vec4 draw(vec2 uv, float life) {
    float ang = atan(uv.y, uv.x);
    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;

    vec3 color1;
    vec3 color2;
    vec3 color3;

    if (connectMode > 0.5) {
      vec3 connectCol = connectRingColor(ang);
      color1 = connectCol;
      color2 = adjustHue(baseColor2, 208.0);
      color3 = connectCol * 0.55;
    } else {
      color1 = adjustHue(baseColor1, hue);
      color2 = adjustHue(baseColor2, hue);
      color3 = adjustHue(baseColor3, hue);
    }

    float satScale = saturationMultiplier;
    color1 = mix(vec3(dot(color1, vec3(0.299, 0.587, 0.114))), color1, satScale);
    color2 = mix(vec3(dot(color2, vec3(0.299, 0.587, 0.114))), color2, satScale);
    color3 = mix(vec3(dot(color3, vec3(0.299, 0.587, 0.114))), color3, satScale);

    float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.55 + life * 0.35)) * 0.5 + 0.5;
    float breath = 0.04 * sin(iTime * 1.15) + 0.03 * sin(iTime * 0.62 + 1.7);
    float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
    r0 += breath * (0.55 + life * 0.65);
    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);

    v0 *= smoothstep(r0 * 1.05, r0, len);
    float cl = cos(ang + iTime * 1.85 + life * 0.8) * 0.5 + 0.5;

    float a = iTime * -1.05;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    pos += vec2(sin(iTime * 0.7), cos(iTime * 0.55)) * (0.045 + life * 0.05);
    float d = distance(uv, pos);
    float v1 = light2(1.55 + life * 0.35, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 colBase = mix(color1, color2, cl);
    float satBoost = 1.22 + life * 0.28;

    vec3 darkCol = mix(color3, colBase, v0);
    darkCol = (darkCol + v1) * v2 * v3 * satBoost;
    darkCol = clamp(darkCol, 0.0, 1.0);

    vec3 lightCol = (colBase + v1) * v2 * v3 * satBoost;
    lightCol = mix(lightCol, lightCol + backgroundColor * 0.18, v0 * 0.35);
    lightCol = clamp(lightCol, 0.0, 1.0);

    vec3 finalCol = mix(darkCol, lightCol, clamp(bgLuminance * 0.55, 0.0, 1.0));
    float brightness = 1.08 + 0.08 * sin(iTime * 1.4) + life * 0.16;
    finalCol *= brightness;

    if (neutral > 0.5) {
      float luma = dot(finalCol, vec3(0.299, 0.587, 0.114));
      vec3 steel = vec3(luma * 0.9 + 0.1, luma * 0.92 + 0.08, luma * 0.96 + 0.06);
      steel += vec3(0.05, 0.05, 0.055) * v1;
      steel = mix(steel, vec3(0.94, 0.94, 0.96), v1 * 0.28);
      steel = mix(steel, vec3(0.18, 0.18, 0.2), (1.0 - v2 * v3) * 0.12);
      finalCol = clamp(steel, 0.0, 1.0);
    }

    return extractAlpha(finalCol);
  }

  float ringMaskFromUv(vec2 uv) {
    float dist = distance(uv, vec2(0.5));
    float r = dist * 2.0;
    float inner = smoothstep(ringInner, ringInner + ringSoftness, r);
    float outer = 1.0 - smoothstep(ringInner + ringThickness, ringInner + ringThickness + ringSoftness, r);
    return inner * outer;
  }

  vec4 mainImage(vec2 fragCoord) {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord - center) / size * 2.0;

    float angle = rot;
    float s = sin(angle);
    float c = cos(angle);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    float life = mix(0.42, 1.0, hover);
    float idleAmp = 0.055 + life * hoverIntensity * 0.09;
    uv.x += idleAmp * sin(uv.y * 7.5 + iTime * 1.05);
    uv.y += idleAmp * cos(uv.x * 7.0 + iTime * 0.92);

    vec2 mouseUv = iMouse;
    float mouseInfluence = hover * hoverIntensity;
    uv += (mouseUv - uv) * mouseInfluence * 0.085;
    uv.x += mouseInfluence * 0.12 * sin(uv.y * 10.0 + iTime + mouseUv.x * 3.0);
    uv.y += mouseInfluence * 0.12 * sin(uv.x * 10.0 + iTime + mouseUv.y * 3.0);

    return draw(uv, life);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec4 col = mainImage(fragCoord);

    if (hollowCenter > 0.5) {
      float ringMask = ringMaskFromUv(vUv);
      col.a *= ringMask;
      col.rgb *= ringIntensity * mix(0.82, 1.0, ringMask);
    }

    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`;

function hslToRgb(h: number, s: number, l: number) {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return new Vec3(r, g, b);
}

function hexToVec3(color: string) {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return new Vec3(r, g, b);
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return new Vec3(parseInt(rgbMatch[1], 10) / 255, parseInt(rgbMatch[2], 10) / 255, parseInt(rgbMatch[3], 10) / 255);
  }

  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    return hslToRgb(h, s, l);
  }

  return new Vec3(0, 0, 0);
}

export function TdmStageOrb({
  hue = 0,
  hoverIntensity = 0.44,
  rotateOnHover = false,
  forceHoverState = false,
  neutral = false,
  transparentCenter = true,
  ringThickness = 0.34,
  ringSoftness = 0.12,
  ringIntensity = 1.35,
  connectMode = false,
  backgroundColor = '#D8D8D2',
  className
}: TdmStageOrbProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const normalizedHue = Number.isFinite(hue) ? hue : 0;
  const normalizedHoverIntensity = Number.isFinite(hoverIntensity) ? hoverIntensity : 0.44;
  const normalizedRotateOnHover = Boolean(rotateOnHover);
  const normalizedForceHoverState = Boolean(forceHoverState);
  const normalizedNeutral = Boolean(neutral);
  const normalizedTransparentCenter = Boolean(transparentCenter);
  const normalizedRingThickness = Number.isFinite(ringThickness) ? ringThickness : 0.34;
  const normalizedRingSoftness = Number.isFinite(ringSoftness) ? ringSoftness : 0.12;
  const normalizedRingIntensity = Number.isFinite(ringIntensity) ? ringIntensity : 1.35;
  const normalizedConnectMode = Boolean(connectMode);
  const normalizedBackgroundColor = backgroundColor ?? '#D8D8D2';
  const saturationMultiplier = normalizedNeutral ? 0.15 : 1.0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    root.appendChild(gl.canvas);
    gl.canvas.className = styles.canvas;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(gl.canvas.width, gl.canvas.height, renderer.dpr ?? window.devicePixelRatio ?? 1)
        },
        hue: { value: normalizedHue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: normalizedHoverIntensity },
        neutral: { value: normalizedNeutral ? 1 : 0 },
        hollowCenter: { value: normalizedTransparentCenter ? 1 : 0 },
        connectMode: { value: normalizedConnectMode ? 1 : 0 },
        ringThickness: { value: normalizedRingThickness },
        ringSoftness: { value: normalizedRingSoftness },
        ringIntensity: { value: normalizedRingIntensity },
        ringInner: { value: 0.3 },
        saturationMultiplier: { value: saturationMultiplier },
        iMouse: { value: new Vec2(0, 0) },
        backgroundColor: { value: hexToVec3(normalizedBackgroundColor) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const rootEl = rootRef.current;
      if (!rootEl) return;

      const rect = rootEl.getBoundingClientRect();
      const fallbackSize = 132;
      const width = Math.max(1, Math.round(rect.width || fallbackSize));
      const height = Math.max(1, Math.round(rect.height || rect.width || fallbackSize));

      renderer.setSize(width, height);

      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.display = 'block';

      const dpr = renderer.dpr ?? window.devicePixelRatio ?? 1;
      if (program.uniforms.iResolution) {
        program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, dpr);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(resize);
    });

    resizeObserver.observe(root);
    requestAnimationFrame(resize);

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.3;
    const mouseUv = { x: 0, y: 0 };

    const toLocalUv = (clientX: number, clientY: number) => {
      const container = rootRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const size = Math.min(width, height);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const uvX = ((x - width / 2) / size) * 2.0;
      const uvY = -((y - height / 2) / size) * 2.0;
      return { uvX, uvY, dist: Math.sqrt(uvX * uvX + uvY * uvY) };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const local = toLocalUv(e.clientX, e.clientY);
      if (!local) return;
      mouseUv.x = local.uvX;
      mouseUv.y = local.uvY;
      targetHover = local.dist < 1.15 ? 1 : 0;
    };

    const handlePointerEnter = (e: PointerEvent) => {
      handlePointerMove(e);
      targetHover = 1;
    };

    const handlePointerLeave = () => {
      targetHover = 0;
    };

    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerleave', handlePointerLeave);
    root.addEventListener('pointerenter', handlePointerEnter);

    let rafId = 0;
    const update = (t: number) => {
      rafId = requestAnimationFrame(update);
      const dt = Math.min(0.05, (t - lastTime) * 0.001 || 0.016);
      lastTime = t;
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = normalizedHue;
      program.uniforms.hoverIntensity.value = normalizedHoverIntensity;
      program.uniforms.neutral.value = normalizedNeutral ? 1 : 0;
      program.uniforms.hollowCenter.value = normalizedTransparentCenter ? 1 : 0;
      program.uniforms.connectMode.value = normalizedConnectMode ? 1 : 0;
      program.uniforms.ringThickness.value = normalizedRingThickness;
      program.uniforms.ringSoftness.value = normalizedRingSoftness;
      program.uniforms.ringIntensity.value = normalizedRingIntensity;
      program.uniforms.saturationMultiplier.value = saturationMultiplier;

      const effectiveHover = forceHoverState ? 1 : targetHover;
      const currentHover = program.uniforms.hover.value as number;
      const hoverEase = effectiveHover > currentHover ? 0.18 : 0.06;
      program.uniforms.hover.value += (effectiveHover - currentHover) * hoverEase;

      const mouseUniform = program.uniforms.iMouse.value as Vec2;
      mouseUniform.x += (mouseUv.x - mouseUniform.x) * 0.12;
      mouseUniform.y += (mouseUv.y - mouseUniform.y) * 0.12;

      if (normalizedRotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed;
      }
      program.uniforms.rot.value = currentRot;
      program.uniforms.backgroundColor.value = hexToVec3(normalizedBackgroundColor);

      renderer.render({ scene: mesh });
    };

    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      root.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', handlePointerLeave);
      root.removeEventListener('pointerenter', handlePointerEnter);
      if (root.contains(gl.canvas)) {
        root.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    normalizedHue,
    normalizedHoverIntensity,
    normalizedRotateOnHover,
    normalizedForceHoverState,
    normalizedNeutral,
    normalizedTransparentCenter,
    normalizedRingThickness,
    normalizedRingSoftness,
    normalizedRingIntensity,
    normalizedConnectMode,
    normalizedBackgroundColor,
    saturationMultiplier
  ]);

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(' ')} />;
}
