import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { usePomodoroStore } from '../store/pomodoroStore';
import { useTheme } from '../providers/ThemeProvider';

export const FlowIntensityIndicator: React.FC = () => {
    const { flowMetrics } = usePomodoroStore();
    const { theme } = useTheme();

    const pulse = useSharedValue(1);
    const glow = useSharedValue(0);

    // Trigger flow animations on intensity change
    React.useEffect(() => {
        const config = { duration: 800, easing: Easing.inOut(Easing.ease) };

        if (flowMetrics.flowIntensity === 'high') {
            pulse.value = withRepeat(
                withSequence(withTiming(1.15, config), withTiming(1, config)),
                -1,
                false,
            );
            glow.value = withRepeat(
                withSequence(withTiming(1, config), withTiming(0, config)),
                -1,
                false,
            );
        } else if (flowMetrics.flowIntensity === 'medium') {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.08, { ...config, duration: 1200 }),
                    withTiming(1, { ...config, duration: 1200 }),
                ),
                -1,
                false,
            );
            glow.value = withTiming(0, { duration: 300 });
        } else {
            pulse.value = withTiming(1, { duration: 300 });
            glow.value = withTiming(0, { duration: 300 });
        }
    }, [flowMetrics.flowIntensity]);

    const colors = {
        high: { primary: theme.success, secondary: theme.success + '80', glow: theme.success },
        medium: { primary: theme.warning, secondary: theme.warning + '80', glow: theme.warning },
        low: { primary: theme.error, secondary: theme.error + '80', glow: theme.error },
    }[flowMetrics.flowIntensity] || {
        primary: theme.textSecondary,
        secondary: theme.textSecondary + '80',
        glow: theme.textSecondary,
    };

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glow.value, [0, 1], [0, 0.3]),
        transform: [{ scale: pulse.value }],
        borderColor: colors.glow,
    }));

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        backgroundColor: colors.primary,
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.glowRing, glowStyle]} />
            <Animated.View style={[styles.indicator, indicatorStyle]}>
                <View style={[styles.innerRing, { backgroundColor: colors.secondary }]} />
            </Animated.View>
            <Text style={[styles.intensityText, { color: colors.primary }]}>
                {flowMetrics.flowIntensity.toUpperCase()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    glowRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
    indicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    innerRing: { width: 20, height: 20, borderRadius: 10, opacity: 0.7 },
    intensityText: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
});
