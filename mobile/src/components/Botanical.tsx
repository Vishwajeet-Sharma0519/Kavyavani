import React from "react";
import Svg, { Path, Circle, Ellipse, G, Rect } from "react-native-svg";
import { useApp } from "../state/AppProvider";
export function Botanical({ size = 280 }: { size?: number }) {
  const { theme } = useApp();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      accessibilityElementsHidden
    >
      <Circle cx="160" cy="160" r="124" fill={theme.wash} opacity={0.5} />
      <Circle
        cx="160"
        cy="160"
        r="144"
        stroke={theme.accent}
        strokeWidth={0.6}
        fill="none"
        opacity={0.35}
      />
      <G stroke={theme.primary} strokeWidth={1.3} fill="none" opacity={0.65}>
        <Path d="M100 271 Q182 158 214 38 M135 209 Q78 170 63 118 M159 161 Q220 161 262 106 M180 112 Q136 96 129 56" />
        {[
          [102, 227, -42],
          [123, 193, 35],
          [144, 160, -45],
          [163, 127, 30],
          [179, 91, -35],
          [195, 66, 20],
          [85, 171, -58],
          [70, 139, -35],
          [215, 147, 60],
          [244, 123, 45],
          [145, 88, -48],
        ].map(([x, y, r], i) => (
          <Ellipse
            key={i}
            cx={x}
            cy={y}
            rx="11"
            ry="26"
            rotation={r}
            origin={`${x}, ${y}`}
            fill={theme.bg}
          />
        ))}
        <Path
          d="M61 251 Q111 224 159 244 L158 282 Q115 263 65 281 Z"
          fill={theme.surface}
        />
        <Path
          d="M159 244 Q204 221 254 240 L248 280 Q204 264 158 282 Z"
          fill={theme.surface}
        />
        <Path
          d="M72 259 Q118 239 148 253 M74 267 Q118 247 148 262 M170 252 Q209 237 241 248 M171 260 Q210 245 239 256"
          stroke={theme.accent}
        />
      </G>
      <G fill={theme.accent}>
        <Circle cx="64" cy="72" r="2" />
        <Circle cx="268" cy="189" r="2" />
        <Circle cx="112" cy="38" r="2" />
        <Path d="M260 48 l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </G>
      <Rect x="147" y="274" width="7" height="21" rx="1" fill={theme.primary} />
    </Svg>
  );
}
