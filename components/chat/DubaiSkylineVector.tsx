import React from "react";

interface DubaiSkylineVectorProps {
  className?: string;
  strokeColor?: string;
  opacity?: number;
}

export const DubaiSkylineVector: React.FC<DubaiSkylineVectorProps> = ({
  className = "",
  strokeColor = "#C9A15A",
  opacity = 0.35,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 800 1200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover object-bottom"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Subtle grid lines background */}
        <path
          d="M0 200 L800 200 M0 400 L800 400 M0 600 L800 600 M0 800 L800 800 M0 1000 L800 1000"
          stroke={strokeColor}
          strokeWidth="0.5"
          strokeDasharray="4 8"
          strokeOpacity="0.3"
        />

        {/* Dune curves at bottom */}
        <path
          d="M-50 1200 C150 1150 350 1180 500 1140 C650 1100 780 1150 850 1200 Z"
          fill={strokeColor}
          fillOpacity="0.04"
          stroke={strokeColor}
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        <path
          d="M-50 1200 C200 1170 450 1120 600 1160 C750 1200 820 1130 850 1200 Z"
          fill={strokeColor}
          fillOpacity="0.02"
          stroke={strokeColor}
          strokeWidth="0.6"
          strokeOpacity="0.3"
        />

        {/* Low-rise & Mid-rise Dubai Buildings (Left Side) */}
        <g stroke={strokeColor} strokeWidth="1" strokeOpacity="0.6">
          {/* Building 1 - Modern block with vertical slits */}
          <path d="M 40 1200 L 40 980 L 110 980 L 110 1200" strokeWidth="1.2" />
          <path d="M 55 1000 L 55 1160 M 75 1000 L 75 1160 M 95 1000 L 95 1160" strokeWidth="0.6" strokeDasharray="3 3" />
          <path d="M 40 980 L 75 940 L 110 980" fill={strokeColor} fillOpacity="0.1" />

          {/* Building 2 - Stepped Tower */}
          <path d="M 120 1200 L 120 900 L 140 900 L 140 850 L 170 850 L 170 900 L 190 900 L 190 1200" strokeWidth="1.2" />
          <path d="M 130 920 H 180 M 130 960 H 180 M 130 1000 H 180 M 130 1040 H 180 M 130 1080 H 180 M 130 1120 H 180" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="155" y1="850" x2="155" y2="800" strokeWidth="1.5" />

          {/* Building 3 - Curved Glass Atrium */}
          <path d="M 205 1200 L 205 950 Q 255 900 305 950 L 305 1200" strokeWidth="1.2" />
          <path d="M 215 970 C 255 940 255 940 295 970" strokeWidth="0.6" />
          <path d="M 215 1010 C 255 980 255 980 295 1010" strokeWidth="0.6" />
          <path d="M 215 1050 C 255 1020 255 1020 295 1050" strokeWidth="0.6" />

          {/* Dubai Frame Outline (Mid Left) */}
          <rect x="230" y="780" width="60" height="110" strokeWidth="1.2" fill={strokeColor} fillOpacity="0.03" />
          <rect x="240" y="795" width="40" height="80" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>

        {/* ── BURJ KHALIFA (Right & Center Elevation) ── */}
        <g stroke={strokeColor} strokeOpacity="0.85">
          {/* Main Spire Pinnacle */}
          <line x1="560" y1="120" x2="560" y2="300" strokeWidth="2" />
          <circle cx="560" cy="120" r="3" fill={strokeColor} />

          {/* Spire Top Cone */}
          <path d="M 552 300 L 560 200 L 568 300 Z" fill={strokeColor} fillOpacity="0.15" strokeWidth="1" />

          {/* Tier 1 (Ultra High Spire Base) */}
          <path d="M 548 380 L 548 300 L 572 300 L 572 380" strokeWidth="1.2" />
          <line x1="560" y1="300" x2="560" y2="380" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Tier 2 */}
          <path d="M 542 460 L 542 380 L 578 380 L 578 460" strokeWidth="1.4" />
          <path d="M 542 420 H 578 M 542 440 H 578" strokeWidth="0.5" strokeOpacity="0.5" />

          {/* Tier 3 (Setback Left) */}
          <path d="M 534 560 L 534 460 L 586 460 L 586 510 L 578 510 L 578 560" strokeWidth="1.5" />
          <line x1="534" y1="510" x2="586" y2="510" strokeWidth="0.8" />

          {/* Tier 4 (Setback Right) */}
          <path d="M 524 680 L 524 560 L 596 560 L 596 620 L 586 620 L 586 680" strokeWidth="1.6" />
          <line x1="524" y1="620" x2="596" y2="620" strokeWidth="0.8" />

          {/* Tier 5 (Major Wing Setback) */}
          <path d="M 510 820 L 510 680 L 610 680 L 610 740 L 596 740 L 596 820" strokeWidth="1.8" />
          <line x1="510" y1="740" x2="610" y2="740" strokeWidth="1" />

          {/* Tier 6 (Base Wings Left & Right) */}
          <path d="M 490 980 L 490 820 L 630 820 L 630 900 L 610 900 L 610 980" strokeWidth="2" />
          <line x1="490" y1="900" x2="630" y2="900" strokeWidth="1" />

          {/* Grand Base Podium (Ground Contact) */}
          <path d="M 465 1200 L 465 980 L 655 980 L 655 1200" strokeWidth="2.2" fill={strokeColor} fillOpacity="0.05" />

          {/* Vertical Rib Lines on Burj Khalifa Body */}
          <g strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="4 4">
            <line x1="528" y1="460" x2="528" y2="1200" />
            <line x1="544" y1="380" x2="544" y2="1200" />
            <line x1="560" y1="300" x2="560" y2="1200" />
            <line x1="576" y1="380" x2="576" y2="1200" />
            <line x1="592" y1="460" x2="592" y2="1200" />
          </g>

          {/* Horizontal Floor Lines Grid */}
          <g strokeWidth="0.5" strokeOpacity="0.3">
            <line x1="465" y1="1020" x2="655" y2="1020" />
            <line x1="465" y1="1060" x2="655" y2="1060" />
            <line x1="465" y1="1100" x2="655" y2="1100" />
            <line x1="465" y1="1140" x2="655" y2="1140" />
            <line x1="465" y1="1180" x2="655" y2="1180" />
          </g>
        </g>

        {/* ── Surrounding Downtown Dubai Towers (Right Side) ── */}
        <g stroke={strokeColor} strokeWidth="1" strokeOpacity="0.5">
          {/* Tower 1 - Address Downtown Style Curved Roof */}
          <path d="M 670 1200 L 670 880 C 700 840 730 850 750 890 L 750 1200" strokeWidth="1.2" />
          <path d="M 680 900 H 740 M 680 940 H 740 M 680 980 H 740 M 680 1020 H 740" strokeWidth="0.5" />

          {/* Tower 2 - Far Right Angular Tower */}
          <path d="M 760 1200 L 760 930 L 795 900 L 795 1200" strokeWidth="1.2" />
          <line x1="775" y1="915" x2="775" y2="1200" strokeWidth="0.6" strokeDasharray="3 3" />
        </g>

        {/* Subtle Constellation Sparkles */}
        <g fill={strokeColor} fillOpacity="0.6">
          <circle cx="560" cy="90" r="1.5" />
          <circle cx="585" cy="150" r="1" />
          <circle cx="480" cy="220" r="1.2" />
          <circle cx="280" cy="310" r="1" />
          <circle cx="150" cy="250" r="1.5" />
          <circle cx="680" cy="280" r="1.2" />
          {/* Diamond sparkle near top right */}
          <path d="M 640 180 L 643 186 L 649 189 L 643 192 L 640 198 L 637 192 L 631 189 L 637 186 Z" fillOpacity="0.4" />
          <path d="M 320 220 L 322 225 L 327 227 L 322 229 L 320 234 L 318 229 L 313 227 L 318 225 Z" fillOpacity="0.3" />
        </g>
      </svg>
    </div>
  );
};
