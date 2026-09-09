import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import ProductCard from '../../components/ui/products/DiscountProduct';
import { useAuth } from '../../context/AuthContext';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';

const { height: screenHeight } = Dimensions.get('window');
const headerHeight = screenHeight * 0.4;

const DealsScreen = ({ navigation }: AppNavigation) => {
    const { latitude, longitude } = useLocationStore();
    const { userId, isAuthenticated } = useAuth();
    const { showAlert } = useAlertStore();
    const {
        getQuantity,
        incrementQuantity,
        decrementQuantity,
    } = useCartStore();

    const {
        data,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useGetAllProducts({
        isActive: true,
        marketPrice: 1, // Only products with marketPrice > sellingPrice
        limit: 15,
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
        userId: userId ?? undefined,
    });

    const products = data?.pages.flatMap(page => page.products) || [];

    const handleNavigateToDetails = (product: Product) => {
        navigation.navigate('ProductDetails', { product });
    };

    const chunkArray = (array: Product[], size: number): Product[][] => {
        const chunks: Product[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    const productChunks = chunkArray(products, 2);

    const handleEndReached = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleAdd = (product: Product) => {
        if (!isAuthenticated) {
            showAlert({
                title: 'Login Required',
                message: 'You need to log in to add this product to your cart.',
                confirmText: 'Login',
                cancelText: 'Cancel',
                onConfirm: () => navigation.navigate('Login'),
            });
            return;
        }
        incrementQuantity(product);
    };

    const handleIncrement = (product: Product) => {
        if (!isAuthenticated) {
            showAlert({
                title: 'Login Required',
                message: 'You need to log in to update your cart.',
                confirmText: 'Login',
                cancelText: 'Cancel',
                onConfirm: () => navigation.navigate('Login'),
            });
            return;
        }
        incrementQuantity(product);
    };

    const handleDecrement = (product: Product) => {
        if (!isAuthenticated) return;
        decrementQuantity(product);
    };

    if (isLoading && products.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <View style={[styles.header, { height: headerHeight, marginBottom: 16 }]}>
            <Image
                source={require('../../assets/discount/discount.png')}
                style={styles.headerImage}
                resizeMode="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.headerContent}>
                <Text style={styles.title}>Exclusive Discounts</Text>
                <Text style={styles.subtitle}>Fresh Deals, Unbeatable Prices</Text>
            </View>
        </View>
    );

    const renderFooter = () => {
        if (isFetchingNextPage) {
            return (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
            );
        }
        return null;
    };

    const renderEmpty = () => {
        if (isLoading || isFetching) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No discount products available</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                style={styles.main}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                data={productChunks}
                keyExtractor={(row, index) =>
                    `${row.map(p => p.id).join('-')}-${index}`
                }
                renderItem={({ item: row }) => (
                    <View style={styles.row}>
                        {row.map((product, colIndex) => {
                            const quantity = getQuantity(product.id);
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    navigation={navigation}
                                    handleNavigateToDetails={handleNavigateToDetails}
                                    quantity={quantity}
                                    onAdd={() => handleAdd(product)}
                                    onIncrement={() => handleIncrement(product)}
                                    onDecrement={() => handleDecrement(product)}
                                    style={colIndex === 0 ? { marginRight: 16 } : undefined}
                                />
                            );
                        })}
                        {row.length === 1 && <View style={styles.spacer} />}
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshing={Boolean(isFetching && !isFetchingNextPage && !isLoading)}
                onRefresh={refetch}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews={true}
            />

            {isAuthenticated && (
                <UnifiedFloatingBar
                    hasBottomTab={true}
                    onCartPress={() => navigation.navigate('Cart')}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    main: {
        flex: 1,
        marginBottom: 40,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        position: 'relative',
        overflow: 'hidden',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    headerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    title: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    spacer: {
        flex: 1,
    },
    emptyContainer: {
        paddingVertical: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});

export default DealsScreen;