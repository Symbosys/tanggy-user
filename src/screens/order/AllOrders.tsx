import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const ongoingOrders = [
    {
        id: '1',
        restaurant: 'Pizza Palace',
        date: 'Oct 15, 2025',
        amount: '$24.50',
        status: 'Ongoing',
        statusColor: COLORS.highlight,
        items: [
            { id: '1', name: '1x Margherita Pizza', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATZ68ueEu2BQAGNeP5IugftSzCxpih_g7bkWDrSDGxODTTArnd5Qv0b21lFKb69RY176-WDkzVGpjB2dgNmR7C5EQcmmsT66HOxVROtQC5OPKpjcQy6bNsulg1phddu5WzdjwUUM5MYW_RsD25otiYSUnrvY4yDRcDhyyptShSxzBxB3S7jbQWvBwRNDd1SmLtiIZj1ouPKB3E9UebVIGh2w3VFOFxCupJEjZO-66ejQZx84eH77Wnbx1tuctnx3GaI9KZlUZ5Dq5J' },
            { id: '2', name: '2x Garlic Breadsticks', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7PXYwEJQS4auu-eDb2y98cuDVdIeds1wulIVzfoBEZTRs64idJp5sXGyjK-UGxYULdiD8ZViI_sfmn03Qr0nwPFlS-pkDWOCS1oEVKYv_uuQG3xT2un4hlONT4rxWiqNYPPpb5AANYoc1mAqF0CFWwmejWfu7N0vMdvQmasMVZVXvirTL3cGUkZflBSGNCs-XgSwYgZ9FM3u74OKzsDFYpyydE8FtTTShdL4xuNWPnbSVJ9XQG_9rmnuCCkbVfxUKvbt9swLNREaa' },
        ],
    },
];

const pastOrders = [
    {
        id: '2',
        restaurant: 'Sushi Express',
        date: 'Oct 10, 2025',
        amount: '$42.80',
        status: 'Delivered',
        statusColor: '#4CAF50',
        items: [
            { id: '1', name: '1x Assorted Sushi Platter', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0a0JwY2-FPvvycLig5LjCe28xL8sigpZ52kMZ9XgKRFjqOSAK5hwEEW-uQTBFc-xLjtv9tUb1n5Y9FaWqt2721jh68KylgRsqyZS7O-LJWjy38_pM9G5ldhv0u72VHDtz77Qzwkb6QEhnaRF_w5viIbQtgR06AVu7ogc7dXzTSdW7uDXeiMWQ4RLojlQspmxUYpmJRBNjjK2wCzRNKckg74cwtpTsmCdWd7kb3izHOOh6_TYpAUpV-KmhQNpk3k9H4XZrLdiBn741' },
            { id: '2', name: '2x Miso Soup', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ-JgzWepIU3bQaoAGLfilVGvpJM9oy-bfftsba4p20KuJ_UE394c5W-vCQCiZn9lprF-SflU5jBizcPPvayLI3N8XwGMG2fLTZJtbWziLLO9izbmS30ervcAvvChra8pMAIWjo2n1wKY-S0hFv4MP7h5kFfe_lXylkd4IFJieWhen3wmoHkDpeAelO5QRhu1y_HN9g6wh8PiNHLk34oRT5hEb_ywVYby8Z6o72FPA43uQCeNwPhZymOQjqlSP1E9TobKRQCkUDveb' },
        ],
    },
    {
        id: '3',
        restaurant: 'The Burger Joint',
        date: 'Oct 12, 2025',
        amount: '$25.50',
        status: 'Cancelled',
        statusColor: '#EF5350',
        items: [
            { id: '1', name: '1x Classic Cheeseburger', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWzygNQqChXPdulF65YeRSQFMbi6TL8_d22oZQQI8djMkCVhZk5xSuZDqjBo0FkekwaX8TTRFYka6QvGsOLV08VfQoJXlr2joyn8DbvqwzOHabBHXhlXO9Rq-DbYQSC7xg7QFLzpeFCJibihDekeQ5tR2vjIoF937IrWwuaUFIdGCloqRXS83KH4RfqXT7CU40FI5TMtMpbOmHswYjBi-tXuB_-GlTYBx5Hh0RhMfNoYV36pwcMchD5izP3ekhzQQsEZR6F07yOTlL' },
            { id: '2', name: '1x Large French Fries', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkdoNIOPJUu0Azdf4V2zhEZydrLEF91SmcV2KP2yyZG__48zf9H8b-VlfmM2pGnJgvbFkAvX33oIq5I-9ew9orvvg1C_bALuT5tFpR66P-0_qFUs58uyW72_soB8KV-4cnhJeFVSdlrFpgasypCJfLa4anKhkFCOMRSYWcV7WdmdJ84Aqiqw7eceDFgs7nND4i5TRR41pO-gZ67V5PCwnedpwBM9UZexKQSOIFHIKtDzc4dQEDaXGrHQjnnxHZcsMev9aTMgvrsmQ0' },
        ],
    },
];

export default function AllOrdersScreen() {
    const [selectedTab, setSelectedTab] = useState('Past Orders');
    const data = selectedTab === 'Ongoing' ? ongoingOrders : pastOrders;

    const renderOrderCard = ({ item }) => (
        <View
            style={{
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 5,
                marginBottom: 16,
                elevation: 3,
            }}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
                    <Image
                        source={{ uri: item.items[0]?.image }}
                        style={{ width: 56, height: 56, borderRadius: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.textPrimary }}>
                            {item.restaurant}
                        </Text>
                        <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                            {item.date} • {item.amount}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        backgroundColor: item.statusColor + '20',
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                    }}
                >
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.statusColor }}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Items */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 12, paddingTop: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: COLORS.textPrimary }}>
                    Items ordered:
                </Text>
                {item.items.map((food) => (
                    <View key={food.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Image
                            source={{ uri: food.image }}
                            style={{ width: 40, height: 40, borderRadius: 8, marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{food.name}</Text>
                    </View>
                ))}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 12, paddingTop: 10 }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: COLORS.secondary,
                        borderRadius: 999,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>Rate Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: COLORS.primary,
                        borderRadius: 999,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontWeight: 'bold', color: COLORS.white }}>Reorder</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <View style={{ padding: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary }}>Your Orders</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <MaterialIcons name="search" size={24} color={COLORS.textPrimary} />
                    <MaterialIcons name="filter-list" size={24} color={COLORS.textPrimary} />
                </View>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                {['Ongoing', 'Past Orders'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: 10,
                            borderBottomWidth: 3,
                            borderBottomColor: selectedTab === tab ? COLORS.primary : 'transparent',
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: selectedTab === tab ? 'bold' : '500',
                                color: selectedTab === tab ? COLORS.primary : COLORS.muted,
                            }}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderCard}
                contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
