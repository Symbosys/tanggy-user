import React, { useRef, useState, useEffect } from 'react';
import { View, Image, FlatList, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { COLORS as THEME_COLORS } from '../../theme/theme';
import { useGetAllAdvertisements } from '../../api/hooks/advertisement.hook';

interface BannerItem {
    id: string;
    image: string;
}

const { width } = Dimensions.get('window');

const COLORS = {
    ...THEME_COLORS,
    secondary: '#fbc02d',
    blue: THEME_COLORS.primary,
    bg: THEME_COLORS.background,
    black: '#000000',
    text: THEME_COLORS.textPrimary,
    gray: THEME_COLORS.muted,
    lightRed: '#FEE2E2',
    redText: '#b91c1c',
    lightYellow: '#DBEAFE',
    orange: THEME_COLORS.primary,
};

const BANNER_DATA: BannerItem[] = [
    {
        id: '1',
        image:
            'https://imgs.search.brave.com/zjheuudkVf3hS8K-sIylJ7ICB-uIyk2D8Ez9DKrW_rA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhldGFrZW91dC5j/b20vaW1nL2dhbGxl/cnkvMTUtZGlzaGVz/LXByb2Zlc3Npb25h/bC1jaGVmcy1sb3Zl/LXRvLW9yZGVyLWF0/LXJlc3RhdXJhbnRz/L2ludHJvLTE3NTE2/MjI4NjQuanBn',
    },
    {
        id: '2',
        image:
            'https://imgs.search.brave.com/bEIQSFJXnP5-0x1ncP74Ky2pNqfnjWdyijZEn6ceH9w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhldGFrZW91dC5j/b20vaW1nL2dhbGxl/cnkvMTUtZGlzaGVz/LXByb2Zlc3Npb25h/bC1jaGVmcy1sb3Zl/LXRvLW9yZGVyLWF0/LXJlc3RhdXJhbnRz/L3Rhc3RpbmctbWVu/dXMtMTc1MTYyMjg4/NC5qcGc',
    },
    {
        id: '3',
        image:
            'https://imgs.search.brave.com/zjheuudkVf3hS8K-sIylJ7ICB-uIyk2D8Ez9DKrW_rA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhldGFrZW91dC5j/b20vaW1nL2dhbGxl/cnkvMTUtZGlzaGVz/LXByb2Zlc3Npb25h/bC1jaGVmcy1sb3Zl/LXRvLW9yZGVyLWF0/LXJlc3RhdXJhbnRz/L2ludHJvLTE3NTE2/MjI4NjQuanBn',
    },
];

const Ads = () => {
    const { data: adsData } = useGetAllAdvertisements(true);
    const flatListRef = useRef<FlatList<BannerItem>>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const bannerItems = adsData?.length
        ? adsData.map((ad) => ({ id: ad.id, image: ad.image.url }))
        : BANNER_DATA;

    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= bannerItems.length) {
                nextIndex = 0;
            }
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }, 3000);

        return () => clearInterval(interval);
    }, [activeIndex, bannerItems.length]);

    const renderBannerItem = ({ item }: { item: BannerItem }) => (
        <View style={styles.bannerSlide}>
            <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerOverlay} />
        </View>
    );

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveIndex(index);
    };

    return (
        <View style={styles.carouselContainer}>
            <FlatList
                ref={flatListRef}
                data={bannerItems}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderBannerItem}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />
            <View style={styles.paginationContainer}>
                {bannerItems.map((_, index) => (
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
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        height: 360,
        marginBottom: -40,
        position: 'relative',
    },
    bannerSlide: {
        width: width,
        height: 340,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
});

export default Ads;
