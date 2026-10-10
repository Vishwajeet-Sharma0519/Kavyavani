import React, { memo, useId } from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import type { Theme } from "../theme/themes";
import { useApp } from "../state/AppProvider";

// Each SVG owns its paint IDs: theme previews share a page with the active theme.
function usePaintId() {
  return `paint${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

export const GradientWash = memo(function GradientWash({
  from,
  to,
  radius = 0,
}: {
  from: string;
  to: string;
  radius?: number;
}) {
  const id = usePaintId();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: radius, overflow: "hidden" },
      ]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
});

const heart =
  "M100 176 C84 159 23 121 23 73 C23 28 77 17 100 55 C126 15 180 31 178 75 C176 119 122 158 100 176Z";

export const ThemeOrnament = memo(function ThemeOrnament({
  palette,
}: {
  palette: Theme;
}) {
  const id = usePaintId();
  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id={`${id}heart`} cx="35%" cy="27%" rx="72%" ry="72%">
          <Stop offset="0" stopColor="#FFF2FA" />
          <Stop offset="0.28" stopColor="#FFA3CE" />
          <Stop offset="0.64" stopColor="#EA4F98" />
          <Stop offset="1" stopColor="#9D235D" />
        </RadialGradient>
        <LinearGradient id={`${id}leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#C8F2A2" />
          <Stop offset="0.45" stopColor="#6BBF80" />
          <Stop offset="1" stopColor="#208459" />
        </LinearGradient>
        <RadialGradient id={`${id}petal`} cx="40%" cy="30%" rx="70%" ry="70%">
          <Stop offset="0" stopColor="#F3F8CD" />
          <Stop offset="1" stopColor="#8ACD8E" />
        </RadialGradient>
      </Defs>
      {palette.motif === "hearts" ? (
        <G rotation={-16} origin="110,110">
          <Path
            d={heart}
            fill="#9D235D"
            opacity={0.24}
            transform="translate(4 7)"
          />
          <Path d={heart} fill={`url(#${id}heart)`} />
          <Path
            d="M39 77 C34 48 69 32 85 56"
            stroke="#FFF6FC"
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
            opacity={0.65}
          />
          <Path
            d="M119 148 Q154 118 162 89"
            stroke="#A12B65"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            opacity={0.3}
          />
          <G transform="translate(136 126) scale(0.36) rotate(28)">
            <Path d={heart} fill={`url(#${id}heart)`} />
          </G>
        </G>
      ) : (
        <G>
          <Path
            d="M51 217 Q91 137 144 27 M91 140 Q139 147 188 117"
            stroke="#8ED199"
            strokeWidth={2.5}
            fill="none"
          />
          {[
            [91, 144, -58],
            [107, 112, 24],
            [120, 83, -48],
            [136, 51, 30],
            [153, 137, 62],
          ].map(([x, y, angle], index) => (
            <G key={index} transform={`translate(${x} ${y}) rotate(${angle})`}>
              <Path
                d="M0 0 C-37-11-35-47 0-63 C31-39 27-11 0 0Z"
                fill={`url(#${id}leaf)`}
              />
              <Path
                d="M0-3 L0-55 M0-17 L-14-31 M0-30 L12-42"
                stroke="#E2F9C9"
                strokeWidth={1}
                fill="none"
                opacity={0.65}
              />
            </G>
          ))}
          {[
            [62, 89, 1],
            [181, 153, 0.7],
          ].map(([x, y, scale], index) => (
            <G key={index} transform={`translate(${x} ${y}) scale(${scale})`}>
              {[0, 72, 144, 216, 288].map((angle) => (
                <Ellipse
                  key={angle}
                  cx={0}
                  cy={-14}
                  rx={10}
                  ry={18}
                  rotation={angle}
                  origin="0,0"
                  fill={`url(#${id}petal)`}
                />
              ))}
              <Circle r={6} fill="#E7D990" />
              <Circle cx={-1} cy={-2} r={2} fill="#FFF8CD" />
            </G>
          ))}
        </G>
      )}
    </Svg>
  );
});

export const ThemeBackdrop = memo(function ThemeBackdrop({
  palette,
  compact = false,
  radius = 0,
  motifs = true,
}: {
  palette: Theme;
  compact?: boolean;
  radius?: number;
  motifs?: boolean;
}) {
  const id = usePaintId();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={[
        StyleSheet.absoluteFill,
        { overflow: "hidden", borderRadius: radius },
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={`${id}base`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0" stopColor={palette.gradientStart} />
            <Stop offset="0.48" stopColor={palette.bg} />
            <Stop offset="1" stopColor={palette.gradientEnd} />
          </LinearGradient>
          <RadialGradient id={`${id}glow`}>
            <Stop
              offset="0"
              stopColor={palette.glow}
              stopOpacity={palette.dark ? 0.24 : 0.27}
            />
            <Stop offset="1" stopColor={palette.glow} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`${id}halo`}>
            <Stop
              offset="0"
              stopColor={palette.glowSecondary}
              stopOpacity={0.17}
            />
            <Stop
              offset="1"
              stopColor={palette.glowSecondary}
              stopOpacity={0}
            />
          </RadialGradient>
        </Defs>
        <Rect width={1000} height={1000} fill={`url(#${id}base)`} />
        <Ellipse cx={900} cy={120} rx={570} ry={470} fill={`url(#${id}glow)`} />
        <Ellipse cx={40} cy={790} rx={590} ry={410} fill={`url(#${id}halo)`} />
      </Svg>
      {motifs && palette.motif !== "none" && (
        <>
          <View
            style={{
              position: "absolute",
              right: compact ? -2 : -14,
              top: compact ? -8 : 24,
              width: compact ? 104 : 224,
              aspectRatio: 1,
              opacity: compact ? 0.37 : 0.19,
            }}
          >
            <ThemeOrnament palette={palette} />
          </View>
          {!compact && (
            <View
              style={{
                position: "absolute",
                left: -45,
                top: "48%",
                width: 180,
                aspectRatio: 1,
                opacity: 0.12,
                transform: [{ rotate: "34deg" }],
              }}
            >
              <ThemeOrnament palette={palette} />
            </View>
          )}
          {!compact && (
            <View
              style={{
                position: "absolute",
                right: "8%",
                bottom: "5%",
                width: 110,
                aspectRatio: 1,
                opacity: 0.14,
                transform: [{ rotate: "18deg" }],
              }}
            >
              <ThemeOrnament palette={palette} />
            </View>
          )}
        </>
      )}
    </View>
  );
});

export function ThemeCanvas({ children }: React.PropsWithChildren) {
  const { theme } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ThemeBackdrop palette={theme} />
      {children}
    </View>
  );
}
