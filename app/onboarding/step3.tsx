import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { getTypography } from '@/constants/ThemedTypography';
import { Colors } from '@/constants/Colors';
import PrimaryButton from '@/components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecondaryButton from '@/components/SecondaryButton';
import { post, put } from '@/lib/apiClient';

const { height: windowHeight } = Dimensions.get('window');


export default function OnboardingChat() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? 'light'];
  const typography = getTypography(scheme ?? 'light');
  const router = useRouter();
  
  const scrollRef = useRef<ScrollView | null>(null);
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [clarifyAttempts, setClarifyAttempts] = useState(0);
  const [answers, setAnswers] = useState({});
  const [male, setMale] = useState(false);
  const [showChurchForm, setShowChurchForm] = useState(false);
  const [church, setChurch] = useState('')
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchId, setSearchId] = useState('new');
  const [clarificationMode, setClarificationMode] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const questions = [
  {
    key: 'start',
    question: 'You ready to walk this out together?',
    placeholder: '',
    optional: false,
    type: 'pills',
    options: ['✅ Yep, let’s go', '🤔 Tell me more first'],
  },
  {
    key: 'name',
    question: `First up… what should I call you?
(No pressure. Could be your real name, middle name, or just 'yo.')`,
    placeholder: 'Your name please',
    optional: false,
    type: 'text',
  },
  {
    key: 'tone',
    question: `Nice to meet you, ` + userName +  `🐾
Now, I talk to a lot of humans… how do you want me to show up for you?`,
    placeholder: 'holistic, conventional, both',
    optional: false,
    type: 'pills',
    options: [`🧢 Keep it real — light on fluff. I'm here to get clarity and take action`, ` 💬 Mix of fun + faith — coach me, but don’t make it boring`, `❤️ Gentle and encouraging — I’m healing or easing back in`],
  },
  {
    key: 'pronouns',
    question: 'Want me to refer to you a certain way when I reflect things back?',
    placeholder: 'e.g. I have a primary care doctor I love',
    optional: false,
    type: 'pills',
    options: ["He/Him", "She/Her", "They/Them", "Prefer not to say"],
  },
  {
    key: 'age',
    question: `How young is your soul these days?`,
    placeholder: 'Your age please',
    optional: false,
    type: 'number',
  },
  {
    key: 'location',
    question: `And where in the world are you walking this thing out?`,
    placeholder: 'City, state or country',
    optional: false,
    type: 'text',
  },
  {
    key: 'spiritual_context',
    question: 'Spiritual checkpoint time — where would you say you’re at in your walk?',
    placeholder: '',
    optional: false,
    type: 'pills',
    options_male: ['🛡 Solid — just want to stop dating on autopilot.', ' 📖 Trying to hear God more clearly in relationships.',
         '🔥 Faith is core. Clarity is mission.','🤷 Still figuring it out. But I’m open.'],
    options_female: ['🌱 Learning to trust God again.',
                    '🕊 Healing. Taking it one prayer at a time.',
                    '🙏 Faith is important, but I’ve been distant lately.',
                    '😶 “Prefer not to say right now.']
  },
  {
    key: 'dating_season',
    question: 'What season are you in right now?',
    placeholder: '',
    optional: false,
    type: 'pills',
    options: ['👀 I’m dating, but I want to do it differently this time.',
                '🔁 Taking a break, but still curious.',
                '💔 Recently ghosted, divorced, or disappointed.',
                '✝️ “Focused on God first — open to whatever’s next.']

  },
  {
    key: 'church_affiliation',
    question: `Totally optional — but helpful for how I support you:
 Are you connected to a local church or faith community?`,
    placeholder: 'e.g. diabetes, menopause, asthma',
    optional: true,
    type: 'pills',
    options: ['🙌 Yes, and I’m active',
                '🪑 I attend sometimes',
                '😶 Not right now',
                '🤔 Still figuring that part out',
                '❌ Prefer not to say'
            ]
  }
];

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timeout);
  }, [current]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [history, loading]);

  
  const advance = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setClarifyAttempts(0);
    setCurrent((prev) => prev + 1);
    setLoading(true);
  };

  const handleTextSubmit = async () => {
    const raw = input.trim();
    const question = questions[current];

    setHistory((prev) => [...prev, { type: 'answer', text: input }] );
    setInput('');

    if (question.key == 'name'){
        setUserName(raw)
    }

    if (clarificationMode) {
        const token = await AsyncStorage.getItem('userToken');
        const zip = await AsyncStorage.getItem('userZip');
        console.log('calling ai')
        const response = await post('/doctors/search/ai', {
        user_input: 'Help me find a care team built around me.',
        zip_code: zip,
        search_id: searchId,
        }, token);

        setSearchId(response.search_id || 'new');

       if (response.clarification_questions?.length > 0) {
            const combined = response.clarification_questions.join('\n');
            setHistory((prev) => [...prev, { type: 'question', text: combined }]);
            setClarificationQuestions(response.clarification_questions);
            setClarificationMode(true);
            setLoading(false)
            return;
        }

        if (response.results?.length > 0) {
            setClarificationMode(false);
            setHistory([]);
            await put('/user',{onboard_status: "complete"}, token)
            router.push({
            pathname: '/(modals)/care-team-search-res',
            params: {
                doctorResults: JSON.stringify(response.results),
                next: '/care-team',
            }
            });
        }
        return;
    }
    if (raw.length > 0 || question.optional) {
      advance(question.key, raw);
    } else {
      if (clarifyAttempts === 0) {
        setHistory((prev) => [...prev, { type: 'clarify', text: 'I didn’t catch that — could you try again?' }]);
        setClarifyAttempts(1);
      } else if (clarifyAttempts === 1) {
        setHistory((prev) => [...prev, { type: 'clarify', text: 'Still didn’t get that. Would you mind giving it one more shot?' }]);
        setClarifyAttempts(2);
      } else {
        advance(question.key, '');
      }
    }
  };

  const handlePillSelect = (value) => {
    const question = questions[current];
    if (question.key == 'pronouns' && value == 'He/Him'){
        setMale(true)
    }
      console.log(question.key + ":" + value + ":")
     if (question.key == 'church_affiliation' && ['🙌 Yes, and I’m active',
                '🪑 I attend sometimes'].includes(value) ){
                  console.log("show church form")
        setShowChurchForm(true)
        
    }else {
        setHistory((prev) => [
        ...prev,
        { type: 'answer', text: value },
        ]);
        advance(question.key, value);
    }
  };

  

  const renderBubble = (item, i) => {
    if (item.type === 'question') {
      return <View key={i} style={[styles.bubbleQ, { backgroundColor: Colors.palette.light_grey }]}><Text>{item.text}</Text></View>;
    }
    if (item.type === 'answer') {
      return <View key={i} style={[styles.bubbleA, { backgroundColor: Colors.palette.light_blue }]}><Text>{item.text}</Text></View>;
    }
    if (item.type === 'clarify') {
      return <View key={i} style={styles.bubbleQ}><Text>{item.text}</Text></View>;
    }
    return null;
  };

  const submitAnswers = () => {
    setShowChurchForm(false)
    saveAnswers()
    
  }

  const currentQuestion = questions[current];
  const isTextInput = currentQuestion?.type === 'text';
  const isNumberInput = currentQuestion?.type === 'number';
  const isPillInput = currentQuestion?.type === 'pills';

  

  const saveAnswers = async () => {
    const token = await AsyncStorage.getItem('userToken'); 
    if (token != null){
        const response = await put('/user/profile', {
            age : parseInt(answers.age, 10) || 0,
            tone: answers.tone,
            pronouns : answers.pronouns,
            location : answers.location,
            spiritual_context : answers.spiritual_context,
            dating_season : answers.dating_season,
            church_affiliation : church
                }, token);
        setShowThankYou(true)
    }
  };

  useEffect(() => {
    console.log('in use effect', showChurchForm)
    console.log('in use effect', current)
    if (!submitted && (current < questions.length)) {
      setHistory((prev) => [...prev, { type: 'question', text: currentQuestion.question }]);
    } else if (current >= questions.length) {
        console.log(answers)
        setSubmitted(true);
        setLoading(true)
        setInput('');
        if (!showChurchForm){
          saveAnswers()
        }
               
    }
  }, [current]);

  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    style={[styles.wrapper, {backgroundColor: theme.background}]}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.container]}
        keyboardShouldPersistTaps="handled">
        
          <View style={[styles.centeredWelcome]}> 
            <Text style={styles.welcome}>Hey there! I’m WONda 🐾</Text>
            <Text style={styles.desc}>Your daily companion for this 28-day FaithSpark journey.{"\n"}
 I’m loyal, nosy (in a holy way), and really good at sniffing out soul clarity.</Text>

          </View>
        
          {history.map((item, i) => renderBubble(item, i))}
        
          {loading &&  (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#aaa" />
            <Text style={styles.typingText}>WONda is typing...</Text>
          </View>
          )}
        {!submitted && !loading && isTextInput && !clarificationMode && (
           <View style={[styles.chatInputContainer, { borderColor: theme.border }]}>
            <TextInput
              placeholder={currentQuestion.placeholder}
              value={input}
              onChangeText={setInput}
              style={styles.chatInput}
              multiline
            />
            <TouchableOpacity onPress={handleTextSubmit}>
              <Ionicons name="arrow-forward-circle" size={32} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}

        {!submitted && !loading && isNumberInput && !clarificationMode && (
           <View style={[styles.chatInputContainer, { borderColor: theme.border }]}>
            <TextInput
              placeholder={currentQuestion.placeholder}
              keyboardType="numeric"        // Shows number keyboard
              onChangeText={(text) => setInput(text.replace(/[^0-9]/g, ''))} // Removes non-digits
              value={input}
              style={styles.chatInput}
              multiline
            />
            <TouchableOpacity onPress={handleTextSubmit}>
              <Ionicons name="arrow-forward-circle" size={32} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}

        {!submitted && !loading && isPillInput && !clarificationMode && (
          <View style={styles.pillContainer}>
            {currentQuestion.key == 'spiritual_context' && male && (
                currentQuestion.options_male.map((opt) => (
                <TouchableOpacity key={opt} style={[styles.pill, {backgroundColor:theme.tabIconSelected}]} onPress={() => handlePillSelect(opt)}>
                    <Text style={styles.pillText}>{opt}</Text>
                </TouchableOpacity>
                ))
            )}

            {currentQuestion.key == 'spiritual_context' && !male && (
                currentQuestion.options_female.map((opt) => (
                <TouchableOpacity key={opt} style={[styles.pill, {backgroundColor:theme.tabIconSelected}]} onPress={() => handlePillSelect(opt)}>
                    <Text style={styles.pillText}>{opt}</Text>
                </TouchableOpacity>
                ))
            )}
            {currentQuestion.key != 'spiritual_context' && (
                currentQuestion.options.map((opt) => (
                <TouchableOpacity key={opt} style={[styles.pill, {backgroundColor:theme.tabIconSelected}]} onPress={() => handlePillSelect(opt)}>
                    <Text style={styles.pillText}>{opt}</Text>
                </TouchableOpacity>
                ))
            )}
          </View>
        )}

        {!submitted && showChurchForm && (
            <View>
                <View style={[styles.bubbleQ, { backgroundColor: theme.buttonSecondary }]}><Text>Wanna tell me the name of your church or group?
 Sometimes I connect people with meetups, SparkCircles, or clarity events.</Text></View>
                <View style={[styles.chatInputContainer, { borderColor: theme.border }]}>
            <TextInput
              placeholder=""
              value={church}
              onChangeText={setChurch}
              style={styles.chatInput}
              multiline
            />
            <TouchableOpacity onPress={submitAnswers}>
              <Ionicons name="arrow-forward-circle" size={32} color={theme.primary} />
            </TouchableOpacity>
          </View>
               
                
                        
            </View>
        )}

        {showThankYou &&(
          <View style={styles.finishWrap}>
            <Text style={styles.finishText}>You did it 🙌
 </Text>
            <Text style={styles.subText}>I’ve got everything I need to tailor this journey just for you.{"\n"}
 Your 28-Day Spark Walk™ officially begins tomorrow…{"\n"}
 Unless you want a sneak peek now. 👀</Text>

 <PrimaryButton title="Let's start now" onPress={() => router.push('/(tabs)')} style={{ marginTop: 20 }} fullWidth='true' />
 
          </View>
        )}

        {clarificationMode && !loading && (

            <View style={[styles.chatInputContainer, { borderColor: theme.border }]}>
            <TextInput
                placeholder="Type your answer..."
                style={styles.chatInput}
                value={input}
                onChangeText={setInput}
                multiline
            />
            <TouchableOpacity onPress={handleTextSubmit}>
                <Ionicons name="arrow-forward-circle" size={32} color={theme.primary} />
            </TouchableOpacity>
            </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({ icon, ...props }) => {
  const theme = Colors['light'];
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={theme.icon} style={{ marginRight: 10 }} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholderTextColor={theme.subdued}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { padding: 20, paddingTop: windowHeight * 0.15, paddingBottom:60 },
  centeredWelcome: { justifyContent: 'center', alignItems: 'center', padding:16, marginBottom: 20 },
  welcome: { fontSize: 22, fontWeight: 'bold',textAlign: 'center' },
  desc: { fontSize: 16, marginTop: 8, color: '#444', textAlign: 'center' },
  tip: { fontStyle: 'italic', marginTop: 4, color: '#777', textAlign: 'center' },
  bubbleQ: {
    padding: 12,
    borderRadius: 16,
    
    marginTop: 16,
    marginBottom: 12,
  },
  bubbleA: { padding: 12, borderRadius: 16, marginTop: 6, alignSelf: 'flex-end',backgroundColor: '#f1f1f1' },
  typingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  typingText: { marginLeft: 6, color: '#888' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    marginHorizontal: 12,
    backgroundColor: '#fff',
    minHeight: 64,
    maxHeight: 120,
    
  },

  chatInput: {
    flex: 1,
    fontSize: 16,
    paddingRight: 36, // space for the send button
  },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  pill: {  paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  pillText: { color: 'white', fontWeight: '600' },
  skip: { textAlign: 'center', color: '#aaa', marginTop: 10 },
  finishWrap: { alignItems: 'center', marginTop: 30 },
  finishText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subText: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});