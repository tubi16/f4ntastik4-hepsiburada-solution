import { View, Text, StyleSheet, Pressable, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDelivery } from '../../context/DeliveryContext';
import { Colors, Shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { analyzeDeliveryPhoto } from '../../services/GeminiService';

export default function DeliveryDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { deliveries, verifyDeliveryByCourier, requestPhotoDelivery } = useDelivery();
    const [method, setMethod] = useState<'code' | 'photo'>('code');
    const [inputCode, setInputCode] = useState('');
    const [photo, setPhoto] = useState<string | null>(null); // Keep photo for URI display
    const [photoBase64, setPhotoBase64] = useState<string | null>(null); // New state for base64
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 6-digit code state
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const delivery = deliveries.find(d => d.id === id);

    if (!delivery) {
        return <View style={styles.center}><Text>Teslimat bulunamadı</Text></View>;
    }

    const { photoDeliveryRequested, photoDeliveryApproved } = delivery;

    const handleInput = (text: string, index: number) => {
        // Allow only numeric input
        if (!/^\d*$/.test(text)) return;

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus logic
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const pickImage = async () => {
        if (!photoDeliveryApproved) {
            Alert.alert("Onay Bekleniyor", "Fotoğraf çekebilmek için müşterinin onayı gereklidir.");
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera izni gerekiyor.');
            return;
        }

        // Directly launch camera, no gallery option
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true, // Request base64 directly
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
            if (result.assets[0].base64) {
                setPhotoBase64(result.assets[0].base64);
            }
        }
    };

    const handleRequestApproval = () => {
        requestPhotoDelivery(delivery.id);
        Alert.alert("Onay Gönderildi", "Müşteriye fotoğraf ile teslimat onayı gönderildi. Lütfen müşterinin onaylamasını bekleyiniz.");
    };

    const handleDeliver = async () => {
        if (method === 'code') {
            const inputCode = code.join('');
            if (inputCode.length !== 6) {
                Alert.alert("Hata", "Lütfen 6 haneli müşteri kodunu giriniz.");
                return;
            }
            const success = verifyDeliveryByCourier(delivery.id, inputCode);
            if (success) {
                Alert.alert("Başarılı", "Teslimat tamamlandı. 🚀", [{ text: "Tamam", onPress: () => router.back() }]);
            } else {
                Alert.alert("Hata", "Kod hatalı. Lütfen müşterinin kodunu kontrol ediniz.");
            }
        } else {
            if (!photoDeliveryApproved) {
                Alert.alert("Onay Gerekli", "Lütfen önce müşteriden onay alınız.");
                return;
            }

            if (!photo) {
                Alert.alert("Eksik", "Lütfen teslimat fotoğrafını çekiniz.");
                return;
            }

            try {
                setIsAnalyzing(true);

                if (!photoBase64) {
                    Alert.alert("Hata", "Fotoğraf verisi alınamadı. Lütfen tekrar deneyin.");
                    setIsAnalyzing(false);
                    return;
                }

                console.log("Using cached base64, sending to Gemini...");
                // Analyze
                const result = await analyzeDeliveryPhoto(photoBase64);
                console.log("Gemini Result:", result);

                setIsAnalyzing(false);

                if (result.valid) {
                    // Success - In a real app we would upload the photo
                    Alert.alert("Başarılı", "Yapay zeka onayı alındı ve teslimat kanıtı doğrulandı! 📸", [{ text: "Tamam", onPress: () => router.back() }]);
                } else {
                    Alert.alert("Analiz Başarısız", result.reason);
                }

            } catch (error) {
                console.error("Analysis Error:", error);
                setIsAnalyzing(false);
                Alert.alert("Hata", "Fotoğraf işlenirken teknik bir hata oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textMain} />
                </Pressable>
                <Text style={styles.headerTitle}>Teslimat Onayı</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View>
                            <View style={styles.statusRow}>
                                <View style={styles.statusBadge}><Text style={styles.statusText}>Dağıtımda</Text></View>
                                <Text style={styles.timeText}>Bugün, 14:30</Text>
                            </View>
                            <Text style={styles.customerName}>{delivery.customerName}</Text>
                            <Text style={styles.packageId}>Paket No: #{delivery.id}</Text>
                            <Text style={styles.address} numberOfLines={1}>{delivery.address}</Text>
                        </View>
                        <View style={styles.mapThumb}>
                            <Ionicons name="map-outline" size={32} color={Colors.textSub} />
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Teslimat Yöntemi</Text>
                <View style={styles.toggleContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.toggleBtn,
                            method === 'code' && styles.toggleBtnActive,
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => setMethod('code')}
                    >
                        <Ionicons name="keypad-outline" size={18} color={method === 'code' ? Colors.primary : Colors.textSub} />
                        <Text style={[styles.toggleText, method === 'code' && styles.toggleTextActive]}>Kod ile</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.toggleBtn,
                            method === 'photo' && styles.toggleBtnActive,
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => setMethod('photo')}
                    >
                        <Ionicons name="camera-outline" size={18} color={method === 'photo' ? Colors.primary : Colors.textSub} />
                        <Text style={[styles.toggleText, method === 'photo' && styles.toggleTextActive]}>Fotoğraf ile</Text>
                    </Pressable>
                </View>

                {method === 'code' ? (
                    <View style={styles.inputSection}>
                        <View style={styles.codeInstructions}>
                            <Text style={styles.inputLabel}>Müşteri Kodunu Giriniz</Text>
                            <Text style={styles.inputSub}>Alıcıya SMS ile gönderilen 6 haneli kod</Text>
                        </View>

                        <View style={styles.codeInputs}>
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputs.current[index] = ref; }}
                                    style={[
                                        styles.codeInput,
                                        digit ? styles.codeInputActive : null
                                    ]}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(text) => handleInput(text, index)}
                                    textAlign="center"
                                    placeholderTextColor="#ccc"
                                />
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.photoSection}>
                        {!photoDeliveryApproved ? (
                            <Pressable
                                style={({ pressed }) => [styles.requestButton, pressed && { opacity: 0.8 }]}
                                onPress={handleRequestApproval}
                                disabled={photoDeliveryRequested}
                            >
                                <View style={styles.uploadIconCircle}>
                                    <Ionicons name={photoDeliveryRequested ? "time-outline" : "notifications-outline"} size={32} color={Colors.primary} />
                                </View>
                                <Text style={styles.uploadTitle}>
                                    {photoDeliveryRequested ? "Onay Bekleniyor..." : "Müşteri Onayı İste"}
                                </Text>
                                <Text style={styles.uploadSub}>
                                    {photoDeliveryRequested
                                        ? "Müşterinin testi onayı bekleniyor."
                                        : "Fotoğraf yüklemek için müşteriden onay almalısınız."}
                                </Text>
                            </Pressable>
                        ) : photo ? (
                            <View style={styles.previewContainer}>
                                <Image source={{ uri: photo }} style={styles.previewImage} />
                                <Pressable style={({ pressed }) => [styles.retakeButton, pressed && { opacity: 0.8 }]} onPress={() => setPhoto(null)}>
                                    <Ionicons name="close-circle" size={24} color="white" />
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable style={({ pressed }) => [styles.uploadBox, pressed && { opacity: 0.8 }]} onPress={pickImage}>
                                <View style={styles.uploadIconCircle}>
                                    <Ionicons name="camera" size={32} color={Colors.primary} />
                                </View>
                                <Text style={styles.uploadTitle}>Fotoğraf Çek</Text>
                                <Text style={styles.uploadSub}>Teslimat kanıtı olarak paket fotoğrafını çekiniz.</Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {method === 'code' && (
                    <View style={styles.yourCodeContainer}>
                        <View>
                            <Text style={styles.yourCodeLabel}>Sizin Kodunuz</Text>
                            <Text style={styles.yourCodeSub}>Müşteriye bu kodu söyleyiniz</Text>
                        </View>
                        <View style={styles.yourCodeBadge}>
                            <Text style={styles.yourCodeValue}>{delivery.courierCode}</Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.confirmButton,
                        ((method === 'photo' && (!photo || !photoDeliveryApproved)) || isAnalyzing) ? styles.disabledButton : null,
                        pressed && { opacity: 0.9 }
                    ]}
                    onPress={handleDeliver}
                    disabled={(method === 'photo' && (!photo || !photoDeliveryApproved)) || isAnalyzing}
                >
                    {isAnalyzing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                    )}
                    <Text style={styles.confirmButtonText}>
                        {isAnalyzing ? "Analiz Ediliyor..." : "Teslimatı Onayla"}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textMain },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },

    content: { flex: 1, padding: 16 },
    infoCard: { backgroundColor: Colors.surfaceLight, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee', borderLeftWidth: 4, borderLeftColor: Colors.primary, marginBottom: 24 },
    infoHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    statusBadge: { backgroundColor: 'rgba(255, 96, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statusText: { color: Colors.primary, fontSize: 10, fontWeight: 'bold' },
    timeText: { fontSize: 11, color: Colors.textSub },
    customerName: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain },
    packageId: { fontSize: 12, color: Colors.textSub, marginTop: 2 },
    address: { fontSize: 11, color: Colors.textSub, marginTop: 4, width: 180 },
    mapThumb: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },

    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, paddingHorizontal: 4 },
    toggleContainer: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, padding: 4, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 24 },
    toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 8 },
    toggleBtnActive: { backgroundColor: 'white', ...Shadows.small },
    toggleText: { fontSize: 13, fontWeight: '500', color: Colors.textSub },
    toggleTextActive: { color: Colors.primary, fontWeight: '600' },

    inputSection: { alignItems: 'center', backgroundColor: Colors.surfaceLight, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
    codeInstructions: { alignItems: 'center', marginBottom: 16 },
    inputLabel: { color: Colors.primary, fontWeight: '600', marginBottom: 4 },
    inputSub: { fontSize: 11, color: Colors.textSub },
    codeInputs: { flexDirection: 'row', gap: 8 }, // Decreased gap slightly for 6 digits
    codeInput: { width: 45, height: 50, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: Colors.textMain },
    codeInputActive: { borderColor: Colors.primary, borderWidth: 2 }, // Replaced bottom border with full border for focus state

    photoSection: { height: 200, marginBottom: 20 },
    uploadBox: { flex: 1, backgroundColor: '#fafafa', borderWidth: 2, borderColor: '#eee', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    requestButton: { flex: 1, backgroundColor: '#fff5ec', borderWidth: 2, borderColor: Colors.primary, borderStyle: 'solid', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    uploadIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 96, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    uploadTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain, marginBottom: 4 },
    uploadSub: { fontSize: 12, color: Colors.textSub, textAlign: 'center', paddingHorizontal: 20 },

    previewContainer: { flex: 1, borderRadius: 16, overflow: 'hidden', position: 'relative' },
    previewImage: { width: '100%', height: '100%' },
    retakeButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 4 },

    yourCodeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 96, 0, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 96, 0, 0.2)' },
    yourCodeLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.primary, textTransform: 'uppercase' },
    yourCodeSub: { fontSize: 11, color: Colors.primary, opacity: 0.8 },
    yourCodeBadge: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    yourCodeValue: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 },

    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    confirmButton: { backgroundColor: Colors.primary, height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...Shadows.medium },
    disabledButton: { backgroundColor: '#ccc', shadowOpacity: 0 },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
