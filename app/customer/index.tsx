import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';

export default function CustomerHome() {
    const router = useRouter();
    const { deliveries, verifyDeliveryByCustomer, approvePhotoDelivery, cancelPhotoDelivery } = useDelivery();

    // State to lock focus on the current delivery actively being handled
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Effect to auto-select the first pending delivery if we don't have one selected
    useEffect(() => {
        if (!currentId) {
            const nextPending = deliveries.find(d => d.status === 'pending');
            if (nextPending) {
                setCurrentId(nextPending.id);
            }
        }
    }, [deliveries, currentId]);

    const myDelivery = currentId ? deliveries.find(d => d.id === currentId) : null;
    const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits
    const inputs = useRef<Array<TextInput | null>>([]);

    if (!myDelivery) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Ionicons name="cube-outline" size={64} color={Colors.textSub} />
                    <Text style={{ marginTop: 16, color: Colors.textSub }}>Aktif teslimat bulunamadı.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const { photoDeliveryRequested, photoDeliveryApproved, isCourierVerified, isCustomerVerified, status } = myDelivery;
    const isWaitingForCourier = isCustomerVerified && !isCourierVerified;
    const isCompleted = status === 'delivered';

    const handleAlert = async () => {
        const inputCode = code.join('');
        if (inputCode.length === 6) {
            try {
                console.log("Calling verifyDeliveryByCustomer...");
                const success = await verifyDeliveryByCustomer(myDelivery.id, inputCode);
                console.log("Customer Verification result:", success);

                if (success) {
                    // Success handled by UI reactivity
                } else {
                    if (Platform.OS === 'web') {
                        window.alert("Hata\nGirdiğiniz kod hatalı. Lütfen kuryeden aldığınız kodu kontrol ediniz.");
                    } else {
                        Alert.alert("Hata", "Girdiğiniz kod hatalı. Lütfen kuryeden aldığınız kodu kontrol ediniz.");
                    }
                }
            } catch (error) {
                console.error("Customer Verification Error:", error);
                Alert.alert("Hata", "Doğrulama sırasında bir hata oluştu.");
            }
        } else {
            Alert.alert("Eksik Kod", "Lütfen 6 haneli kodu giriniz.");
        }
    };

    const handleApprovePhoto = () => {
        approvePhotoDelivery(myDelivery.id);
        Alert.alert("Onaylandı", "Kuryeye fotoğraf yükleme izni verildi.");
    };

    const handleNext = () => {
        setCurrentId(null);
        setCode(['', '', '', '', '', '']);
    };

    const handleInput = (text: string, index: number) => {
        if (!/^\d*$/.test(text)) return;

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        // Auto-focus previous input on backspace
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textMain} />
                </Pressable>
                <Text style={styles.headerTitle}>Teslimat Onayı</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card Logic */}
                {isCompleted ? (
                    <View style={styles.statusCardSuccess}>
                        <Ionicons name="checkmark-circle" size={80} color="white" />
                        <Text style={styles.statusTitle}>Teslimat Tamamlandı!</Text>
                        <Text style={styles.statusSub}>Sipariş #{myDelivery.id} başarıyla teslim edildi.</Text>

                        <Pressable style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>Sıradaki Kargo</Text>
                            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                        </Pressable>
                    </View>
                ) : isWaitingForCourier ? (
                    <View style={styles.statusCardWait}>
                        <Ionicons name="hourglass" size={64} color="#d97706" />
                        <Text style={[styles.statusTitle, { color: '#d97706' }]}>Kurye Bekleniyor</Text>
                        <Text style={[styles.statusSub, { color: '#b45309' }]}>Siz onayladınız. Kuryenin de kodu girmesi gerekiyor.</Text>
                    </View>
                ) : (
                    <>
                        {/* Approval Request Notification */}
                        {photoDeliveryRequested && !photoDeliveryApproved && (
                            <View style={styles.approvalCard}>
                                <View style={styles.approvalHeader}>
                                    <Ionicons name="notifications-circle" size={32} color={Colors.primary} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.approvalTitle}>Kurye İzin İstiyor</Text>
                                        <Text style={styles.approvalSub}>Kurye fotoğraflı teslimat yapmak istiyor.</Text>
                                    </View>
                                </View>
                                <Pressable
                                    style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.8 }]}
                                    onPress={handleApprovePhoto}
                                >
                                    <Text style={styles.approveBtnText}>İzin Ver</Text>
                                    <Ionicons name="arrow-forward" size={16} color="white" />
                                </Pressable>
                            </View>
                        )}

                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
                            </View>
                            <Text style={styles.title}>Güvenli Teslimat</Text>
                            <Text style={styles.description}>Sipariş #{myDelivery.id} için kuryenin size verdiği kodu giriniz.</Text>
                        </View>

                        {/* Customer Photo Preference */}
                        <View style={styles.preferenceCard}>
                            <View style={styles.prefHeader}>
                                <Ionicons name="camera" size={24} color={photoDeliveryApproved ? Colors.success : Colors.textSub} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.prefTitle}>Fotoğraflı Teslimat</Text>
                                    <Text style={styles.prefSub}>
                                        {photoDeliveryApproved
                                            ? "Kuryeye fotoğraflı teslimat izni verdiniz."
                                            : "Temassız teslimat için fotoğraflı onay verebilirsiniz."}
                                    </Text>
                                </View>
                            </View>
                            {!photoDeliveryApproved ? (
                                <Pressable
                                    style={({ pressed }) => [styles.prefButton, pressed && { opacity: 0.8 }]}
                                    onPress={() => {
                                        approvePhotoDelivery(myDelivery.id);
                                        if (Platform.OS === 'web') {
                                            window.alert("Kuryeye Bilgi Verildi\nFotoğraflı teslimat tercihiniz iletildi.");
                                        } else {
                                            Alert.alert("Kuryeye Bilgi Verildi", "Fotoğraflı teslimat tercihiniz iletildi.");
                                        }
                                    }}
                                >
                                    <Text style={styles.prefButtonText}>Fotoğrafla Teslimat İste</Text>
                                </Pressable>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={styles.prefActiveBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color="white" />
                                        <Text style={styles.prefActiveText}>Tercih Edildi</Text>
                                    </View>
                                    <Pressable
                                        hitSlop={10}
                                        onPress={() => cancelPhotoDelivery(myDelivery.id)}
                                        style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                                    >
                                        <Text style={{ color: Colors.textSub, fontSize: 13, textDecorationLine: 'underline' }}>Vazgeç</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View style={styles.inputCard}>
                            <Text style={styles.cardTitle}>Kurye Kodunu Girin</Text>
                            <Text style={styles.cardSub}>Kuryeden aldığınız 6 haneli doğrulama kodunu giriniz.</Text>
                            <View style={styles.codeContainer}>
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { inputs.current[index] = ref; }}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(text) => handleInput(text, index)}
                                        textAlign="center"
                                    />
                                ))}
                            </View>
                        </View>
                        <Pressable
                            style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.9 }]}
                            onPress={handleAlert}
                        >
                            <Ionicons name="checkmark-circle" size={24} color="white" />
                            <Text style={styles.confirmButtonText}>Teslimatı Onayla</Text>
                        </Pressable>
                    </>
                )}

                {/* Show YOUR code logic if NOT completed */}
                {!isCompleted && (
                    <View style={styles.yourCodeCard}>
                        <View style={styles.pattern} />
                        <View style={styles.codeContent}>
                            <View style={styles.codeHeader}>
                                <Ionicons name="id-card-outline" size={20} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.codeLabel}>SİZİN KODUNUZ</Text>
                            </View>
                            <Text style={styles.bigCode}>{myDelivery.customerCode}</Text>
                            <View style={styles.codeBadge}>
                                <Text style={styles.codeBadgeText}>Bu kodu kuryeye söyleyiniz</Text>
                            </View>
                        </View>
                    </View>
                )}

                <Pressable
                    style={({ pressed }) => [styles.helpRow, pressed && { opacity: 0.7 }]}
                >
                    <Ionicons name="help-circle-outline" size={18} color={Colors.textSub} />
                    <Text style={styles.helpText}>Kod görünmüyor mu? Yardım al.</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textMain },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },

    content: { padding: 24, paddingBottom: 40 },
    iconContainer: { alignItems: 'center', marginBottom: 24 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 96, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: Colors.textMain, marginBottom: 8 },
    description: { textAlign: 'center', color: Colors.textSub, lineHeight: 20, maxWidth: 280 },

    preferenceCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#eee', ...Shadows.small },
    prefHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
    prefTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.textMain },
    prefSub: { fontSize: 12, color: Colors.textSub, flexShrink: 1 },
    prefButton: { backgroundColor: Colors.surfaceLight, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed' },
    prefButtonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
    prefActiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start' },
    prefActiveText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    inputCard: { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 24, marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    cardSub: { fontSize: 12, color: Colors.textSub, textAlign: 'center', marginBottom: 20 },
    codeContainer: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
    input: { width: 50, height: 56, backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, fontSize: 20, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },

    yourCodeCard: { backgroundColor: Colors.primary, borderRadius: 16, overflow: 'hidden', ...Shadows.medium, marginTop: 24 },
    pattern: { position: 'absolute', inset: 0, opacity: 0.1, backgroundColor: 'black' },
    codeContent: { padding: 24, alignItems: 'center' },
    codeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    codeLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    bigCode: { fontSize: 48, fontWeight: 'bold', color: 'white', fontFamily: 'monospace', marginVertical: 8 },
    codeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    codeBadgeText: { color: 'white', fontSize: 12, fontWeight: '500' },

    helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 },
    helpText: { color: Colors.textSub, fontSize: 12, fontWeight: '500' },

    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    confirmButton: { backgroundColor: Colors.primary, height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...Shadows.medium },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    approvalCard: { backgroundColor: '#fff5ec', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.primary },
    approvalHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
    approvalTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain },
    approvalSub: { fontSize: 12, color: Colors.textSub, flexShrink: 1 },
    approveBtn: { backgroundColor: Colors.primary, flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-start' },
    approveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

    statusCardSuccess: { backgroundColor: '#4CAF50', padding: 32, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    statusCardWait: { backgroundColor: '#fff7ed', padding: 32, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#fdba74', borderStyle: 'dashed' },
    statusTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 16, textAlign: 'center' },
    statusSub: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 8 },

    nextButton: { marginTop: 24, backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8 },
    nextButtonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 }
});
