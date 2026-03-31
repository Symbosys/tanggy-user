import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { AppNavigation } from '../../types/type';
import { Category } from '../../types/product.type';
import { useGetAllOffers } from '../../api/hooks/offer.hook';
import { COLORS } from '../../theme/theme';

interface OfferProps {
    category: Category[];
    navigation: AppNavigation['navigation'];
}

interface BannerOffer {
    id: string;
    image: string;
    title?: string | null;
    searchQuery?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Card dimensions for a professional rounded look with full-impact height
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);
const BANNER_HEIGHT = 350; // Restore large immersive height

const Offer = ({ category, navigation }: OfferProps) => {
    const { data: offers } = useGetAllOffers(true);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const bannerOffers: BannerOffer[] = offers?.map((offer) => ({
        id: offer.id,
        image: offer.image.url,
        title: offer.title,
        searchQuery: offer.searchQuery,
    })) ?? [];

    const handleTapOffer = (offer: BannerOffer) => {
        const searchQuery = offer.searchQuery?.trim() || offer.title?.trim() || 'Offers';
        navigation.navigate('CategoryResults', {
            categoryName: offer.title || 'Offers',
            search: searchQuery,
        });
    };

    const renderOfferItem = ({ item }: { item: BannerOffer }) => (
        <View style={styles.cardWrapper}>
            <TouchableOpacity 
                style={styles.cardContainer} 
                activeOpacity={0.9} 
                onPress={() => handleTapOffer(item)}
            >
                <Image
                    source={{ uri: item.image }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </View>
    );

    if (!bannerOffers.length) {
        const handleFallbackTap = () => {
            const curryCutCategory = category.find((c) => c.name.toLowerCase().includes('curry cut'));
            navigation.navigate('CategoryResults', {
                categoryId: curryCutCategory?.id,
                categoryName: curryCutCategory?.name || 'Curry Cuts',
                search: 'Curry Cut',
            });
        };

        return (
            <View style={styles.container}>
                <TouchableOpacity activeOpacity={0.9} onPress={handleFallbackTap} style={styles.cardContainer}>
                    <Image
                        source={require('../../assets/hero/Welcome.png')}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Carousel
                loop
                width={SCREEN_WIDTH}
                height={BANNER_HEIGHT + 20}
                autoPlay={true}
                data={bannerOffers}
                scrollAnimationDuration={800}
                autoPlayInterval={3500}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={({ item }) => renderOfferItem({ item })}
            />
            {bannerOffers.length > 1 && (
                <View style={styles.paginationContainer}>
                    {bannerOffers.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === activeIndex ? COLORS.primary : '#E0E0E0',
                                    width: index === activeIndex ? 24 : 8,
                                    opacity: index === activeIndex ? 1 : 0.5,
                                },
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        marginVertical: 10,
    },
    cardWrapper: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: BANNER_HEIGHT,
        borderRadius: 24, // High-end rounded corners
        overflow: 'hidden',
        backgroundColor: '#FFF',
        // Sophisticated shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 24,
    },
    dot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
    },
});

export default Offer;
