import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { COLORS } from "../../theme/theme";
import { AppNavigation } from "../../types/type";

const BUTTON_GRADIENT = ["#6A0DAD", "#D8B4FF"];
const { width: screenWidth } = Dimensions.get("window");

/* Product Card */
const ProductCard = ({
    imageUri,
    name,
    note,
    price,
    originalPrice,
    discount,
    stock,
    isFavorite,
    onFavoritePress,
}: any) => {
    return (
        <View style={styles.productCard}>
            <View style={styles.productImageContainer}>
                <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
                <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
                    <Icon name={isFavorite ? "favorite" : "favorite-border"} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                {discount && <Text style={styles.discountBadge}>{discount}</Text>}
                {stock && <Text style={styles.stockBadge}>{stock}</Text>}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{name}</Text>
                <Text style={styles.productNote}>{note}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{price}</Text>
                    {originalPrice && <Text style={styles.originalPrice}>{originalPrice}</Text>}
                </View>
                <TouchableOpacity>
                    <LinearGradient
                        colors={BUTTON_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addToCartButton}
                    >
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CategoryResults = ({ navigation }: AppNavigation) => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = ["All", "Curry Cut", "Boneless", "Whole Chicken", "Drumsticks"];
    const products = [
        { id: 1, name: "Fresh Curry Cut Chicken", note: "500g Pack", price: "₹185", originalPrice: "₹230", discount: "20% OFF", stock: "In Stock", imageUri: "https://imgs.search.brave.com/WacsD5d59wBBbv2UHFSBQkQonv-jznnUdiEES9oD8n4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTgzLzQzOC9zbWFs/bC9yYXctY2hpY2tl/bi1sZWctcGhvdG8u/anBn" },
        { id: 2, name: "Boneless Chicken Breast", note: "450g Pack", price: "₹250", stock: "In Stock", isFavorite: true, imageUri: "https://imgs.search.brave.com/WacsD5d59wBBbv2UHFSBQkQonv-jznnUdiEES9oD8n4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTgzLzQzOC9zbWFs/bC9yYXctY2hpY2tl/bi1sZWctcGhvdG8u/anBn" },
        { id: 3, name: "Tender Drumsticks", note: "500g Pack", price: "₹199", stock: "In Stock", imageUri: "https://imgs.search.brave.com/WacsD5d59wBBbv2UHFSBQkQonv-jznnUdiEES9oD8n4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTgzLzQzOC9zbWFs/bC9yYXctY2hpY2tl/bi1sZWctcGhvdG8u/anBn" },
        { id: 4, name: "Whole Skinless Chicken", note: "1kg Pack", price: "₹420", stock: "In Stock", imageUri: "https://imgs.search.brave.com/WacsD5d59wBBbv2UHFSBQkQonv-jznnUdiEES9oD8n4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTgzLzQzOC9zbWFs/bC9yYXctY2hpY2tl/bi1sZWctcGhvdG8u/anBn" },
        { id: 5, name: "Chicken Lollipops", note: "10 pieces", price: "₹150", stock: "In Stock", imageUri: "https://imgs.search.brave.com/WacsD5d59wBBbv2UHFSBQkQonv-jznnUdiEES9oD8n4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTgzLzQzOC9zbWFs/bC9yYXctY2hpY2tl/bi1sZWctcGhvdG8u/anBn" },
        { id: 6, name: "Chicken Mince (Keema)", note: "400g Pack", price: "₹210", stock: "Only 3 Left", imageUri: "https://imgs.search.brave.com/WacsD5d59wBBbv2UHFSBQkQonv-jznnUdiEES9oD8n4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTgzLzQzOC9zbWFs/bC9yYXctY2hpY2tl/bi1sZWctcGhvdG8u/anBn" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
            >
                {/* HEADER - TOP TO BOTTOM GRADIENT */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Fresh Chicken</Text>
                        <TouchableOpacity>
                            <Icon name="shopping-cart" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchInputContainer}>
                        <Icon name="search" size={20} color="rgba(255,255,255,0.9)" />
                        <TextInput
                            placeholder="Search for chicken, pieces..."
                            placeholderTextColor="rgba(255,255,255,0.85)"
                            style={styles.searchInput}
                        />
                    </View>
                </LinearGradient>

                {/* CATEGORY BAR - EACH CHIP IS NOW A LEFT-TO-RIGHT GRADIENT */}
                <View style={styles.categoryWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScroll}
                    >
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}>
                                    {isActive ? (
                                        <LinearGradient
                                            colors={BUTTON_GRADIENT}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[styles.categoryChip, styles.activeCategoryChip]}
                                        >
                                            <Text style={styles.activeCategoryChipText}>{cat}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.categoryChip}>
                                            <Text style={styles.categoryChipText}>{cat}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* SORT + FILTER */}
                <View style={styles.sortRow}>
                    <View style={styles.sortLeft}>
                        <Text style={styles.sortLabel}>Sort by:</Text>
                        <TouchableOpacity style={styles.sortValue}>
                            <Text style={styles.sortValueText}>Popularity</Text>
                            <Icon name="expand-more" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <Icon name="filter-list" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.filterButtonText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {/* PRODUCTS */}
                <View style={styles.mainContent}>
                    <View style={styles.productGrid}>
                        {products.map((p) => (
                            <ProductCard key={p.id} {...p} onFavoritePress={() => { }} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* VIEW CART BAR - FIXED AT BOTTOM */}
            <LinearGradient
                colors={["#000000", "#000000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.viewCartBar}
            >
                <View>
                    <Text style={styles.viewCartItems}>2 Items | ₹435</Text>
                    <Text style={styles.viewCartNote}>Extra charges may apply</Text>
                </View>
                <LinearGradient
                    colors={BUTTON_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.viewCartButton}
                >
                    <Text style={styles.viewCartText}>View Cart</Text>
                    <Icon name="arrow-forward" size={20} color={COLORS.white} />
                </LinearGradient>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 100 },
    /* HEADER */
    header: { paddingTop: 18, paddingBottom: 18, paddingHorizontal: 16 },
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.25)",
        borderRadius: 50,
        paddingHorizontal: 14,
        height: 46,
        marginBottom: 14,
    },
    searchInput: { flex: 1, marginLeft: 8, color: COLORS.white, fontWeight: "500" },
    /* CATEGORY */
    categoryWrapper: { backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 12 },
    categoryScroll: { flexDirection: "row", gap: 12 },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 30,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryChipText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
    activeCategoryChip: { borderWidth: 0 },
    activeCategoryChipText: { color: COLORS.white, fontWeight: "700" },
    /* FILTER ROW */
    sortRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderColor: "#EAEAEA",
    },
    sortLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
    sortLabel: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
    sortValue: { flexDirection: "row", alignItems: "center" },
    sortValueText: { fontSize: 15, fontWeight: "700", color: COLORS.primary },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        backgroundColor: COLORS.white,
    },
    filterButtonText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginLeft: 4 },
    /* PRODUCTS */
    mainContent: { paddingHorizontal: 16 },
    productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    productCard: { width: (screenWidth - 48) / 2, backgroundColor: COLORS.white, borderRadius: 12, overflow: "hidden" },
    productImageContainer: { width: "100%", aspectRatio: 1, position: "relative" },
    productImage: { width: "100%", height: "100%" },
    favoriteButton: { position: "absolute", top: 8, right: 8, padding: 6, backgroundColor: "#ffffffcc", borderRadius: 16 },
    discountBadge: { position: "absolute", top: 8, left: 0, backgroundColor: COLORS.highlight, color: COLORS.white, paddingHorizontal: 6, paddingVertical: 4, borderTopRightRadius: 12, borderBottomRightRadius: 12, fontWeight: "700", fontSize: 10 },
    stockBadge: { position: "absolute", bottom: 8, left: 8, backgroundColor: "#E7F8ED", color: "#22C55E", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, fontSize: 10, fontWeight: "600" },
    productInfo: { padding: 12, flex: 1, justifyContent: "space-between" },
    productName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
    productNote: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    priceContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    price: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
    originalPrice: { fontSize: 14, textDecorationLine: "line-through", color: COLORS.textSecondary },
    addToCartButton: { marginTop: 12, height: 42, borderRadius: 50, justifyContent: "center", alignItems: "center" },
    addToCartText: { color: COLORS.white, fontWeight: "700" },
    /* VIEW CART */
    viewCartBar: { position: "absolute", bottom: 12, left: 16, right: 16, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    viewCartItems: { color: COLORS.white, fontWeight: "700" },
    viewCartNote: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
    viewCartButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 40 },
    viewCartText: { color: COLORS.white, fontWeight: "700", marginRight: 6 },
});

export default CategoryResults;