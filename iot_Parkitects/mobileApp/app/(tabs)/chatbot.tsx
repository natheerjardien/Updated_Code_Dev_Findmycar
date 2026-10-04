//(Withfra.me, 2022)
//Chatbot screen for the Parkitects mobile app, this screen allows users to interact with a chatbot that provides answers 
//to frequently asked questions about parking
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import StatsCard from "@/components/ticket/StatsCard";
import { Colors } from '@/constants/theme';

//These are the frequently asked questions that the chatbot can answer,
//each question is a string in the faqOptions array
const faqOptions = [
  //The user can select one of these questions to get an answer from the chatbot
  "What time is the parking usually full?",
  "Which day is usually the busiest?",
  "What are the parking rules?",
  "How do I find my parked car?",
  "How does parking availability work?",
  "Report a parking problem",
];


//icon
function BotMessage({ text }: { text: string }) {
  return (
    <View style={styles.botRow}>
      <View style={styles.botIcon}>
        <Image
          source={require("../../assets/images/byte-bot.png")}
          style={styles.botImage}
        />
        {/* Later: swap for your bot <Image /> here */}
      </View>
      <View style={styles.botMessage}>
        <Text style={styles.botMessageText}>{text}</Text>
      </View>
    </View>
  );
}


export default function ChatbotScreen() {
  //This stores the question selected by the user
  const [message, setMessage] = useState("");
  // Stores the history of selected questions and their answers
  const [chatHistory, setChatHistory] = useState<{question: string, answer: string}[]>([]);
  // Controls whether the FAQ options or the "Back to Questions" button is showing
  const [showOptions, setShowOptions] = useState<boolean>(true);
  // Provides the scrollview to automatically go down when a new question is added
  const scrollViewRef = useRef<ScrollView>(null);

  // This function runs when the user selects a question from the list of frequently asked questions, 
  // then it saves the selected question so that the answer can be displayed
  const handleQuestion = (question: string) => {
    // Add the new question and its answer to the bottom of the chat history
    setChatHistory((prev) => [...prev, { question, answer: getAnswer(question) }]);
    // Afterwards, hide the options and show the back button
    setShowOptions(false);
  };


  //This function takes the user back to the list of questions when they click the back button, it resets the selected question
  const handleBack = () => {
    setShowOptions(true);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        // Triggers the scroll to the bottom when the user returns to the question
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
      
        <StatsCard/>

        {/*Chat Bot Message (need to put byte bot pic later) */}
       <BotMessage text="Hi! I'm Parkitects' helper. Choose a question below and I'll point you in the right direction." />

        {/* Stack Overflow, 2018 */}
        {/* Chat History */}
        {chatHistory.map((chat, index) => (
  <View key={index}>
    <View style={styles.selectedQuestionContainer}>
      <Text style={styles.selectedQuestionText}>
        {chat.question}
      </Text>
    </View>
    <BotMessage text={chat.answer} />
  </View>
))}

        {/* FAQ Buttons */}
        {showOptions && (
          <View style={styles.questionsContainer}>
            {faqOptions.map((question) => (
              <TouchableOpacity
                key={question}
                style={styles.questionButton}
                onPress={() => handleQuestion(question)}
              >
                <Text style={styles.questionText}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Back Button */}
        {!showOptions && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>
              Back to Questions
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

    
    </View>
  );
}

//The function getAnswer checks which question the user selected 
//and returns the corresponding answer to be displayed on the screen
function getAnswer(question: string) {
  //A switch statement is used to match the question and return the correct answer
  switch (question) {
    case "What time is the parking usually full?":
      return "Parking is usually busiest during peak arrival times. Check the live parking map for the current availability.";

    case "Which day is usually the busiest?":
      return "Mondays when everyone decides they have to do better.";

    case "What are the parking rules?":
      return "- Park within the marked parking bay. \n- When entering campus do NOT exceed the speed limit of 20km. \n- Do NOT park by the pick and drop area.";

    case "How do I find my parked car?":
      return "Use our Find My Parking by navigating to the notifications page on the home screen to locate your parked vehicle using the Bluetooth signal from the parking sensor.";

    case "How does parking availability work?":
      return "Parking sensors detect whether a bay is occupied and updates the parking map in real-time.";

    case "Report a parking problem":
      return "You can report a parking problem by navigating to the tickets screen and then create a ticket and select the relevant parking bay.";

    default:
      return "Please select one of the questions above.";
  }
}

//This is the styling section for the chatbot screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
   backgroundColor: Colors.light.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },

  

  /* Bot message */
  botMessage: {
    backgroundColor: "#EEF0F7",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexShrink: 1,
  },

  /* Bot message */
botRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  marginBottom: 18,
  maxWidth: "95%",
},

botIcon: {
  width: 38,
  height: 38,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
},

botImage: {
  width: 48,
  height: 48,
  resizeMode: "contain",
},


  botMessageText: {
    fontSize: 17,
    lineHeight: 27,
    color: "#354052",
  },

  /* FAQ buttons */
  questionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },

  questionButton: {
    borderWidth: 1.5,
    borderColor: "#8C8D96",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },

  questionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#42555c",
  },

  /* Selected Question */
  selectedQuestionContainer: {
    backgroundColor: "#eef7ef",
    borderWidth: 1.5,
    borderColor: "#8C8D96",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
    alignSelf: "flex-end",
    maxWidth: "90%",
    borderRadius: 20,
  },

    selectedQuestionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: "#42555c",
  },

  /* Answer */
  answerContainer: {
    backgroundColor: "#eef7ef",
    borderRadius: 18,
    padding: 18,
    marginTop: 4,
    marginBottom: 10,
  },

  answerText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#354052",
  },

  /* Back Button */
  backButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#eef7ef",
    marginTop: 10,
  },

  backButtonText: {
    color: "#354052",
    fontSize: 16,
    fontWeight: "600",
  },
  

  input: {
    flex: 1,
    fontSize: 17,
    color: "#354052",
  },

  
});
/**
 * References
 * Stack Overflow, 2018. React native: rendering conditional component based on state value change in Modal. (Version 2.0) [Source Code] Avaiable at: <https://stackoverflow.com/questions/53206388/react-native-rendering-conditional-component-based-on-state-value-change-in-mod> [Accessed 31 August 2026].
 * Withfra.me. 2022. Ready to Use React Native Components - WithFrame | withfra.me. (Version 2.0) [Source code] Available at:<https://withfra.me/components > [Accessed 17 Aug. 2026].
 */