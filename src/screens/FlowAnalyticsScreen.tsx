import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { FlowMetrics } from '../components/FlowMetrics';
import { AdvancedAnalytics } from '../components/AdvancedAnalytics';
import { usePomodoroStore } from '../store/pomodoroStore';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';

const { width } = Dimensions.get('window');

interface FlowAnalyticsScreenProps {
    navigation?: {
        goBack: () => void;
    };
}

const FlowAnalyticsScreen: React.FC<FlowAnalyticsScreenProps> = ({ navigation }) => {
    const { flowMetrics } = usePomodoroStore();
    const { theme } = useTheme();
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const getFlowAdvice = () => {
        const { flowIntensity, distractionCount, consecutiveSessions } = flowMetrics;

        if (flowIntensity === 'high') {
            return {
                title: "🔥 You're in the Zone!",
                advice: "You're experiencing deep flow. Consider extending your sessions slightly to maximize this state.",
                tips: [
                    'Keep your current environment setup',
                    'Avoid interruptions during high flow periods',
                    'Consider batch similar tasks together',
                    'Try the Pomodoro technique with longer intervals',
                ],
                color: '#10B981',
                gradient: ['#10B981', '#34D399'],
            };
        } else if (flowIntensity === 'medium') {
            return {
                title: '⚡ Building Momentum',
                advice: "You're developing good focus habits. A few tweaks can help you reach deeper flow states.",
                tips: [
                    'Minimize distractions before starting',
                    'Try slightly longer sessions',
                    'Use background music or white noise',
                    'Take regular breaks to maintain energy',
                ],
                color: '#F59E0B',
                gradient: ['#F59E0B', '#FBBF24'],
            };
        } else {
            return {
                title: '🌱 Growing Your Focus',
                advice: 'Everyone starts somewhere. Small, consistent sessions will build your focus muscle.',
                tips: [
                    'Start with shorter 15-minute sessions',
                    'Remove phone from workspace',
                    'Use the Pomodoro technique consistently',
                    'Create a dedicated focus environment',
                ],
                color: '#EF4444',
                gradient: ['#EF4444', '#F87171'],
            };
        }
    };

    const advice = getFlowAdvice();

    const headerOpacity = headerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const headerTranslateY = headerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
    });

    const InsightCard: React.FC<{
        icon: string;
        title: string;
        value: string;
        subtitle: string;
        color: string;
        delay?: number;
    }> = ({ icon, title, value, subtitle, color, delay = 0 }) => {
        const cardAnimation = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(cardAnimation, {
                toValue: 1,
                duration: 800,
                delay,
                useNativeDriver: true,
            }).start();
        }, []);

        const cardOpacity = cardAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const cardTranslateY = cardAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.insightCard,
                    { backgroundColor: theme.surface },
                    {
                        opacity: cardOpacity,
                        transform: [{ translateY: cardTranslateY }],
                    },
                ]}
            >
                <View style={[styles.insightIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                </View>
                <View style={styles.insightContent}>
                    <Text style={[styles.insightTitle, { color: theme.textSecondary }]}>
                        {title}
                    </Text>
                    <Text style={[styles.insightValue, { color }]}>{value}</Text>
                    <Text style={[styles.insightSubtitle, { color: theme.textSecondary }]}>
                        {subtitle}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    const TipCard: React.FC<{ tip: string; index: number }> = ({ tip, index }) => {
        const tipAnimation = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(tipAnimation, {
                toValue: 1,
                duration: 600,
                delay: index * 100 + 1000,
                useNativeDriver: true,
            }).start();
        }, []);

        const tipOpacity = tipAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const tipTranslateX = tipAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.tipCard,
                    { backgroundColor: theme.background },
                    {
                        opacity: tipOpacity,
                        transform: [{ translateX: tipTranslateX }],
                    },
                ]}
            >
                <View style={[styles.tipBullet, { backgroundColor: advice.color }]}>
                    <Text style={styles.tipBulletText}>{index + 1}</Text>
                </View>
                <Text style={[styles.tipText, { color: theme.text }]}>{tip}</Text>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                    useNativeDriver: false,
                })}
                scrollEventThrottle={16}
            >
                {/* Header */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: headerOpacity,
                            transform: [{ translateY: headerTranslateY }],
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={[styles.backButton, { backgroundColor: theme.surface }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Flow Analytics</Text>
                    <View style={styles.placeholder} />
                </Animated.View>

                {/* Flow Metrics */}
                <FlowMetrics showDetailed={true} />

                {/* Advanced Analytics */}
                <AdvancedAnalytics timeRange={timeRange} onTimeRangeChange={setTimeRange} />

                {/* Insights Grid */}
                <View style={styles.insightsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Insights</Text>
                    <View style={styles.insightsGrid}>
                        <InsightCard
                            icon="flame"
                            title="Flow Intensity"
                            value={flowMetrics.flowIntensity.toUpperCase()}
                            subtitle="Current state"
                            color={advice.color}
                            delay={200}
                        />
                        <InsightCard
                            icon="trending-up"
                            title="Best Streak"
                            value={`${flowMetrics.longestStreak} days`}
                            subtitle="Personal record"
                            color="#3B82F6"
                            delay={300}
                        />
                        <InsightCard
                            icon="time"
                            title="Avg Session"
                            value={`${Math.round(flowMetrics.averageSessionLength)}m`}
                            subtitle="Focus duration"
                            color="#8B5CF6"
                            delay={400}
                        />
                        <InsightCard
                            icon="shield-checkmark"
                            title="Focus Score"
                            value={`${Math.max(0, 100 - flowMetrics.distractionCount * 5)}%`}
                            subtitle="Distraction resistance"
                            color="#10B981"
                            delay={500}
                        />
                    </View>
                </View>

                {/* Advice Section */}
                <View
                    style={[
                        styles.adviceSection,
                        { backgroundColor: theme.surface, borderLeftColor: advice.color },
                    ]}
                >
                    <View style={styles.adviceHeader}>
                        <Text style={[styles.adviceTitle, { color: advice.color }]}>
                            {advice.title}
                        </Text>
                    </View>
                    <Text style={[styles.adviceText, { color: theme.textSecondary }]}>
                        {advice.advice}
                    </Text>

                    <Text style={[styles.tipsTitle, { color: theme.text }]}>
                        💡 Personalized Tips
                    </Text>
                    <View style={styles.tipsContainer}>
                        {advice.tips.map((tip, index) => (
                            <TipCard key={index} tip={tip} index={index} />
                        ))}
                    </View>
                </View>

                {/* Progress Visualization */}
                <View style={styles.progressSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Progress Overview
                    </Text>
                    <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.progressItem}>
                            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                                Total Focus Time
                            </Text>
                            <View
                                style={[styles.progressBar, { backgroundColor: theme.background }]}
                            >
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min((flowMetrics.totalFocusTime / 1500) * 100, 100)}%`,
                                            backgroundColor: advice.color,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressValue, { color: theme.text }]}>
                                {Math.floor(flowMetrics.totalFocusTime / 60)}h{' '}
                                {flowMetrics.totalFocusTime % 60}m
                            </Text>
                        </View>

                        <View style={styles.progressItem}>
                            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                                Session Consistency
                            </Text>
                            <View
                                style={[styles.progressBar, { backgroundColor: theme.background }]}
                            >
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min((flowMetrics.consecutiveSessions / 10) * 100, 100)}%`,
                                            backgroundColor: '#3B82F6',
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressValue, { color: theme.text }]}>
                                {flowMetrics.consecutiveSessions}/10 sessions
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    insightsSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    insightsGrid: {
        gap: 16,
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    insightValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    insightSubtitle: {
        fontSize: 12,
    },
    adviceSection: {
        margin: 24,
        padding: 24,
        borderRadius: 20,
        borderLeftWidth: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    adviceHeader: {
        marginBottom: 16,
    },
    adviceTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    adviceText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    tipsContainer: {
        gap: 12,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
    },
    tipBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    tipBulletText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    progressSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    progressCard: {
        padding: 20,
        borderRadius: 16,
        gap: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    progressItem: {
        gap: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 40,
    },
});

export default FlowAnalyticsScreen;
