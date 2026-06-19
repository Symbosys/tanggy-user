import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import ProductCard from '../../components/ui/products/DiscountProduct';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts } from '../../services/product.service';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { ErrorMessage } from '../../utils/utils';

const { height: screenHeight } = Dimensions.get('window');
const headerHeight = screenHeight * 0.4;

const DealsScreen = ({ navigation }: AppNavigation) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { latitude, longitude } = useLocationStore();
    const { userId, isAuthenticated } = useAuth();
    const { showAlert } = useAlertStore();
    const {
        getQuantity,
        incrementQuantity,
        decrementQuantity,
        totalItems: totalCartItems,
        subtotal: subTotal,
    } = useCartStore();

    const fetchDiscountProducts = async () => {
        try {
            setIsLoading(true);
            const res = await getAllProducts({
                isActive: true,
                lat: latitude ?? undefined,
                lng: longitude ?? undefined,
                userId: userId ?? undefined,
                marketPrice: 1, // Only products with marketPrice > sellingPrice
            });
            setProducts(res.data.products);
        } catch (error) {
            ErrorMessage(error as AxiosError | Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscountProducts();
    }, [latitude, longitude, userId]);

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

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.main}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Image */}
                <View style={[styles.header, { height: headerHeight }]}>
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

                {/* Products Grid */}
                <View style={styles.grid}>
                    {productChunks.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map((product, colIndex) => {
                                const quantity = getQuantity(product.id);

                                const handleAdd = () => {
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

                                const handleIncrement = () => {
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

                                const handleDecrement = () => {
                                    if (!isAuthenticated) return;
                                    decrementQuantity(product);
                                };

                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        navigation={navigation}
                                        handleNavigateToDetails={handleNavigateToDetails}
                                        quantity={quantity}
                                        onAdd={handleAdd}
                                        onIncrement={handleIncrement}
                                        onDecrement={handleDecrement}
                                        style={colIndex === 0 ? { marginRight: 16 } : undefined}
                                    />
                                );
                            })}
                            {row.length === 1 && <View style={styles.spacer} />}
                        </View>
                    ))}
                </View>
            </ScrollView>

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
    grid: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    spacer: {
        flex: 1,
    },
});

export default DealsScreen;