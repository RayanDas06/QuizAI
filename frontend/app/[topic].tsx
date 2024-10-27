import Chat from "../components/Chatbot";
import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Alert,
  Image,
} from "react-native";

export default function Topic() {
  const { topic } = useLocalSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [refetch, setRefetch] = useState(0);
  const [selectedQuestion, setSelectedQuestionIndex] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(
    undefined,
  );
  const [chatOpen, setChatOpen] = useState(false);

  const selectedQuestionIndex =
    selectedQuestion >= 0
      ? selectedQuestion % questions.length
      : ((selectedQuestion % questions.length) + questions.length) %
        questions.length;
  const question = questions[selectedQuestionIndex];

  const correctAnswer = !!question
    ? { a: 0, b: 1, c: 2, d: 3 }[question.answer]
    : undefined;

  useEffect(() => {
    fetchData(topic as string).then(setQuestions);
  }, [topic, refetch]);

  useEffect(() => {
    if (question) {
      Audio.Sound.createAsync({ uri: question.questionAudio }).then((s) =>
        setSound(s.sound),
      );
    }
  }, [questions, selectedQuestion]);

  useEffect(() => {
    sound?.playAsync();

    return () => {
      sound?.stopAsync();
    };
  }, [sound]);

  useEffect(() => {
    setSelectedAnswer(undefined);
  }, [selectedQuestion]);

  if (!question)
    return (
      <View style={styles.container}>
        <Text> loading.... </Text>
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            padding: 8,
            backgroundColor: "blue",
          }}
          onPress={() => setRefetch((n) => n + 1)}
        >
          <Text style={styles.counterButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/en/c/c2/Peter_Griffin.png",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      {question.answers.map((ans, i) => (
        <TouchableOpacity
          style={{
            ...styles.optionButton,
            backgroundColor:
              selectedAnswer === i
                ? correctAnswer === i
                  ? "#00FF00"
                  : "#FF0000"
                : "white",
          }}
          key={`${question.id}-${i}`}
          onPress={() => {
            setSelectedAnswer(i);
            Audio.Sound.createAsync({ uri: ans.answerAudio }).then((s) =>
              setSound(s.sound),
            );
          }}
        >
          <Text style={styles.optionText}>
            {["a", "b", "c", "d"][i]}. {ans.answer}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.counterButton}>
          <Chat
            questionID={question?.id || ""}
            visible={chatOpen}
            setVisible={setChatOpen}
            selectedQuestion={
              (["a", "b", "c", "d"] as const)[selectedAnswer || 0]
            }
          ></Chat>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setSelectedQuestionIndex((i) => i - 1)}
        >
          <Text style={styles.counterButtonText}>Previous Question</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setSelectedQuestionIndex((i) => i + 1)}
        >
          <Text style={styles.counterButtonText}>Next Question</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 54,
    gap: 16,
  },
  image: {
    width: "100%",
    height: 350,
    borderRadius: 12,
    marginBottom: 10,
    objectFit: "contain",
  },
  bottomButtons: {
    marginTop: "auto",
    gap: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  counterButton: {
    backgroundColor: "black",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  counterButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});
async function fetchData(topicID: string): Promise<Array<Question>> {
  const res = await fetch(
    `https://pr3pxwe35maanib7ukld3gxlru0omfeg.lambda-url.us-east-1.on.aws/topic/${topicID}`,
  );
  const { questions } = await res.json();

  return questions;
}

type Question = {
  text: string;
  id: string;
  questionAudio: string;
  answer: "a" | "b" | "c" | "d";
  answers: Array<{
    answer: string;
    explanation: string;
    answerAudio: string;
  }>;
};
