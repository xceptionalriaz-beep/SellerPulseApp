'use client'

// ─────────────────────────────────────────────────────────────
// BgRemovingOverlay — shown on top of a photo card while
// background removal is in progress.
// Usage:
//   {bgRemoving.has(photo.id) && <BgRemovingOverlay />}
// ─────────────────────────────────────────────────────────────

export default function BgRemovingOverlay() {
    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
                background: 'rgba(117,48,251,0.40)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
            }}>

            {/* Sparkles */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
                {/* Top centre — medium */}
                <span style={{
                    position: 'absolute', top: 0, left: 18,
                    animation: 'sparkle-pop 1.4s ease-in-out infinite',
                    animationDelay: '0s',
                    display: 'inline-block',
                }}>
                    <SparkSvg size={26} />
                </span>
                {/* Bottom left — large */}
                <span style={{
                    position: 'absolute', bottom: 0, left: 0,
                    animation: 'sparkle-pop 1.4s ease-in-out infinite',
                    animationDelay: '0.35s',
                    display: 'inline-block',
                }}>
                    <SparkSvg size={32} />
                </span>
                {/* Bottom right — small */}
                <span style={{
                    position: 'absolute', bottom: 10, right: 0,
                    animation: 'sparkle-pop 1.4s ease-in-out infinite',
                    animationDelay: '0.7s',
                    display: 'inline-block',
                }}>
                    <SparkSvg size={18} />
                </span>
            </div>

            {/* Label */}
            <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.07em',
                fontFamily: 'DM Sans, sans-serif',
            }}>
                REMOVING BG
            </span>

            {/* Progress bar */}
            <div style={{
                width: 64,
                height: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.15)',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    background: '#b8fa33',
                    borderRadius: 2,
                    animation: 'bg-wipe 1.8s ease-in-out infinite',
                }} />
            </div>

            {/* Keyframes injected once */}
            <style>{`
                @keyframes sparkle-pop {
                    0%   { transform: scale(0.5) rotate(-15deg); opacity: 0.2; }
                    40%  { transform: scale(1.25) rotate(8deg);  opacity: 1;   }
                    70%  { transform: scale(1)    rotate(0deg);  opacity: 1;   }
                    100% { transform: scale(0.5) rotate(15deg);  opacity: 0.2; }
                }
                @keyframes bg-wipe {
                    0%   { width: 4%;   }
                    75%  { width: 100%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    )
}

// ── 4-point star SVG (matches the icon you shared) ────────────
function SparkSvg({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="#b8fa33"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z" />
        </svg>
    )
}
