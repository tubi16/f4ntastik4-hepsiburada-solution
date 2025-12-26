import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { MOCK_DELIVERIES, Delivery } from '../data/mock';
import { useDelivery, ExtendedDelivery } from '../context/DeliveryContext';
import { Colors, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function CourierHome() {
    const router = useRouter();
    const { deliveries } = useDelivery();
    const [activeTab, setActiveTab] = useState('Teslim Bekleyen');

    const tabs = ['Tümü', 'Teslim Bekleyen', 'Teslim Edilen', 'İade'];

    const filteredData = activeTab === 'Tümü'
        ? deliveries
        : activeTab === 'Teslim Bekleyen'
            ? deliveries.filter(d => d.status === 'pending')
            : activeTab === 'Teslim Edilen'
                ? deliveries.filter(d => d.status === 'delivered')
                : [];

    const renderItem = ({ item }: { item: ExtendedDelivery }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.badgeContainer}>
                    <View style={[styles.statusDot, { backgroundColor: item.status === 'pending' ? Colors.primary : Colors.success }]} />
                    <Text style={styles.statusText}>{item.status === 'pending' ? 'DAĞITIMDA' : 'TESLİM EDİLDİ'}</Text>
                </View>
                <Text style={styles.idText}>#{item.id}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoContainer}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>14:30 - 15:30</Text>
                    </View>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={16} color={Colors.textSub} />
                        <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
                    </View>
                </View>
                <View style={styles.mapThumbnail}>
                    {/* Imagine a map image here */}
                    <Ionicons name="map" size={32} color="#ccc" />
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Pressable
                    style={({ pressed }) => [styles.actionButtonPrimary, pressed && { opacity: 0.8 }]}
                    onPress={() => router.push(`/courier/delivery/${item.id}`)}
                >
                    <Ionicons name="navigate" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Teslimata Başla</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
                    <Ionicons name="call-outline" size={20} color={Colors.textMain} />
                </Pressable>
                <Pressable style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textMain} />
                </Pressable>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable
                        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.textMain} />
                    </Pressable>
                    <Ionicons name="cube-outline" size={28} color={Colors.brandPurple} />
                    <Text style={styles.headerTitle}>Kargolarım</Text>
                </View>
                <Pressable style={({ pressed }) => [styles.notificationButton, pressed && { opacity: 0.7 }]}>
                    <Ionicons name="notifications-outline" size={24} color={Colors.textMain} />
                    <View style={styles.notificationDot} />
                </Pressable>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Teslim Bekleyen</Text>
                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>12</Text>
                        <View style={styles.statBadge}><Text style={styles.statBadgeText}>Öncelikli</Text></View>
                    </View>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Teslim Edilen</Text>
                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>45</Text>
                        <View style={[styles.statBadge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.statBadgeText, { color: '#166534' }]}>Bugün</Text></View>
                    </View>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSub} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Sipariş no veya müşteri adı ara..."
                    placeholderTextColor={Colors.textSub}
                />
            </View>

            <View style={styles.tabsContainer}>
                <FlatList
                    data={tabs}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.tab,
                                activeTab === item && styles.activeTab,
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={() => setActiveTab(item)}
                        >
                            <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>{item}</Text>
                        </Pressable>
                    )}
                    keyExtractor={item => item}
                    contentContainerStyle={styles.tabsContent}
                />
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundLight },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12, // Reduced slightly as SafeAreaView adds its own top padding
        backgroundColor: Colors.surfaceLight,
        // Height is determined by content + padding
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { marginRight: 4, padding: 4 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textMain },
    notificationButton: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 20 },
    notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, borderWidth: 1, borderColor: 'white' },

    statsContainer: { flexDirection: 'row', gap: 15, padding: 20 },
    statCard: { flex: 1, backgroundColor: Colors.surfaceLight, padding: 15, borderRadius: 12, ...Shadows.small },
    statLabel: { color: Colors.textSub, fontSize: 13, marginBottom: 5 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.textMain },
    statBadge: { backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },

    searchContainer: { marginHorizontal: 20, marginBottom: 15 },
    searchIcon: { position: 'absolute', left: 15, top: 12, zIndex: 1 },
    searchInput: { backgroundColor: Colors.surfaceLight, borderRadius: 12, paddingLeft: 45, paddingRight: 15, height: 44, fontSize: 14, ...Shadows.small },

    tabsContainer: { marginBottom: 15 },
    tabsContent: { paddingHorizontal: 20, gap: 10 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: '#eee' },
    activeTab: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    tabText: { color: Colors.textSub, fontSize: 14, fontWeight: '500' },
    activeTabText: { color: 'white', fontWeight: '600' },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    card: { backgroundColor: Colors.surfaceLight, borderRadius: 16, marginBottom: 16, padding: 16, ...Shadows.small },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: 'bold', color: Colors.primary },
    idText: { fontSize: 12, color: Colors.textSub },

    cardBody: { flexDirection: 'row', gap: 15 },
    infoContainer: { flex: 1 },
    timeContainer: { marginBottom: 5 },
    timeText: { fontSize: 14, fontWeight: 'bold', color: Colors.textMain },
    customerName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: Colors.textMain },
    addressRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
    addressText: { fontSize: 13, color: Colors.textSub, flex: 1 },
    mapThumbnail: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },

    cardFooter: { flexDirection: 'row', gap: 10, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    actionButtonPrimary: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    iconButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
});

