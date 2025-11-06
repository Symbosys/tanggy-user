import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const {  height: screenHeight } = Dimensions.get('window');

const HEADER_HEIGHT = 0.45 * screenHeight;
const BOTTOM_BAR_HEIGHT = 80;

interface ProductDetailsScreenProps { }

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Top App Bar & Image Carousel Section */}
            <View style={styles.headerSection}>
                {/* Header Image with Overlay */}
                <View style={[styles.headerImage, { height: HEADER_HEIGHT }]}>
                    {/* Overlay Gradient - hardcoded as semi-transparent black */}
                    <View style={styles.overlayGradient} />
                    {/* Top App Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Icon name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.rightIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Icon name="favorite-border" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Icon name="share" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Bestseller Badge */}
                    <View style={styles.badgeContainer}>
                        <View style={styles.bestsellerBadge}>
                            <Text style={styles.bestsellerText}>BESTSELLER</Text>
                        </View>
                    </View>
                    {/* Carousel Dots */}
                    <View style={styles.carouselDots}>
                        <View style={styles.activeDot} />
                        <View style={styles.inactiveDot} />
                        <View style={styles.inactiveDot} />
                        <View style={styles.inactiveDot} />
                    </View>
                </View>
            </View>

            {/* Product Details Section */}
            <ScrollView
                style={styles.detailsSection}
                contentContainerStyle={styles.detailsContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Headline & Meta Text */}
                <View style={styles.headlineSection}>
                    <Text style={styles.title}>Chicken Curry Cut (Skinless)</Text>
                    <Text style={styles.description}>Tender, juicy, perfect for hearty curries.</Text>
                    <Text style={styles.category}>Category: Poultry</Text>
                </View>

                {/* Price & Weight Selection Card */}
                <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPrice}>₹149</Text>
                            <Text style={styles.originalPrice}>₹185</Text>
                        </View>
                        <View style={styles.discountBadgeCard}>
                            <Text style={styles.discountText}>20% OFF</Text>
                        </View>
                    </View>
                    <View style={styles.weightSection}>
                        <Text style={styles.weightLabel}>Select Weight</Text>
                        <View style={styles.weightButtons}>
                            <TouchableOpacity style={[styles.weightButton, styles.activeWeightButton]}>
                                <Text style={styles.activeWeightText}>500g</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.weightButton}>
                                <Text style={styles.inactiveWeightText}>1kg</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.weightButton}>
                                <Text style={styles.inactiveWeightText}>250g</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.stockText}>In Stock</Text>
                </View>

                {/* Freshness Tags */}
                <View style={styles.freshnessGrid}>
                    <View style={styles.freshnessItem}>
                        <Icon name="ac-unit" size={24} color={COLORS.primary} />
                        <Text style={styles.freshnessText}>Chilled, Never Frozen</Text>
                    </View>
                    <View style={styles.freshnessItem}>
                        <Icon name="verified" size={24} color={COLORS.primary} />
                        <Text style={styles.freshnessText}>100% Fresh Cut</Text>
                    </View>
                    <View style={styles.freshnessItem}>
                        <Icon name="science" size={24} color={COLORS.primary} />
                        <Text style={styles.freshnessText}>Antibiotic-Free</Text>
                    </View>
                </View>

                {/* Product Description */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>Product Description</Text>
                    <Text style={styles.descriptionBody}>
                        Our skinless Chicken Curry Cut is a mix of bone-in and boneless pieces from the entire bird. Perfect for
                        traditional curries, biryanis, or stews, each piece is precisely cut for uniform cooking. Sourced from local
                        farms and processed with the highest hygiene standards.
                    </Text>
                </View>

                {/* Preparation & Storage */}
                <View style={styles.tipsSection}>
                    <View style={styles.tipCard}>
                        <View style={styles.tipHeader}>
                            <Icon name="soup-kitchen" size={24} color={COLORS.primary} style={styles.tipIcon} />
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Preparation Tips</Text>
                                <Text style={styles.tipBody}>Rinse lightly with cold water before cooking. Pat dry for better searing and flavor absorption.</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.tipCard}>
                        <View style={styles.tipHeader}>
                            <Icon name="thermostat" size={24} color={COLORS.primary} style={styles.tipIcon} />
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Storage Tips</Text>
                                <Text style={styles.tipBody}>Store in an airtight container and refrigerate below 4°C. Consume within 2 days for best freshness.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Vendor Section */}
                <View style={styles.vendorCard}>
                    <View style={styles.vendorHeader}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTJXTp4WFc0nuF8YT1vqm95Orjej7pk-87mBi7D2y4_PqWmSSXy64q-0BHC7G3x9Y8VvkZ7WNu8AB7_PgYK_LQuLYSVUbAlsytBauz5oiTJYz9yZVOqJrEOErUy94k9fWwFz1_XqgDsPiC5emtkVzCj08WU_dMWS-xxpA8S5qo420RS_fCBU3D-ehUyVHuCShkIXOO1SKJNdbCo9ebLHgFJizbMiia4SmNtAdFdlXnnpPNOaQhrHf0gHplPqdZ_LSiGfXzxDWShH8Y' }}
                            style={styles.vendorLogo}
                        />
                        <View style={styles.vendorInfo}>
                            <Text style={styles.vendorName}>Vendor Fresh Farms</Text>
                            <View style={styles.vendorRating}>
                                <Icon name="star" size={16} color="#fbbf24" />
                                <Text style={styles.vendorRatingText}>4.8 (250 ratings) • Pune</Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Icon name="chevron-right" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Customer Reviews */}
                <View style={styles.reviewsSection}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.reviewsTitle}>Ratings & Reviews</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.reviewsCard}>
                        <View style={styles.ratingSummary}>
                            <View style={styles.overallRating}>
                                <Text style={styles.overallScore}>4.7</Text>
                                <Text style={styles.overallLabel}>out of 5</Text>
                            </View>
                            <View style={styles.ratingBars}>
                                <View style={styles.barRow}>
                                    <Text style={styles.starLabel}>5 ★</Text>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.bar, styles.barFill85]} />
                                    </View>
                                </View>
                                <View style={styles.barRow}>
                                    <Text style={styles.starLabel}>4 ★</Text>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.bar, styles.barFill10]} />
                                    </View>
                                </View>
                                <View style={styles.barRow}>
                                    <Text style={styles.starLabel}>3 ★</Text>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.bar, styles.barFill3]} />
                                    </View>
                                </View>
                                <View style={styles.barRow}>
                                    <Text style={styles.starLabel}>2 ★</Text>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.bar, styles.barFill1]} />
                                    </View>
                                </View>
                                <View style={styles.barRow}>
                                    <Text style={styles.starLabel}>1 ★</Text>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.bar, styles.barFill1]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.reviewSample}>
                            <View style={styles.starsContainer}>
                                <Icon name="star" size={16} color="#fbbf24" />
                                <Icon name="star" size={16} color="#fbbf24" />
                                <Icon name="star" size={16} color="#fbbf24" />
                                <Icon name="star" size={16} color="#fbbf24" />
                                <Icon name="star" size={16} color="#fbbf24" />
                            </View>
                            <Text style={styles.reviewText}>
                                "Absolutely fresh and well-cut. Made the best chicken curry I've had in a long time!" - Priya S.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton}>
                        <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>1</Text>
                    <TouchableOpacity style={styles.quantityButton}>
                        <Text style={styles.quantityText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addToCartButton}>
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerSection: {
        position: 'relative',
    },
    headerImage: {
        backgroundColor: 'black', // Placeholder for image
        justifyContent: 'space-between',
    },
    overlayGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Hardcoded semi-transparent black
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Hardcoded for gradient effect
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    badgeContainer: {
        position: 'absolute',
        top: 80,
        left: 16,
    },
    bestsellerBadge: {
        backgroundColor: '#ec4899', // Hardcoded pink-orange gradient as solid
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    bestsellerText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    carouselDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
    },
    activeDot: {
        width: 24,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    inactiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    detailsSection: {
        flex: 1,
        marginTop: -24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: COLORS.background,
    },
    detailsContent: {
        padding: 24,
        paddingTop: 24,
        paddingBottom: BOTTOM_BAR_HEIGHT,
    },
    headlineSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        lineHeight: 28,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 4,
        lineHeight: 24,
    },
    category: {
        fontSize: 14,
        color: '#16a34a', // Hardcoded green
        fontWeight: '500',
        marginTop: 8,
    },
    priceCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    priceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    currentPrice: {
        fontSize: 30,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    originalPrice: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    discountBadgeCard: {
        backgroundColor: 'rgba(135, 25, 198, 0.2)', // Hardcoded primary/20
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    weightSection: {
        gap: 12,
    },
    weightLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    weightButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    weightButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#d1d5db', // Hardcoded gray-300
    },
    activeWeightButton: {
        backgroundColor: 'rgba(135, 25, 198, 0.2)', // primary/20
        borderColor: COLORS.primary,
    },
    activeWeightText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    inactiveWeightText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#16a34a', // Hardcoded green
        marginTop: 12,
    },
    freshnessGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    freshnessItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    freshnessText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    descriptionCard: {
        backgroundColor: COLORS.secondary, // Soft pink
        padding: 16,
        borderRadius: 12,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    descriptionBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    tipsSection: {
        gap: 16,
    },
    tipCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Glassmorphic light
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tipHeader: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    tipIcon: {
        marginTop: 4,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    tipBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    vendorCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    vendorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    vendorLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    vendorInfo: {
        flex: 1,
        marginLeft: 16,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    vendorRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    vendorRatingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    reviewsSection: {
        marginBottom: 24,
    },
    reviewsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    reviewsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    reviewsCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
        gap: 16,
    },
    ratingSummary: {
        flexDirection: 'row',
        gap: 16,
    },
    overallRating: {
        alignItems: 'center',
    },
    overallScore: {
        fontSize: 40,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    overallLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    ratingBars: {
        flex: 1,
        gap: 4,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    starLabel: {
        width: 16,
        fontSize: 12,
    },
    barContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#e5e7eb', // Hardcoded gray-200
        borderRadius: 3,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 3,
    },
    barFill85: {
        width: '85%',
        backgroundColor: '#22c55e', // Hardcoded green-500
    },
    barFill10: {
        width: '10%',
        backgroundColor: '#22c55e',
    },
    barFill3: {
        width: '3%',
        backgroundColor: '#eab308', // Hardcoded yellow-500
    },
    barFill1: {
        width: '1%',
        backgroundColor: '#f97316', // Hardcoded orange-500 for 2*, red for 1* but simplified
    },
    reviewSample: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb', // gray-200
        paddingTop: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginTop: 4,
        lineHeight: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb', // gray-200
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e5e7eb', // gray-200
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    quantity: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        minWidth: 20,
        textAlign: 'center',
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: '#fb923c', // Hardcoded orange for gradient
        paddingVertical: 12,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});