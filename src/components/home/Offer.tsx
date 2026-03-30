import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, ImageBackground, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const { width } = Dimensions.get('window');

const Offer = ({ category, navigation }: OfferProps) => {
    const { data: offers } = useGetAllOffers(true);
    console.log('Offers:', offers);
    const flatListRef = useRef<FlatList<BannerOffer>>(null);
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
        <TouchableOpacity style={{ width }} activeOpacity={0.9} onPress={() => handleTapOffer(item)}>
            <ImageBackground
                source={{ uri: item.image }}
                style={[styles.bannerImage, { width }]}
                imageStyle={{ borderRadius: 16 }}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveIndex(index);
    };

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
            <View style={styles.bannerSection}>
                <TouchableOpacity activeOpacity={0.9} onPress={handleFallbackTap}>
                    <ImageBackground
                        source={require('../../assets/hero/Welcome.png')}
                        style={styles.bannerImage}
                        imageStyle={{ borderRadius: 16 }}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.bannerSection}>
            <FlatList
                ref={flatListRef}
                data={bannerOffers}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderOfferItem}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />
            {bannerOffers.length > 1 && (
                <View style={styles.paginationContainer}>
                    {bannerOffers.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === activeIndex ? COLORS.white : 'rgba(255,255,255,0.5)',
                                    width: index === activeIndex ? 20 : 8,
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
    bannerSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    bannerImage: {
        width: '100%',
        height: 350,
        overflow: 'hidden',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
});

export default Offer;
