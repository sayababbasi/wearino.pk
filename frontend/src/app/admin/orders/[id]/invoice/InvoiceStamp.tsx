/**
 * InvoiceStamp Component
 *
 * A reusable official Wearino.pk stamp watermark rendered as an inline SVG.
 * Designed to be dropped into any invoice, receipt, or document as an
 * authenticity mark to prevent forgery.
 *
 * Usage:
 *   import InvoiceStamp from '@/src/app/admin/orders/[id]/invoice/InvoiceStamp';
 *
 *   // Default (positioned absolute, bottom-right, print-friendly)
 *   <InvoiceStamp />
 *
 *   // Custom size, opacity, rotation, color
 *   <InvoiceStamp size={160} opacity={0.20} rotate={-30} color="#8B0000" />
 *
 *   // Inline (no absolute positioning — flows with document)
 *   <InvoiceStamp inline />
 */

interface InvoiceStampProps {
  /** Width & height of the stamp in pixels. Default: 176 */
  size?: number;
  /** Opacity from 0 to 1. Default: 0.18 */
  opacity?: number;
  /** Rotation angle in degrees. Default: -22 */
  rotate?: number;
  /** Stroke & fill color. Default: '#1a3a5c' (dark navy) */
  color?: string;
  /**
   * If true, renders inline in document flow (no absolute positioning).
   * If false (default), positions absolute at bottom-right of parent.
   * Parent must have `position: relative` when inline=false.
   */
  inline?: boolean;
  /** Additional class names for the wrapper div */
  className?: string;
}

export default function InvoiceStamp({
  size = 176,
  opacity = 0.18,
  rotate = -22,
  color = '#1a3a5c',
  inline = false,
  className = '',
}: InvoiceStampProps) {
  const wrapperStyle: React.CSSProperties = {
    opacity,
    transform: `rotate(${rotate}deg)`,
    zIndex: 10,
    width: size,
    height: size,
    pointerEvents: 'none',
    userSelect: 'none',
  };

  const positionClass = inline
    ? `inline-block ${className}`
    : `absolute bottom-36 right-16 print:right-14 ${className}`;

  return (
    <div className={positionClass} style={wrapperStyle}>
      <svg
        viewBox="0 0 180 180"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Outer double border circles */}
        <circle cx="90" cy="90" r="86" fill="none" stroke={color} strokeWidth="5" />
        <circle cx="90" cy="90" r="79" fill="none" stroke={color} strokeWidth="1.5" />

        {/* Curved text paths */}
        <defs>
          <path id="stamp-topArc"    d="M 20,90 A 70,70 0 0,1 160,90" />
          <path id="stamp-bottomArc" d="M 28,90 A 62,62 0 0,0 152,90" />
        </defs>

        {/* Top arc text */}
        <text fill={color} fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="3">
          <textPath href="#stamp-topArc" startOffset="10%">
            WEARINO.PK ★ OFFICIAL
          </textPath>
        </text>

        {/* Bottom arc text */}
        <text fill={color} fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="2">
          <textPath href="#stamp-bottomArc" startOffset="12%">
            VERIFIED INVOICE • PAKISTAN
          </textPath>
        </text>

        {/* Center brand text */}
        <text
          x="90" y="78"
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          letterSpacing="1"
        >
          WEARINO
        </text>
        <text
          x="90" y="96"
          textAnchor="middle"
          fill={color}
          fontSize="11"
          fontFamily="Arial, sans-serif"
          letterSpacing="4"
        >
          .PK STORE
        </text>

        {/* Divider line */}
        <line x1="50" y1="103" x2="130" y2="103" stroke={color} strokeWidth="1" />

        {/* Sub-text */}
        <text
          x="90" y="117"
          textAnchor="middle"
          fill={color}
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="1"
        >
          AUTHORIZED ONLY
        </text>
      </svg>
    </div>
  );
}
