import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface RippleProps {
  speed?: number;
  initialDiameter?: number;
  diameter?: number;
  duration?: number;
  rippleCount?: number;
  rippleStyle?: ViewStyle;
  color?: string;
  style?: ViewStyle;
}

interface RippleItem {
  key: number;
  opacity: number;
  centerOffset: number;
  diameter: number;
}

const defaultProps: Required<RippleProps> = {
  speed: 10,
  initialDiameter: 0,
  diameter: 500,
  duration: 1000,
  rippleCount: 3,
  rippleStyle: {},
  color: 'white',
  style: {
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const Ripple: React.FC<RippleProps> = (props: RippleProps) => {
  const {
      speed,
      initialDiameter,
      diameter,
      duration,
      rippleCount,
      rippleStyle,
      color,
      style,
  } = { ...defaultProps, ...props };

  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const [started, setStarted] = useState<boolean>(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createRipple = (): void => {
    setRipples((prev: RippleItem[]) => [
      ...prev,
      {
        key: prev.length + 1,
        diameter: initialDiameter,
        opacity: 0.5,
        centerOffset: (diameter - initialDiameter) / 2,
      },
    ]);
  };

  const updateRipple = (): void => {
    setRipples((prev: RippleItem[]) =>
      prev.map((prevRipple: RippleItem): RippleItem => {
        const newDiameter = prevRipple.diameter > diameter ? 0 : prevRipple.diameter + 2;
        const centerOffset = (diameter - newDiameter) / 2;
        let opacity = Math.abs(newDiameter / diameter - 1);
        if (opacity > 0.5) opacity = 0.5;
        return { ...prevRipple, diameter: newDiameter, centerOffset, opacity };
      })
    );
  };

  useEffect(() => {
    setStarted(true);

    for (let i = 0; i < rippleCount; i++) {
      const timeout = setTimeout(() => {
        createRipple();
      }, i * duration);
      timeoutsRef.current.push(timeout);
    }

    intervalRef.current = setInterval(updateRipple, speed);

    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [speed, initialDiameter, duration, diameter, rippleCount]);

  return (
    <View style={[styles.container, style]}>
      {started && (
        <View style={{ width: diameter, height: diameter }}>
          {ripples.map((ripple: RippleItem) => (
            <View
              key={ripple.key}
              style={[
                styles.ripple,
                {
                    top: ripple.centerOffset,
                    left: ripple.centerOffset,
                    width: ripple.diameter,
                    height: ripple.diameter,
                    borderRadius: ripple.diameter / 2,
                    backgroundColor: color,
                    opacity: ripple.opacity,
                },
                rippleStyle,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    flex: 1,
  },
});

export default Ripple;
