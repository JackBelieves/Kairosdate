import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme, Modal, TouchableWithoutFeedback, Dimensions, ImageBackground, useWindowDimensions, TextInput } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getTypography } from '@/constants/ThemedTypography';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post } from '@/lib/apiClient';
import RenderHTML from 'react-native-render-html';
import { marked } from 'marked';
import PrimaryButton from '@/components/PrimaryButton';
const screenHeight = Dimensions.get('window').height;

const Dashboard = () => {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();
  const { step_id } = useLocalSearchParams<{ step_id: string }>();
  
  console.log(step_id)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLines, setModalLines] = useState<string[]>([]);
  const [modalIcon, setModalIcon] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [courseStep, setCourseStep] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [promptKey, setPromptKey] = useState(null)
  const [customResponse, setCustomResponse] = useState('');
  const [clarityRating, setClarityRating] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const greetings = ['Good morning', 'Good afternoon', 'Good evening'];
  const bgImages = [
    require('../../assets/images/bg1.jpg'),
    //require('../assets/bg2.jpg'),
    //require('../assets/bg3.jpg')
    ];

 const getGreeting = () => { 
    const hour = new Date().getHours();
    if (hour < 12) return greetings[0];
    if  (hour < 18) return greetings[1];
    return greetings[2];
  };
  const tileData = [
    {
      title: '🙌 Micro Action',
      text:
        courseStep?.spark_action || [],
      colors: ['#ffe259', '#ffa751']
    },
    {
      title: '✍️ Journal Prompt',
      text:
        courseStep?.journal_prompt || [],
      colors: ['#a1c4fd', '#c2e9fb']
    },
    {
      title: '🗣️ Conversation Starter',
      text:
       courseStep?.conversation_starter || [],
      colors: ['#fbc2eb', '#a6c1ee']
    },
    {
      title: '⚡ NOW (N)',
      text:
        ['I’m known for turning awkward first dates into podcast-worthy conversations. If you’ve got range, let’s talk.'],
      colors: ['#d4fc79', '#96e6a1']
    }
  ];

  const [background, setBackground] = useState(bgImages[0]);
  const initialize = async () => {
    const index = Math.floor(Math.random() * bgImages.length);
    setBackground(bgImages[index]);

    const name = await AsyncStorage.getItem('userFirstName');
    setFirstName(name === null ? '' : name);
  };

  const fetchStepData = async (id: string) => {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
            router.replace("/(auth)/signin");
            return;
        }
        try {
          const payload = id
          ? { course_id: "1", step_id: id }   // use the latest param
          : { course_id: "1" };
          console.log(payload)
            const response = await get('/course/user-course-steps', 
                payload,token); // API call

            if (response.status === 401) {
              // Token invalid or expired — handle it
              router.push('/settings/logout')
              return;
            }
            
            setCourseStep(response);
            if (response.prompt_key){
              setPromptKey(response.prompt_key)
            
            }else {
              if (response.prompt_response){
                  setCustomResponse(response.prompt_response)
                  setSelectedResponse('custom')
              }
            }
            if (response.clarity_meter){
              setClarityRating(response.clarity_meter)
            }
            
        } catch (e) {
            console.error('Error fetching course step:', e);
        }
        
    };

  useFocusEffect(
    useCallback(() => {
        
        initialize();
        fetchStepData(step_id);

    }, [step_id])
  );

  const MarkdownContent = ({ markdown }: { markdown: string }) => {
    const { width } = useWindowDimensions();
    const html = marked(markdown); // Convert markdown to HTML

    return <RenderHTML contentWidth={width} baseStyle={{ lineHeight: 20}} source={{ html }} />;
  };
  
  const openModal = (title: string, lines: string[], icon?: React.ReactNode) => {
    setModalTitle(title);
    setModalLines(lines);
    setModalIcon(icon || null);
    setModalVisible(true);
    };

  const closeModal = () => {
    setModalVisible(false);
  };

  const savePromptOption = (key, value) => {
    setSelectedResponse(value)
    setPromptKey(key)
    setCustomResponse('')
  }

  const saveCustomResponse = () => {
    if (!customResponse){
      setErrorMessage("Please select one of the options below or write your own.")
      return
    }
    setSelectedResponse(customResponse)
    setPromptKey(null)
  };

  const completeStep = async (clarityId: number) => {

    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
            router.replace("/signin");
            return;
    }
    const payload = {
      course_id: courseStep.course_id,
      step_id: courseStep.step_id,
      prompt_key: promptKey,
      prompt_response: selectedResponse === 'custom' ? customResponse : selectedResponse,
      clarity_meter: clarityId
    };

    try {
      await post('/course/complete-step', payload, token);
      setSelectedResponse(null)
      const response = await get('/course/user-course-steps', 
                {course_id: '1', step_id: courseStep.step_id.toString()},token); // API call

      setPromptModalVisible(false);
      setCourseStep(response);
      if (response.prompt_key){
          setPromptKey(response.prompt_key)
      }else {
        if (response.prompt_response){
            setCustomResponse(response.prompt_response)
            setSelectedResponse('custom')
        }
      }
      if (response.clarity_meter){
          setClarityRating(response.clarity_meter)
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.greetingRow}>
        <Ionicons name="sunny" size={24} color={Colors.palette.dark_gray} style={styles.icon} />
        <Text style={[styles.greetingText, {color: Colors.palette.dark_gray}]}>{getGreeting()}, {firstName}</Text>
      </View>

      <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
        <Text style={[typography.sectionCaption, , styles.sectionCaption]}>{courseStep.name}</Text>
        <Text style={styles.title}>{courseStep.descr}</Text>
        <View style={[styles.pillContainer, {backgroundColor:theme.secondary}]}>
        <Ionicons name="trophy" size={14} color={theme.secondaryButtonText} style={styles.pillIcon} />
        <Text style={[styles.pillText, {color: theme.secondaryButtonText}]}>Today’s Win</Text>
        </View>
        {courseStep?.win?.map((text, idx) => (
            <MarkdownContent key={idx} markdown={text} />
            ))}
     
      </View>

      <Pressable onPress={() => setPromptModalVisible(true)}>
        <ImageBackground source={background} style={styles.promptCard} imageStyle={styles.bgImage}>
          {!courseStep?.prompt_response && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#010101", opacity: 0.55 }]} />}
  
        <View style={styles.promptCardContent}>
          <Text style={styles.promptText}>💬 Today's Prompt</Text>
          <Text style={styles.promptTitle}>{courseStep?.prompt?.prompt}</Text>
          <Text style={styles.promptBody}>
            {courseStep?.prompt_response ?? courseStep?.prompt_desc}
          </Text>
        </View>
        </ImageBackground>
      </Pressable>

    <Pressable onPress={() =>
        openModal(
        'Scripture',
        courseStep?.scripture,
        <FontAwesome5 name="bible" size={20} color="#6A5ACD" style={[styles.icon]} />
        )
    } style={[styles.card, {backgroundColor: theme.cardBackground}]}>
      <View style={styles.row}>
        <View style={styles.textColumn}>
        <Text style={[typography.sectionCaption, , styles.sectionCaption]}>Guided scripture</Text>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>Scripture for the Day</Text>
        </View>
        <FontAwesome5
            name="bible"
            size={50}
            color="#6A5ACD" // SlateBlue or any theme color you like
            style={[styles.icon, {marginTop:10}]}
            />
      </View>
      </Pressable>

    <Pressable onPress={() =>
        openModal(
        'Devotional Insight',
        courseStep?.devotional_ins,
        <FontAwesome5
            name="fire"
            size={20}
            color="#FF4500" // SlateBlue or any theme color you like
            style={[styles.icon]}
            />
        )
    } style={[styles.card, {backgroundColor: theme.cardBackground}]}>
      <View style={styles.row}>
        <View style={styles.textColumn}>
        <Text style={[typography.sectionCaption, , styles.sectionCaption]}>Devotional Insight</Text>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>{courseStep?.devotional_ins?.length > 0 && courseStep.devotional_ins[0]}</Text>
        </View>
        <FontAwesome5
            name="fire"
            size={50}
            color="#FF4500" // SlateBlue or any theme color you like
            style={[styles.icon, {marginTop:10}]}
            />
      </View>
      </Pressable>

      <View style={styles.tileContainer}>
        {tileData.map((item, index) =>
    item.text.length > 0 ? (
          <Pressable
            key={index}
            style={styles.tileWrapper}
            onPress={() => openModal(item.title, item.text)}
          >
            <LinearGradient
              colors={item.colors}
              style={styles.tile}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
               <Text style={styles.tileTitle}>
                    {item.title}
                </Text>
            </LinearGradient>
          </Pressable>
        ):null
        )}
      </View>
      
      <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
        <View style={[styles.pillContainer, {backgroundColor:theme.secondary}]}>
        <Ionicons name="checkmark-circle" size={14} color={theme.secondaryButtonText} style={styles.pillIcon} />
        <Text style={[styles.pillText, {color: theme.secondaryButtonText}]}>Progress Cue</Text>
        </View>
        {courseStep?.progress_q?.map((text, idx) => (
            <MarkdownContent key={idx} markdown={text} />
            ))}
       
      </View>

      <View style={[styles.card, {backgroundColor: theme.cardBackground}]}>
        <Text style={[typography.sectionCaption, , styles.sectionCaption]}>💬 WONLiner of the Day:</Text>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>
          "{courseStep?.won_liner}"
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        >
        <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                {(modalIcon || modalTitle) && (
                    <View style={styles.modalHeadRow}>
                    {modalIcon && <View style={styles.iconWrap}>{modalIcon}</View>}
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    </View>
                )}
                
                <ScrollView>
                    {modalLines?.map((line, idx) => (
                     <MarkdownContent key={idx} markdown={line} />
                    ))}
                </ScrollView>
                <Pressable onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
                </Pressable>
            </View>
            </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
      animationType="slide"
      transparent={true}
      visible={promptModalVisible}
      onRequestClose={() => setPromptModalVisible(false)}
    >
      <View style={styles.fullscreenOverlay}>
        <View style={[styles.fullscreenCard, {backgroundColor:theme.background}]}>
          <ScrollView>
            <Pressable
            style={styles.closeButton}
            onPress={() => setPromptModalVisible(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>

            {!selectedResponse || selectedResponse === 'custom'? (
              <>
                {errorMessage !== '' && (
                        <Text style={[typography.errorMessage, { textAlign: 'center', marginBottom: 12,  }]}>
                            {errorMessage}
                        </Text>
                )}
                <View style={styles.textColumn}>
                <Text style={[typography.sectionCaption, , styles.sectionCaption]}>Choose one response</Text>
                <Text style={[typography.sectionTitle, styles.sectionTitle]}>{courseStep?.prompt?.prompt}</Text>
                </View>
                {courseStep?.prompt?.fixed_responses?.map((item, idx) => (
                  <Pressable
                    key={idx}
                    style={[styles.optionCard, {backgroundColor:
                      promptKey && promptKey === item.key
                          ? theme.tintDark
                          : theme.cardBackground,}]}
                    onPress={() => savePromptOption(item.key, item.value)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={[styles.optionEmoji, (promptKey && promptKey == item.key) && { color: theme.tintLight}]}>{item.emoji}</Text>
                      <Text style={[styles.optionTheme, (promptKey && promptKey == item.key) && { color: theme.tintLight}]}>{item.theme}</Text>
                      <Text style={[styles.optionKey, (promptKey && promptKey == item.key) && { color: theme.tintLight}]}>{item.key}</Text>
                    </View>
                    <View><Text style={(promptKey && promptKey == item.key) && { color: theme.tintLight}}>{item.value}</Text></View>
                  </Pressable>
                ))}
                <Pressable style={styles.customInputWrapper} onPress={() => setSelectedResponse('custom')}>
                  <Text style={[typography.sectionCaption, , styles.sectionCaption]}>+ Write your own</Text>
                </Pressable>
                {selectedResponse === 'custom' && (
                  <>
                  <TextInput
                    style={[styles.textInput, {backgroundColor:theme.cardBackground}]}
                    placeholder="Write your own response here..."
                    value={customResponse}
                    onChangeText={setCustomResponse}
                    multiline
                  />
                  <PrimaryButton title="Save Response" style={{marginTop:10}} onPress={saveCustomResponse} />
                  </>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{courseStep?.clarity_questions?.question}</Text>
                {courseStep?.clarity_questions?.answers?.map((answer) => (
                  <Pressable
                    key={answer.id}
                    style={[styles.optionCard,{ backgroundColor:theme.cardBackground}]}
                    onPress={() => {
                      setClarityRating(answer.id);
                      completeStep(answer.id);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={styles.optionEmoji}>{answer.emoji}</Text>
                    <Text>{answer.value}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
          
        </View>
      </View>
    </Modal>
      
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  row: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
    },

  textColumn: {
    flex: 1,
    paddingRight: 8,
    },
  icon: {
    marginRight: 8
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600'
  },
  card: {
    padding: 16,
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
    marginBottom: 8
  },
  sectionTitle: {
    marginTop:8,
  },
  sectionCaption: {
    marginTop:12
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20
  },
  bgImage: {
    resizeMode: 'cover',
    opacity: 0.9
  },
  promptCard: {
    height: screenHeight * 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
    position: 'relative'
  },
  promptCardContent: {
    padding:30,
  },
  promptTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    marginTop:30,
    marginBottom: 30
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8
  },
  promptBody: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  justifyContent: 'flex-end',
},
modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 40,
    maxHeight: '80%',
    minHeight: '80%',
  },
modalHeadRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom:12
},
iconWrap: {
  marginRight: 8,
  marginBottom:14
},

modalTitle: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 20,
},

modalText: {
  fontSize: 16,
  lineHeight: 24,
},

closeButton: {
  marginTop: 20,
  alignSelf: 'flex-end',
},

closeText: {
  fontSize: 14,
  color: '#007AFF',
  fontWeight: '600',
},
pillContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  backgroundColor: '#6A5ACD', // or your theme color
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 4,
  marginBottom: 12,
  marginTop:10
},

pillIcon: {
  marginRight: 6,
},

pillText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},
tileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  tileWrapper: {
    width: '48%',
    marginBottom: 12
  },
  tile: {
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },
    fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },

  fullscreenCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '80%',
    maxHeight: '90%',
  },

  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginTop:12,
    alignItems: 'center'
  },

  optionKey: {
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
  },

  optionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },

  optionTheme: {
    fontSize: 14,
    marginRight: 6,
    fontWeight: 'bold',
  },


  customInputWrapper: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },

  customInputLabel: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },

  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 10,
    textAlignVertical: 'top'
  },
});
