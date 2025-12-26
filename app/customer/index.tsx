import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useDelivery } from '../context/DeliveryContext';

export default function CustomerHome() {
    const { deliveries, verifyDeliveryByCustomer, approvePhotoDelivery } = useDelivery();
    const myDelivery = deliveries[0]; // Simulator: User is associated with first delivery

    const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits

    const inputs = useRef<Array<TextInput | null>>([]);

    if (!myDelivery) return null;

    const { photoDeliveryRequested, photoDeliveryApproved } = myDelivery;

    const handleAlert = () => {
        const inputCode = code.join('');
        if (inputCode.length === 6) {
            const success = verifyDeliveryByCustomer(myDelivery.id, inputCode);
            if (success) {
                Alert.alert("Başarılı", "Teslimat başarıyla onaylandı! 🎉");
                setCode(['', '', '', '', '', '']);
            } else {
                Alert.alert("Hata", "Girdiğiniz kod hatalı. Lütfen kuryeden aldığınız kodu kontrol ediniz.");
            }
        } else {
            Alert.alert("Eksik Kod", "Lütfen 6 haneli kodu giriniz.");
        }
    };

    const handleApprovePhoto = () => {
        approvePhotoDelivery(myDelivery.id);
        Alert.alert("Onaylandı", "Kuryeye fotoğraf yükleme izni verildi.");
    };

    const handleInput = (text: string, index: number) => {
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
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textMain} />
                </Pressable>
                <Text style={styles.headerTitle}>Teslimat Onayı</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

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
                    <Text style={styles.description}>Sipariş #{myDelivery.id} için karşılıklı doğrulama yapınız.</Text>
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

                <Pressable
                    style={({ pressed }) => [styles.helpRow, pressed && { opacity: 0.7 }]}
                >
                    <Ionicons name="help-circle-outline" size={18} color={Colors.textSub} />
                    <Text style={styles.helpText}>Kod görünmüyor mu? Yardım al.</Text>
                </Pressable>
            </View>

            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.9 }]}
                    onPress={handleAlert}
                >
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text style={styles.confirmButtonText}>Teslimatı Onayla</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textMain },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },

    content: { flex: 1, padding: 24 },
    iconContainer: { alignItems: 'center', marginBottom: 24 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 96, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: Colors.textMain, marginBottom: 8 },
    description: { textAlign: 'center', color: Colors.textSub, lineHeight: 20, maxWidth: 280 },

    inputCard: { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 24, marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    cardSub: { fontSize: 12, color: Colors.textSub, textAlign: 'center', marginBottom: 20 },
    codeContainer: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
    input: { width: 50, height: 56, backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, fontSize: 20, fontWeight: 'bold', color: Colors.primary },

    yourCodeCard: { backgroundColor: Colors.primary, borderRadius: 16, overflow: 'hidden', ...Shadows.medium },
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
    approveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
