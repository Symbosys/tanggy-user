import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Category } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { COLORS } from '../../theme/theme';

interface CategoryListProps {
    categories: Category[];
    navigation: AppNavigation['navigation'];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, navigation }) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shop by Category</Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate("Category")}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <Icon name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
            >
                {categories.map((categoryItem, index) => (
                    <TouchableOpacity
                        key={categoryItem.id || index}
                        style={styles.categoryItem}
                        onPress={() => navigation.navigate("CategoryResults", {categoryId: categoryItem.id, categoryName: categoryItem.name})}
                    >
                        <View style={styles.categoryImageContainer}>
                            <Image
                                source={{ uri: categoryItem.image.url }}
                                style={styles.categoryImage}
                            />
                        </View>
                        <Text style={styles.categoryName}>{categoryItem.name}</Text>
                        {categoryItem.name === 'Heat & Eat' && (
                            <View style={styles.minutesBadge}>
                                <Text style={styles.minutesText}>2 mins</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000000',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#8719C6',
    },
    categoryScroll: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 8,
    },
    categoryItem: {
        alignItems: 'center',
        width: 96,
        position: 'relative',
    },
    categoryImageContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '800',
        color: '#000000',
        textAlign: 'center',
    },
    minutesBadge: {
        position: 'absolute',
        top: -2,
        right: 8,
        backgroundColor: '#FF7622',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    minutesText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CategoryList;