import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme, Modal, TouchableWithoutFeedback, Dimensions, ImageBackground, useWindowDimensions, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getTypography } from '@/constants/ThemedTypography';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post } from '@/lib/apiClient';
import RenderHTML from 'react-native-render-html';
import { marked } from 'marked';
import PrimaryButton from '@/components/PrimaryButton';

type StepItem = {
  step_id: number;
  name: string;         // Day 1, etc.
  descr: string;        // description/title
  prompt_response?: string | null;
  entry_date: string;   // ISO date (e.g., "2025-07-25")
};

export default function LogScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();

  const [completedSteps, setCompletedSteps] = useState<any[]>([]);
  const [showThisWeek, setShowThisWeek] = useState(true);
  const [showLastWeek, setShowLastWeek] = useState(false);
  const [openOlderWeeks, setOpenOlderWeeks] = useState<Record<string, boolean>>({});

  // ---- Helpers ----
  const startOfWeek = (d: Date) => {
    // Monday as start of week. Change to 0 for Sunday if you prefer.
    const date = new Date(d);
    const day = date.getDay(); // 0 (Sun) -> 6 (Sat)
    const diffToMonday = (day + 6) % 7; // Mon=0, Tue=1, ... Sun=6
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - diffToMonday);
    return date;
  };

  const addDays = (d: Date, days: number) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  };

  const isoKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

  // ---- Data fetch ----
  const fetchStepData = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      router.replace('/signin');
      return;
    }
    try {
      const response = await get('/course/user-course-history', { course_id: '1' }, token);
      if (!Array.isArray(response)) return;
      // Sort newest -> oldest by entry_date
      const sorted = [...response].sort(
        (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );
      setCompletedSteps(sorted);
    } catch (e) {
      console.error('Error fetching course history:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStepData();
    }, [])
  );

  // ---- Grouping by week ----
  const { thisWeekItems, lastWeekItems, olderWeeks } = useMemo(() => {
    const now = new Date();
    const thisStart = startOfWeek(now);
    const nextStart = addDays(thisStart, 7);
    const lastStart = addDays(thisStart, -7);
    const lastEnd = thisStart;

    const tw: StepItem[] = [];
    const lw: StepItem[] = [];
    const olderMap = new Map<string, StepItem[]>();

    for (const s of completedSteps) {
      const d = new Date(s.entry_date);
      const wkStart = startOfWeek(d);
      if (d >= thisStart && d < nextStart) {
        tw.push(s);
      } else if (d >= lastStart && d < lastEnd) {
        lw.push(s);
      } else {
        const k = isoKey(wkStart); // week key
        if (!olderMap.has(k)) olderMap.set(k, []);
        olderMap.get(k)!.push(s);
      }
    }

    // Sort each older week’s steps newest -> oldest
    for (const [, arr] of olderMap) {
      arr.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
    }

    // Sort week keys newest -> oldest
    const olderWeeksArr = Array.from(olderMap.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([k, v]) => ({ weekKey: k, items: v }));

    return { thisWeekItems: tw, lastWeekItems: lw, olderWeeks: olderWeeksArr };
  }, [completedSteps]);

  // ---- UI helpers ----
  const handleCardPress = (step_id: number) => {
    router.push(`/(tabs)/course?step_id=${step_id}`);
  };

  const WeekHeader = ({
    title,
    open,
    onToggle,
    count,
  }: {
    title: string;
    open: boolean;
    onToggle: () => void;
    count: number;
  }) => (
    <TouchableOpacity style={styles.headerRow} onPress={onToggle} activeOpacity={0.7}>
      <Text style={styles.headerTitle}>
        {title} {count > 0 ? `(${count})` : ''}
      </Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
    </TouchableOpacity>
  );

  const StepCard = ({ item }: { item: StepItem }) => {
    const date = new Date(item.entry_date);
    const leftTop = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Jul 25"
    const leftBottom = date.getFullYear().toString();

    return (
      <TouchableOpacity onPress={() => handleCardPress(item.step_id)}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.pillContainer, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.pillText, { color: theme.secondaryButtonText }]}>{item.name}</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.leftColumn}>
              <Text style={styles.dateMonth}>{leftTop}</Text>
              <Text style={styles.dateYear}>{leftBottom}</Text>
            </View>

            <View style={styles.rightColumn}>
              <Text style={styles.itemTitle}>{item.descr}</Text>
              {!!item.prompt_response && <Text style={styles.itemPrompt}>{item.prompt_response}</Text>}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // For older weeks label
  const labelForWeekKey = (weekKey: string) => {
    const d = new Date(weekKey);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Week of ${label}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.headlineMedium, styles.pageTitle]}>My steps so far …</Text>

      {/* This Week */}
      <WeekHeader
        title="This week"
        open={showThisWeek}
        onToggle={() => setShowThisWeek((s) => !s)}
        count={thisWeekItems.length}
      />
      {showThisWeek && thisWeekItems.length > 0 && (
        <FlatList
          data={thisWeekItems}
          keyExtractor={(i) => i.step_id.toString()}
          renderItem={({ item }) => <StepCard item={item} />}
        />
      )}
      {showThisWeek && thisWeekItems.length === 0 && (
        <Text style={styles.emptyText}>No entries yet this week.</Text>
      )}

      {/* Last Week (only if present) */}
      {lastWeekItems.length > 0 && (
        <>
          <WeekHeader
            title="Last week"
            open={showLastWeek}
            onToggle={() => setShowLastWeek((s) => !s)}
            count={lastWeekItems.length}
          />
          {showLastWeek && (
            <FlatList
              data={lastWeekItems}
              keyExtractor={(i) => i.step_id.toString()}
              renderItem={({ item }) => <StepCard item={item} />}
            />
          )}
        </>
      )}

      {/* Older weeks */}
      {olderWeeks.map(({ weekKey, items }) => {
        const open = openOlderWeeks[weekKey] ?? false;
        return (
          <View key={weekKey}>
            <WeekHeader
              title={labelForWeekKey(weekKey)}
              open={open}
              onToggle={() =>
                setOpenOlderWeeks((prev) => ({ ...prev, [weekKey]: !prev[weekKey] }))
              }
              count={items.length}
            />
            {open && (
              <FlatList
                data={items}
                keyExtractor={(i) => i.step_id.toString()}
                renderItem={({ item }) => <StepCard item={item} />}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding: 16,
  },
  pageTitle: {
    marginBottom: 12,
  },
  card: {
    padding: 12,
    paddingBottom:20,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  // Section header
  headerRow: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e6e6e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight:28,
    marginBottom: 8
  },
  cardRow: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  leftColumn: {
    width: 90,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },

  rightColumn: {
    flex: 1,
    padding: 10
  },
  dateMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  dateYear: {
    fontSize: 14,
    color: '#777',
  },
// Title/Prompt
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
    color: '#222',
  },
  itemPrompt: {
    fontSize: 14,
    color: '#444',
  },
  pillContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  backgroundColor: '#6A5ACD', // or your theme color
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 4,
},
  pillText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},

});
