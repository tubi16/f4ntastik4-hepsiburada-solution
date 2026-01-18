import { View, Text, StyleSheet, Pressable, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from './theme';
import { HepsiburadaLogo } from './components/HepsiburadaLogo';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Background Blobs */}
            <LinearGradient
                colors={['rgba(255, 240, 230, 0.4)', 'transparent']}
                style={styles.backgroundGradient}
            />
            <View style={styles.blobCircle} />

            <View style={styles.content}>
                {/* Header Logo */}
                <View style={styles.logoContainer}>
                    <HepsiburadaLogo width={width * 0.4} height={(width * 0.4) / 5} />
                    <Text style={styles.subtitle}>Lütfen giriş tipini seçiniz</Text>
                </View>

                {/* Center Visual */}
                <View style={styles.visualContainer}>
                    <View style={styles.visualCircle}>
                        <MaterialIcons name="local-shipping" size={64} color={Colors.primary} />
                        <View style={styles.visualPulse} />
                    </View>
                </View>

                {/* Button Container */}
                <View style={styles.buttonContainer}>
                    {/* Customer Button */}
                    <Pressable
                        style={({ pressed }) => [styles.button, styles.customerButton, pressed && { transform: [{ scale: 0.98 }] }]}
                        onPress={() => router.push('/customer')}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="person" size={24} color="white" />
                        </View>
                        <Text style={styles.customerButtonText}>Müşteri Girişi</Text>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.8)" />
                    </Pressable>

                    {/* Courier Button */}
                    <Pressable
                        style={({ pressed }) => [styles.button, styles.courierButton, pressed && { transform: [{ scale: 0.98 }] }]}
                        onPress={() => router.push('/courier')}
                    >
                        <View style={[styles.iconCircle, styles.iconCircleLight]}>
                            <MaterialIcons name="moped" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.courierButtonText}>Kurye Girişi</Text>
                        <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>v2.4.0</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    blobCircle: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255, 96, 0, 0.05)',
        transform: [{ scale: 1.2 }],
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    subtitle: {
        marginTop: 16,
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    visualContainer: {
        marginBottom: 60,
        position: 'relative',
    },
    visualCircle: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#FFF0E6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    visualPulse: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 64,
        borderWidth: 1,
        borderColor: 'rgba(255, 96, 0, 0.2)',
        transform: [{ scale: 1.2 }],
        opacity: 0.5,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 360,
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        height: 72,
        shadowColor: "#FF6000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    customerButton: {
        backgroundColor: Colors.primary,
        justifyContent: 'space-between',
    },
    courierButton: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: Colors.primary,
        justifyContent: 'space-between',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconCircleLight: {
        backgroundColor: 'rgba(255, 96, 0, 0.1)',
    },
    customerButtonText: {
        flex: 1,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    courierButtonText: {
        flex: 1,
        color: Colors.textMain,
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    versionText: {
        color: '#9CA3AF',
        fontSize: 12,
    }
});
