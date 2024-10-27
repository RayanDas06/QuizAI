import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text, ScrollView } from "react-native";

export default function Topic() {
  const { topic } = useLocalSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestionIndex] = useState(0);

  const selectedQuestionIndex =
    selectedQuestion >= 0
      ? selectedQuestion % questions.length
      : ((selectedQuestion % questions.length) + questions.length) %
        questions.length;
  const question = questions[selectedQuestionIndex];
  useEffect(() => {
    fetchData(topic as string).then(setQuestions);
  }, [topic]);
  useEffect(() => {
    let sound: Audio.Sound | undefined = undefined;
    if (!question) return;

    (async () => {
      sound = (
        await Audio.Sound.createAsync({
          uri: question.questionAudio,
        })
      ).sound;

      await sound.playAsync();
    })();

    return () => {
      sound?.unloadAsync();
    };
  }, [questions, selectedQuestion]);

  if (!question) return <Text> loading.... </Text>;

  return (
    <ScrollView style={styles.container}>
      {
      //   <View style={styles.topButtons}>
      //   <TouchableOpacity
      //     style={styles.counterButton}
      //     onPress={() => setSelectedQuestionIndex((i) => i - 1)}
      //   >
      //     <Text style={styles.counterButtonText}>-</Text>
      //   </TouchableOpacity>
      //   <TouchableOpacity
      //     style={styles.counterButton}
      //     onPress={() => setSelectedQuestionIndex((i) => i + 1)}
      //   >
      //     <Text style={styles.counterButtonText}>+</Text>
      //   </TouchableOpacity>
      //  </View>
      }
        {question.answers.map((ans, i) => (
          <TouchableOpacity
            style={styles.optionButton}
            key={`${question.id}-${i}`}
          >
            <Text style={styles.optionText}>
              {["a", "b", "c", "d"][i]}. {ans.answer}
            </Text>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  counterButton: {
    backgroundColor: "#007BFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  counterButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  counterText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
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
