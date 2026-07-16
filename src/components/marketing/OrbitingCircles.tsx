'use client';

import React, { useState, useEffect } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import styles from './OrbitingCircles.module.css';

/* ── Platform nodes ───────────────────────────────────────────── */
const platforms = [
  { orbit: 1, angle: 270, radius: 177, size: 58,  shape: 'square', bg: '#FF4500', glow: '#FF4500',  label: 'Reddit' },
  { orbit: 2, angle: 60,  radius: 251, size: 60,  shape: 'round',  bg: '#1DA1F2', glow: '#1DA1F2',  label: 'Twitter' },
  { orbit: 2, angle: 180, radius: 251, size: 78,  shape: 'round',  bg: '#1877F2', glow: '#4A90D9',  label: 'Facebook' },
  { orbit: 2, angle: 300, radius: 251, size: 58,  shape: 'square', bg: '#0A66C2', glow: '#4A90D9',  label: 'LinkedIn' },
  { orbit: 3, angle: 130, radius: 325, size: 88,  shape: 'round',  bg: '#DA552F', glow: '#FF6B35',  label: 'ProductHunt' },
  { orbit: 4, angle: 30,  radius: 399, size: 58,  shape: 'round',  bg: '#7B5EA7', glow: '#A068FF',  label: 'Newsletter' },
  { orbit: 4, angle: 95,  radius: 399, size: 88,  shape: 'square', bg: '#1a1a1a', glow: '#FF8C00',  label: 'BetaList' },
  { orbit: 4, angle: 220, radius: 399, size: 88,  shape: 'square', bg: '#0f62fe', glow: '#4A90D9',  label: 'SaaSHub' },
  { orbit: 4, angle: 320, radius: 399, size: 58,  shape: 'round',  bg: '#333',    glow: '#A068FF',  label: 'Directories' },
];

const orbits = [
  { id: 1, diameter: 353, direction: 'left',  duration: 30 },
  { id: 2, diameter: 501, direction: 'right', duration: 40 },
  { id: 3, diameter: 649, direction: 'right', duration: 50 },
  { id: 4, diameter: 797, direction: 'left',  duration: 60 },
];

/* ── SVG Icons — white on coloured bg ────────────────────────── */
function PlatformIcon({ label, size }: { label: string; size: number }) {
  const ic = Math.round(size * 0.52);   // icon ≈ 52% of avatar size

  const svgProps = { width: ic, height: ic, fill: 'white' as const, viewBox: '0 0 24 24' };

  switch (label) {
    case 'Reddit':
      return <svg {...svgProps}><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>;
    case 'Twitter':
      return <svg {...svgProps}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.172 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case 'Facebook':
      return <svg {...svgProps}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case 'LinkedIn':
      return <svg {...svgProps}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case 'ProductHunt':
      return <svg {...svgProps}><path d="M13.604 8.4h-3.405V12h3.405c.993 0 1.801-.808 1.801-1.8S14.597 8.4 13.604 8.4zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.8V6h5.804c2.319 0 4.2 1.881 4.2 4.2s-1.881 4.2-4.2 4.2z"/></svg>;
    case 'Newsletter':
      return <svg {...svgProps}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
    case 'BetaList':
      return <svg {...svgProps}><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/></svg>;
    case 'SaaSHub':
      return <svg {...svgProps}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
    case 'Directories':
      return <svg {...svgProps}><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>;
    default:
      return null;
  }
}

export default function OrbitingCircles() {
  const count = useCountUp(50, 2000, 1200);
  // Client-only: avoids Math.cos/sin SSR vs client floating-point mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={styles.container}>
      {/* Center counter — SSR-safe */}
      <div className={styles.center}>
        <span className={styles.centerNumber}>{count}+</span>
        <span className={styles.centerLabel}>Platforms</span>
      </div>

      {/* Orbits + platform icons — client only */}
      {mounted && orbits.map((orbit) => {
        const spinAnim   = orbit.direction === 'left' ? 'spin-left'   : 'spin-right';
        // Use pure-rotation keyframes (no translate) for counter-spin
        const counterAnim = orbit.direction === 'left' ? 'rotate-cw' : 'rotate-ccw';

        return (
          <div
            key={orbit.id}
            className={styles.orbit}
            style={{
              width: orbit.diameter,
              height: orbit.diameter,
              animationName: spinAnim,
              animationDuration: `${orbit.duration}s`,
            }}
          >
            {platforms
              .filter((p) => p.orbit === orbit.id)
              .map((platform, i) => {
                const rad = (platform.angle * Math.PI) / 180;
                const x   = Math.cos(rad) * platform.radius;
                const y   = Math.sin(rad) * platform.radius;
                const borderRadius = platform.shape === 'square' ? '22px' : '50%';

                return (
                  <div
                    key={platform.label}
                    className={styles.avatar}
                    style={{
                      width: platform.size,
                      height: platform.size,
                      borderRadius,
                      background: platform.bg,
                      boxShadow: `0 0 18px ${platform.glow}80, 0 0 36px ${platform.glow}35`,
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      animationDelay: `${0.5 + i * 0.2}s`,
                    }}
                  >
                    {/* Counter-rotate so icon stays upright as orbit spins */}
                    <div
                      className={styles.avatarInner}
                      style={{
                        animationName: counterAnim,
                        animationDuration: `${orbit.duration}s`,
                      }}
                    >
                      <PlatformIcon label={platform.label} size={platform.size} />
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
