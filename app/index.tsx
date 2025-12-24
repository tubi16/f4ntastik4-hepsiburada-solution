import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lojistik Uygulaması</Text>
            <Text style={styles.subtitle}>Lütfen giriş tipini seçiniz</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.customerButton]}
                    onPress={() => router.push('/customer')}
                >
                    <Text style={styles.buttonText}>👤 Müşteri Girişi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.courierButton]}
                    onPress={() => router.push('/courier')}
                >
                    <Text style={styles.buttonText}>🛵 Kurye Girişi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1a1a1a'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 50
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
        maxWidth: 400
    },
    button: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    customerButton: {
        backgroundColor: '#007AFF', // Blue
    },
    courierButton: {
        backgroundColor: '#34C759', // Green
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5
    },
});
