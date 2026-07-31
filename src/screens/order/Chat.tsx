import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';

// Vector Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ChatScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* KeyboardAvoidingView ensures the input stays above the keyboard */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDekeFZQ5s_iQKdiuPEgYVibanIQwvXomhg3nqW0ABP9RTDNS4ceEj2Rw8LnYAUcPCCctIhq6pSSxwyK8WlAc0ReDhIbNDOusQALKb_S6Q3NqFF55SIUgZ-Os7VOcD1mzmFKMvdukXRiT90uoS4wJmhpwBVfFqdp8uhe6fHsJrm1rw81o3t_jLa528eRxw-BR67xcZ6uugLLcXACJydKd7COiwVQ252gmGzQT9rVY86KaWZMyfyLx9fLv2ERVwnVrBOxI1uq4Y2f_1M',
                            }}
                            style={styles.profileImage}
                        />
                        <View>
                            <Text style={styles.name}>Ravi Kumar</Text>
                            <Text style={styles.rating}>⭐ 4.8</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.callButton}>
                        <Ionicons name="call-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Chat Body */}
                <ScrollView contentContainerStyle={styles.chatBody} showsVerticalScrollIndicator={false}>
                    <Text style={styles.timestamp}>Today, 10:30 AM</Text>

                    {/* Partner Message */}
                    <View style={styles.messageRow}>
                        <Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6q7YglEspfwT0Bu3mThT0WSGi7b3e8J0AzcWC6XV13OZY5nanpy3nzHPbh2JdkN4Jay2PNWBoOoXFtvqTukGjAWBb5tp4Eb32C48QIuZ8CDWbwCEbtMSpGtwpaLRFDLooJPtNoK_xOOddP6hNWMfbWHE8DUIDhaS-YcD_lx26M-19uIsTh0CwG8JVQKjRIc5M4lo1y6MIpwkU63gujvQHKZGK-u6vzkkKSC848IQqEPCVKtLPz-WJiyQnQDqwexfSmJx6Z7f6ylP7',
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.messageBubbleLeft}>
                            <Text style={styles.messageTextLeft}>
                                Hi, I've picked up your order and I'm on my way!
                            </Text>
                            <Text style={styles.time}>10:31 AM</Text>
                        </View>
                    </View>

                    {/* User Message */}
                    <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
                        <View style={styles.messageBubbleRight}>
                            <Text style={styles.messageTextRight}>
                                Great, thank you! See you soon.
                            </Text>
                            <Text style={styles.time}>10:32 AM</Text>
                        </View>
                        <Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbDJ8IYvO32WVSRY9qjiaa2IsIwOuZxXlJpmIKUhwOEEuwsu3FKGLjUxvfc-YHIgh3xNlKnLjat3TXNjM93zwo8Y4V8eD2NIe_ix32qjK7aTEWMChyKOxmdDbE-iU84FcT14yxqfeu7NNea27oOKWhhmZb_vAZSWhQa7t2wDZa57k3c0YjdHl1kbKpE5A8R3qRdW7BUQ5WAb_l18zbNTIU4wn2WWbff7DvJ7nQQQGmwIm2GI5ynJFL4mF0IpxMeP4Ph-jyLtxiB2TY',
                            }}
                            style={styles.avatar}
                        />
                    </View>

                    {/* Partner Message */}
                    <View style={styles.messageRow}>
                        <Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJKTf1Ov1C2eWLWLCAak_x8nGNGyopgVkSnWA0HeXpUjLgU3SQDRFpNg8vlqMIc2aafKIqCaokKcIW-uTAXaQMcOXjF57mrjy3aj-MzHcSkJna1MPpJ6s20yFS5Kfb76EuzflK7FrfUahEIyuY5X0bNpUCfWP47WrvJXSqLnjiXqMRrnkSo3rC1P3yymo6PbDAkuivk5728hCpUUQfTytclkRD3rv3zIBZhpsr3oRZ7ZpblsGsKhXThS_apTsLJVMvJXm-ZAM7dhix',
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.messageBubbleLeft}>
                            <Text style={styles.messageTextLeft}>
                                I'm approaching your location now. I'll be there in about 2
                                minutes.
                            </Text>
                            <Text style={styles.time}>10:45 AM</Text>
                        </View>
                    </View>

                    {/* User Message */}
                    <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
                        <View style={styles.messageBubbleRight}>
                            <Text style={styles.messageTextRight}>
                                Perfect, I'll come down to the lobby.
                            </Text>
                            <Text style={styles.time}>10:45 AM</Text>
                        </View>
                        <Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1QiCkP8FMpWtXWmY9bCg4tq2tcmLOm4Yf33Dw1tW0axt7AEWn5EioX6HtTmQaL4Nodw_yRTrUJXK9wUGHfG1GSZ33jPHsIyK1kShFm1ENl10JdYxvL4eIrcO-blVh4QNQC8vFBtW4BngJLLf4V8q6gy1eFisQwBX0dPLY2tFXE1oANaQXWXQCXxKLdA4Lhl2V2hPPgeppYA9sIz0kWbzNSR9CyJxzxs-nEENnar5sscjWQ6hqom2l_0FidCX7n-clt-St7rmG2N-m',
                            }}
                            style={styles.avatar}
                        />
                    </View>
                </ScrollView>

                {/* Composer */}
                <View style={styles.footer}>
                    <TextInput
                        placeholder="Type your message..."
                        placeholderTextColor={COLORS.muted}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.sendButton}>
                        <MaterialIcons name="send" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        elevation: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 999,
        backgroundColor: COLORS.muted,
    },
    name: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    rating: {
        color: COLORS.muted,
        fontSize: 13,
    },
    callButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatBody: {
        padding: 16,
    },
    timestamp: {
        textAlign: 'center',
        color: COLORS.muted,
        fontSize: 12,
        marginVertical: 8,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 6,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 999,
        backgroundColor: COLORS.muted,
    },
    messageBubbleLeft: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderBottomLeftRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8,
        maxWidth: '75%',
    },
    messageTextLeft: {
        color: COLORS.textPrimary,
        fontSize: 15,
    },
    messageBubbleRight: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        borderBottomRightRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        maxWidth: '75%',
    },
    messageTextRight: {
        color: COLORS.white,
        fontSize: 15,
    },
    time: {
        color: COLORS.muted,
        fontSize: 11,
        marginTop: 2,
        marginHorizontal: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 0.5,
        borderColor: '#ccc',
        backgroundColor: COLORS.white,
    },
    input: {
        flex: 1,
        height: 48,
        borderRadius: 999,
        paddingHorizontal: 16,
        backgroundColor: '#f1f1f1',
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    sendButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
