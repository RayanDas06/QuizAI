import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';

const ChatbotPopup = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [message, setMessage] = useState('');

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleSendMessage = () => {
        // Handle sending the message to the chatbot
        console.log('Sending message:', message);
        setMessage('');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.chatButton} onPress={handleOpenModal}>
                <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>

            <Modal isVisible={isModalVisible} onBackdropPress={handleCloseModal}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Chatbot</Text>
                    <View style={styles.messagesContainer}>
                        {/* Render chat messages here */}
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 20,
    },
    chatButton: {
        backgroundColor: '#a39193',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    chatButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        height: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#a39193',
    },
    messagesContainer: {
        flex: 1,
        // Add styles for the messages container
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#a39193',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#a39193',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default ChatbotPopup;
