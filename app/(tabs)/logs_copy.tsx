import React, { useCallback, useEffect, useState } from 'react';
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

export default function LogScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();

  const [completedSteps, setCompletedSteps] = useState<any[]>([]);

  const fetchStepData = async () => {
       
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
            router.replace("/signin");
            return;
        }
        try {
            const response = await get('/course/user-course-history', 
                {course_id: '1'},token); // API call
            if (response.status === 401) {
              // Token invalid or expired — handle it
              router.push('/settings/logout')
              return;
            }
            if (!Array.isArray(response) || response.length === 0) {
                console.warn("No course steps found.");
                return;
            }
            console.log(response)
            setCompletedSteps(response);
            
        } catch (e) {
            console.error('Error fetching course step:', e);
        }
        
    };

  useFocusEffect(
    useCallback(() => {
        fetchStepData();

    }, [])
  );

  const handleThemePress = (step_id: string) =>{
    console.log('press' + step_id)
    router.push(`/(tabs)/course?step_id=${step_id}`);
    
    
  };

  return (
    <View style={[styles.container]}>
       <Text style={[typography.headlineMedium, styles.title]}>My steps so far ...</Text>

      <FlatList
        data={completedSteps}
        keyExtractor={(item) => item.step_id.toString()}
        renderItem={({ item }) => {

          const date = new Date(item.entry_date);
          const formattedMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Jul 25"
          const formattedYear = date.getFullYear(); // "2025"

          return (
            <TouchableOpacity onPress={() => handleThemePress(item.step_id.toString())}>
            <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
              <View style={[styles.pillContainer, {backgroundColor:theme.secondary}]}>
                <Text style={[styles.pillText, {color: theme.secondaryButtonText}]}>{item.name}</Text>
              </View>
              <View style={styles.cardRow}>
              <View style={styles.leftColumn}>
                <Text style={styles.dateMonth}>{formattedMonth}</Text>
                <Text style={styles.dateYear}>{formattedYear}</Text>
                
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.title}>{item.descr}</Text>
                <Text >{item.prompt_response}</Text>
                
              </View>
              </View>
            </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding: 16,
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
