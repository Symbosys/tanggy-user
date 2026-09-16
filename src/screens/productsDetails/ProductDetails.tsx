import { ICarouselInstance } from 'react-native-reanimated-carousel';
import Carousel from 'react-native-reanimated-carousel';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import { COLORS } from '../../theme/theme';
import { calculateDiscount, ErrorMessage, parseToDecimal } from '../../utils/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = screenHeight * 0.44;

interface ProductDetailsScreenProps {}

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  route,
  navigation,
}: any) => {
  const { product: initialProduct } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);

  const carouselRef = useRef<ICarouselInstance>(null);
  const insets = useSafeAreaInsets();

  const { isAuthenticated } = useAuth();
  const { showAlert } = useAlertStore();
  const { addToCart, getQuantity, incrementQuantity, decrementQuantity } =
    useCartStore();

  const cartQuantity = getQuantity(initialProduct.id);

  const images =
    initialProduct.images && initialProduct.images.length > 0
      ? initialProduct.images
      : [
          {
            image: {
              url:
                initialProduct.images?.[0]?.image?.url ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdGtO6CtXQzXjIOl0f-UI7upTYW9Bw58orLQ&s',
            },
          },
        ];

  const currentPrice = parseToDecimal(initialProduct.sellingPrice).toFixed(0);
  const originalPrice = initialProduct.marketPrice
    ? parseToDecimal(initialProduct.marketPrice).toFixed(0)
    : null;
  const discountPercent = calculateDiscount(
    initialProduct.marketPrice,
    initialProduct.sellingPrice
  );

  const isNonVeg = (() => {
    const text = `${initialProduct.name} ${
      initialProduct.description || ''
    } ${initialProduct.category?.name || ''}`.toLowerCase();
    return (
      text.includes('chicken') ||
      text.includes('meat') ||
      text.includes('mutton') ||
      text.includes('fish') ||
      text.includes('egg') ||
      text.includes('non-veg') ||
      text.includes('prawn') ||
      text.includes('beef') ||
      text.includes('pork')
    );
  })();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${initialProduct.name} on Tanggy! Only for ₹${currentPrice}. Download the app now!`,
      });
    } catch (error) {
      // User dismissed share
    }
  };

  const handleAddToCart = async () => {
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

    try {
      if (cartQuantity === 0) {
        await addToCart(initialProduct.id, 1, initialProduct);
        Toast.show({
          type: 'success',
          text1: 'Added to cart!',
        });
      } else {
        await incrementQuantity(initialProduct);
        Toast.show({
          type: 'success',
          text1: '1 more added to cart!',
        });
      }
    } catch (error) {
      ErrorMessage(error as any);
    }
  };

  const handleIncrement = async () => {
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

    try {
      await incrementQuantity(initialProduct);
    } catch (error) {
      ErrorMessage(error as any);
    }
  };

  const handleDecrement = async () => {
    if (!isAuthenticated) return;

    try {
      await decrementQuantity(initialProduct);
    } catch (error) {
      ErrorMessage(error as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Full-Bleed Top Carousel Header */}
      <View style={styles.fixedImageContainer} pointerEvents="box-none">
        <Carousel
          ref={carouselRef}
          width={screenWidth}
          height={HEADER_HEIGHT}
          data={images}
          autoPlay={false}
          scrollAnimationDuration={400}
          onSnapToItem={(index) => setCurrentImageIndex(index)}
          renderItem={({ item }: any) => (
            <Image
              source={{ uri: item.image.url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
        />

        {/* Image Pagination Counter Badge (e.g. 1/5) */}
        <View style={styles.imageCounterBadge}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1}/{images.length}
          </Text>
        </View>

        {/* Horizontal Image Thumbnails Strip */}
        <View style={styles.thumbnailStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScroll}
          >
            {images.slice(0, 4).map((img: any, idx: number) => {
              const isActive = idx === currentImageIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbnailWrap,
                    isActive && styles.activeThumbnail,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCurrentImageIndex(idx);
                    carouselRef.current?.scrollTo({ index: idx });
                  }}
                >
                  <Image
                    source={{ uri: img.image.url }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}

            {images.length > 4 && (
              <TouchableOpacity
                style={styles.thumbnailMoreWrap}
                activeOpacity={0.8}
                onPress={() => {
                  const nextIndex =
                    currentImageIndex >= 4 ? 0 : 4;
                  setCurrentImageIndex(nextIndex);
                  carouselRef.current?.scrollTo({ index: nextIndex });
                }}
              >
                <Image
                  source={{ uri: images[4]?.image.url }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <View style={styles.thumbnailMoreOverlay}>
                  <Text style={styles.thumbnailMoreText}>
                    +{images.length - 3}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Main Details Sheet Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer pushing content below hero carousel */}
        <View style={{ height: HEADER_HEIGHT - 20 }} pointerEvents="none" />

        {/* White Rounded Body Sheet */}
        <View style={styles.detailsSheet}>
          {/* Bestseller Badge */}
          <View style={styles.bestsellerRow}>
            <View style={styles.bestsellerBadge}>
              <Icon name="local-fire-department" size={13} color={COLORS.primary} />
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.title}>{initialProduct.name}</Text>

          {/* Subtitle / Pieces Meta */}
          <Text style={styles.subtitle}>
            {initialProduct.description
              ? initialProduct.description
              : `Fresh premium ${initialProduct.name.toLowerCase()} prepared with authentic spices and ingredients.`}
          </Text>

          {/* Meta Info Row (Rating | Time | Food Type) */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="star" size={15} color={COLORS.warning} />
              <Text style={styles.metaBold}> 4.8</Text>
              <Text style={styles.metaMuted}> (320 reviews)</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Icon name="schedule" size={15} color={COLORS.textPrimary} />
              <Text style={styles.metaNormal}> 25–30 min</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Icon
                name={isNonVeg ? 'restaurant' : 'eco'}
                size={15}
                color={isNonVeg ? COLORS.error : COLORS.success}
              />
              <Text style={styles.metaNormal}>
                {isNonVeg ? ' Non Veg' : ' Pure Veg'}
              </Text>
            </View>
          </View>

          {/* Price Row with Discount Tag */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{currentPrice}</Text>
            {originalPrice && Number(originalPrice) > Number(currentPrice) && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
            {discountPercent > 0 && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>
                  {discountPercent}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* 4 Feature Badges Row */}
          <View style={styles.featuresRow}>
            {[
              {
                icon: 'eco',
                label: 'Fresh\nIngredients',
              },
              {
                icon: 'star-outline',
                label: 'Authentic\nTaste',
              },
              {
                icon: 'verified-user',
                label: 'Hygienically\nPrepared',
              },
              {
                icon: 'restaurant-menu',
                label: "Chef's\nSpecial",
              },
            ].map((f, i) => (
              <React.Fragment key={i}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}>
                    <Icon name={f.icon} size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
                {i < 3 && <View style={styles.featureDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* "About This Item" Section */}
          <View style={styles.aboutSection}>
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>About This Item</Text>
              <TouchableOpacity
                onPress={() => setIsReadMore(!isReadMore)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.readMoreBtn}
              >
                <Text style={styles.readMoreText}>
                  {isReadMore ? 'Read Less' : 'Read More'}
                </Text>
                <Icon
                  name={isReadMore ? 'keyboard-arrow-up' : 'chevron-right'}
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.aboutBody}
              numberOfLines={isReadMore ? undefined : 3}
            >
              {initialProduct.description
                ? initialProduct.description
                : `Our ${initialProduct.name} is made with premium basmati rice, marinated tender cuts, and a rich blend of traditional aromatic spices. Slow-cooked to perfection for an unforgettable culinary experience.`}
            </Text>
          </View>

          {/* Highlights / Value Props Card */}
          <View style={styles.valuePropsCard}>
            <View style={styles.valuePropCol}>
              <Icon name="local-fire-department" size={20} color={COLORS.primary} />
              <Text style={styles.valuePropTitle}>Rich Aroma</Text>
              <Text style={styles.valuePropSub}>Traditional authentic flavors</Text>
            </View>

            <View style={styles.valuePropDivider} />

            <View style={styles.valuePropCol}>
              <Icon name="favorite-border" size={20} color={COLORS.primary} />
              <Text style={styles.valuePropTitle}>Customer Favorite</Text>
              <Text style={styles.valuePropSub}>Loved by thousands</Text>
            </View>

            <View style={styles.valuePropDivider} />

            <View style={styles.valuePropCol}>
              <Icon name="eco" size={20} color={COLORS.primary} />
              <Text style={styles.valuePropTitle}>Premium Quality</Text>
              <Text style={styles.valuePropSub}>Finest ingredients</Text>
            </View>
          </View>

          {/* Bottom spacing for sticky bar */}
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* Top Floating Navigation Buttons */}
      <View style={[styles.topBar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else {
              navigation.navigate('BottomTab');
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
          >
            <Icon name="share" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Bottom Bar */}
      {initialProduct.isAvailable !== false && (
        <View
          style={[
            styles.stickyBottomBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          {cartQuantity === 0 ? (
            <TouchableOpacity
              style={styles.addToCartButtonFull}
              onPress={handleAddToCart}
              activeOpacity={0.88}
            >
              <Icon name="shopping-cart" size={18} color={COLORS.white} />
              <Text style={styles.addToCartButtonText}>
                Add to Cart  ₹{currentPrice}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.bottomControlsRow}>
              {/* Left Quantity Stepper Pill */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={handleDecrement}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  activeOpacity={0.7}
                >
                  <Icon name="remove" size={16} color={COLORS.primary} />
                </TouchableOpacity>

                <Text style={styles.stepperValue}>{cartQuantity}</Text>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={handleIncrement}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  activeOpacity={0.7}
                >
                  <Icon name="add" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {/* Right View Cart Button */}
              <TouchableOpacity
                style={styles.viewCartBtn}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.88}
              >
                <Icon name="shopping-cart" size={18} color={COLORS.white} />
                <Text style={styles.viewCartBtnText}>View Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fixedImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.surface,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
    elevation: 20,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  imageCounterBadge: {
    position: 'absolute',
    right: 16,
    bottom: 45,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 5,
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 26,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  thumbnailScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnailWrap: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  activeThumbnail: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailMoreWrap: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailMoreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailMoreText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  // ── Scroll Content ──
  scrollContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  detailsSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    minHeight: screenHeight - HEADER_HEIGHT + 100,
    elevation: 8,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bestsellerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bestsellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestsellerText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaBold: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metaMuted: {
    fontSize: 11.5,
    color: COLORS.muted,
    fontWeight: '500',
  },
  metaNormal: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
    fontWeight: '600',
    marginLeft: 8,
  },
  discountPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  discountPillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  // ── 4 Feature Icons Row ──
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  featureDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },

  // ── About Item ──
  aboutSection: {
    marginBottom: 20,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aboutBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontWeight: '400',
  },

  // ── Value Props Card ──
  valuePropsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    alignItems: 'center',
  },
  valuePropCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  valuePropTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  valuePropSub: {
    fontSize: 9.5,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '500',
  },
  valuePropDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.highlight,
  },

  // ── Sticky Bottom Bar ──
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    zIndex: 1000,
    elevation: 25,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  addToCartButtonFull: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addToCartButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  bottomControlsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewCartBtn: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  viewCartBtnText: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '800',
  },
});

export default ProductDetailsScreen;