import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { InlineLoading } from "../../components/ui/loader/InlineLoading";
import { useAuth } from "../../context/AuthContext";
import { getAllProducts, GetAllProductsParams } from "../../services/product.service";
import { getAllSubCategories } from "../../services/subcategory.service";
import { useLocationStore } from "../../store/location";
import { COLORS } from "../../theme/theme";
import { Product, SubCategory } from "../../types/product.type";
import { AppNavigation } from "../../types/type";
import { parseToDecimal } from "../../utils/utils";

const BUTTON_GRADIENT = ["#6A0DAD", "#D8B4FF"];
const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth / 2 - 24;

/* Product Card */
const ProductCard = ({
    product,
    navigation,
    isFavorite,
    onFavoritePress,
    onAddToCart,
}: {
    product: Product;
    navigation: AppNavigation["navigation"];
    isFavorite: boolean;
    onFavoritePress: () => void;
    onAddToCart: () => void;
}) => {
    const marketPrice = product.marketPrice;
    const sellingPrice = product.sellingPrice;
    const discountPercent = marketPrice && marketPrice > sellingPrice
        ? Math.round(((marketPrice - sellingPrice) / marketPrice) * 100)
        : 0;
    const piecesText = Number(product.pieces) === 1 ? "piece" : "pieces";
    const details = `${product.weight}g • ${product.pieces} ${piecesText}`;

    const handleNavigateToDetails = () => {
        navigation.navigate("ProductDetails", { product });
    };

    const handleAddToCartPress = (e: any) => {
        e.stopPropagation();
        onAddToCart();
    };

    return (
        <View style={[styles.productCard, { width: cardWidth }]}>
            {!product.isAvailable && (
                <View style={styles.unavailableOverlay}>
                    <Text style={styles.unavailableText}>Not Available</Text>
                </View>
            )}
            <TouchableOpacity
                style={styles.cardContent}
                onPress={handleNavigateToDetails}
                activeOpacity={0.95}
                disabled={!product.isAvailable}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.images?.[0]?.image?.url || "" }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
                        <Icon
                            name={isFavorite ? "favorite" : "favorite-border"}
                            size={20}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                    {discountPercent > 0 && (
                        <Text style={styles.discountBadge}>{discountPercent}% OFF</Text>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                    </Text>
                    {discountPercent > 0 && (
                        <Text style={styles.productDiscount}>{discountPercent}% off</Text>
                    )}
                    <Text style={styles.productDetails}>{details}</Text>
                    <View style={styles.priceContainer}>
                        {marketPrice && (
                            <Text style={styles.oldPrice}>
                                ₹{parseToDecimal(marketPrice).toFixed(2)}
                            </Text>
                        )}
                        <Text style={styles.newPrice}>
                            ₹{parseToDecimal(sellingPrice).toFixed(2)}
                        </Text>
                    </View>
                </View>
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCartPress}
                        disabled={!product.isAvailable}
                    >
                        <LinearGradient
                            colors={BUTTON_GRADIENT}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text style={styles.buttonText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const CategoryResults = ({ navigation }: AppNavigation) => {
    const route = useRoute();
    const { categoryId, categoryName = "Products" } = (route.params as any) || {};

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [isBestSeller] = useState(categoryName === "Bestsellers");
    const [isRecommended] = useState(categoryName === "Recommended For You");
    const { latitude, longitude } = useLocationStore();
    const { userId } = useAuth();

    // Fetch subcategories on mount if categoryId exists
    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!categoryId) {
                setLoading(false);
                return;
            }
            try {
                const response = await getAllSubCategories({ categoryId });
                if (response.success) {
                    setSubCategories(response.data);
                }
            } catch (error) {
                console.error("Error fetching subcategories:", error);
                // Optionally show toast/error message
            }
        };
        fetchSubCategories();
    }, [categoryId]);

    // Dynamic categories for UI
    const displayCategories = ["All", ...subCategories.map((sc) => sc.name)];

    // Fetch products on category/subcategory change
    const fetchProducts = useCallback(async () => {
        const hasCategoryOrSpecial = categoryId || isBestSeller || isRecommended;
        if (!hasCategoryOrSpecial) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params: GetAllProductsParams = {
                isActive: true,
                lat: latitude ?? undefined,
                lng: longitude ?? undefined,
                userId: userId ?? undefined,
            };
            if (categoryId) {
                params.categoryId = categoryId;
            }
            if (selectedCategory !== "All") {
                const selectedSub = subCategories.find((sc) => sc.name === selectedCategory);
                if (selectedSub) {
                    params.subCategoryId = selectedSub.id;
                }
            }
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            if (isBestSeller) {
                params.isBestSeller = true;
            }
            if (isRecommended) {
                params.isRecommended = true;
            }
            const response = await getAllProducts(params);
            console.log('Response:', response);
            if (response.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            // Optionally show toast/error message
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [categoryId, selectedCategory, subCategories, searchQuery, isBestSeller, isRecommended, latitude, longitude, userId]);

    // Trigger fetch on category/subcategory change (non-search)
    useEffect(() => {
        fetchProducts();
    }, [categoryId, selectedCategory, isBestSeller, isRecommended, latitude, longitude, userId]);

    // Debounce search - skip initial empty query
    useEffect(() => {
        if (!searchQuery.trim()) return;
        const timer = setTimeout(() => {
            fetchProducts();
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleFavorite = useCallback((productId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
            } else {
                newFavorites.add(productId);
            }
            return newFavorites;
        });
    }, []);

    const handleAddToCart = useCallback((product: Product) => {
        console.log("Add to cart:", product.id, product.name);
        // Implement cart logic here (e.g., update cart API, local state)
    }, []);

    // if (!categoryId) {
    //     return (
    //         <SafeAreaView style={styles.container}>
    //             <Text>No category selected</Text>
    //         </SafeAreaView>
    //     );
    // }

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
                        <Text style={styles.headerTitle}>{categoryName}</Text>
                        <TouchableOpacity>
                            <Icon name="shopping-cart" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    {
                        !isBestSeller && !isRecommended && (
                            <View style={styles.searchInputContainer}>
                                <Icon name="search" size={20} color="rgba(255,255,255,0.9)" />
                                <TextInput
                                    placeholder="Search for chicken, pieces..."
                                    placeholderTextColor="rgba(255,255,255,0.85)"
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        )
                    }
                </LinearGradient>

                {/* CATEGORY BAR - EACH CHIP IS NOW A LEFT-TO-RIGHT GRADIENT */}
                {categoryId && (
                    <View style={styles.categoryWrapper}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryScroll}
                        >
                            {displayCategories.map((cat) => {
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
                )}

                {/* PRODUCTS */}
                <View style={styles.mainContent}>
                    {loading ? (
                        <InlineLoading visible={loading} />
                    ) : (
                        <View style={styles.productGrid}>
                            {products.length > 0 ? (
                                products.map((p) => {
                                    const isFavorite = favorites.has(p.id);
                                    return (
                                        <ProductCard
                                            key={p.id}
                                            product={p}
                                            navigation={navigation}
                                            isFavorite={isFavorite}
                                            onFavoritePress={() => toggleFavorite(p.id)}
                                            onAddToCart={() => handleAddToCart(p)}
                                        />
                                    );
                                })
                            ) : (
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 50 }}>
                                    <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>No products found</Text>
                                </View>
                            )}
                        </View>
                    )}
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
    filterButtonText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginLeft: 4 },
    /* PRODUCTS */
    mainContent: { paddingHorizontal: 16, flex: 1, marginTop: 10 },
    productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    /* ProductCard Styles */
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        position: "relative",
        gap: 12,
        overflow: "hidden",
    },
    cardContent: {
        flex: 1,
        gap: 12,
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        backgroundColor: COLORS.white,
    },
    productImage: {
        width: "100%",
        height: "100%",
        ...Platform.select({
            android: { elevation: 1 },
            ios: {},
        }),
    },
    favoriteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        padding: 6,
        backgroundColor: "#ffffffcc",
        borderRadius: 16,
        zIndex: 2,
    },
    discountBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: COLORS.highlight,
        color: COLORS.white,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        fontWeight: "700",
        fontSize: 10,
        zIndex: 2,
    },
    productInfo: {
        flex: 1,
        gap: 4,
    },
    productName: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: "800",
        lineHeight: 20,
    },
    productDiscount: {
        color: "#F59E0B",
        fontSize: 14,
        fontWeight: "700",
    },
    productDetails: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: "auto",
    },
    oldPrice: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        textDecorationLine: "line-through",
    },
    newPrice: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: "800",
        lineHeight: 20,
    },
    actionContainer: {
        marginTop: 8,
    },
    addToCartButton: {
        flex: 1,
        height: 42,
        borderRadius: 50,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 18,
        position: "relative",
        zIndex: 1,
    },
    unavailableOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(250, 250, 250, 0.8)",
        zIndex: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    unavailableText: {
        fontSize: 14,
        fontWeight: "bold",
        color: COLORS.primary,
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 2,
    },
    /* VIEW CART */
    viewCartBar: { position: "absolute", bottom: 12, left: 16, right: 16, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    viewCartItems: { color: COLORS.white, fontWeight: "700" },
    viewCartNote: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
    viewCartButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 40 },
    viewCartText: { color: COLORS.white, fontWeight: "700", marginRight: 6 },
});

export default CategoryResults;