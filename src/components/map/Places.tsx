// import React, { useState, useEffect } from 'react';
// import {
//     View,
//     TextInput,
//     FlatList,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     ActivityIndicator,
//     Keyboard,
// } from 'react-native';

// const API_KEY = 'AbLgb9uuCk5EsknyN9nd1hol4dk85ehUH7izgU1e';

// interface Prediction {
//     description: string;
//     place_id: string;
//     structured_formatting: {
//         main_text: string;
//         secondary_text: string;
//     };
// }

// interface PlaceDetails {
//     name: string;
//     formatted_address: string;
//     geometry: {
//         location: {
//             lat: number;
//             lng: number;
//         };
//     };
// }

// interface CustomPlacesAutocompleteProps {
//     onPlaceSelected?: (details: PlaceDetails | null) => void;
// }

// const CustomPlacesAutocomplete: React.FC<CustomPlacesAutocompleteProps> = ({ onPlaceSelected }) => {
//     const [searchText, setSearchText] = useState('');
//     const [predictions, setPredictions] = useState<Prediction[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [showResults, setShowResults] = useState(false);

//     // Debounce search
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (searchText.length > 2) {
//                 searchPlaces(searchText);
//             } else {
//                 setPredictions([]);
//                 setShowResults(false);
//             }
//         }, 500);

//         return () => clearTimeout(timer);
//     }, [searchText]);

//     const searchPlaces = async (text: string) => {
//         setLoading(true);
//         try {
//             const response = await fetch(
//                 `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
//                     text,
//                 )}&api_key=${API_KEY}&language=en`,
//             );
//             const apiResponse = await response.json();
//             console.log({ apiResponse });

//             const apiData = apiResponse.data || apiResponse;
//             if (apiData && apiData.status === 'ok') {
//                 setPredictions(apiData.predictions);
//                 setShowResults(true);
//             } else {
//                 console.error('Error:', apiData?.status || 'Unknown error');
//                 setPredictions([]);
//                 setShowResults(false);
//             }
//         } catch (error) {
//             console.error('Fetch error:', error);
//             setPredictions([]);
//             setShowResults(false);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getPlaceDetails = async (placeId: string) => {
//         try {
//             const response = await fetch(
//                 `https://api.olamaps.io/places/v1/placedetails?place_id=${placeId}&api_key=${API_KEY}&fields=name,formatted_address,geometry`,
//             );
//             const apiResponse = await response.json();

//             const apiData = apiResponse.data || apiResponse;
//             if (apiData && apiData.status === 'ok') {
//                 const details: PlaceDetails = apiData.result;
//                 console.log('Place Details:', details);
//                 console.log('Coordinates:', details.geometry.location);
//                 return details;
//             } else {
//                 console.error('Details API error:', apiData?.status || 'Unknown error');
//             }
//         } catch (error) {
//             console.error('Details fetch error:', error);
//         }
//         return null;
//     };

//     const handleSelectPlace = async (prediction: Prediction) => {
//         setSearchText(prediction.description);
//         setShowResults(false);
//         setPredictions([]);
//         Keyboard.dismiss();

//         // Fetch detailed info
//         const details = await getPlaceDetails(prediction.place_id);
//         console.log('Selected place:', prediction);
//         console.log('Details:', details);

//         if (onPlaceSelected) {
//             onPlaceSelected(details);
//         }
//     };

//     const renderPrediction = ({ item }: { item: Prediction }) => (
//         <TouchableOpacity
//             style={styles.predictionItem}
//             onPress={() => handleSelectPlace(item)}>
//             <Text style={styles.mainText}>
//                 {item.structured_formatting.main_text}
//             </Text>
//             <Text style={styles.secondaryText}>
//                 {item.structured_formatting.secondary_text}
//             </Text>
//         </TouchableOpacity>
//     );

//     return (
//         <View style={styles.fullContainer}>
//             <View style={styles.searchContainer}>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Search for a place"
//                     value={searchText}
//                     onChangeText={setSearchText}
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                 />
//                 {loading && (
//                     <ActivityIndicator style={styles.loader} size="small" color="#666" />
//                 )}
//             </View>

//             {showResults && predictions.length > 0 && (
//                 <FlatList
//                     data={predictions}
//                     keyExtractor={item => item.place_id}
//                     renderItem={renderPrediction}
//                     style={styles.listView}
//                     keyboardShouldPersistTaps="handled"
//                 />
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     fullContainer: {
//         flex: 1,
//     },
//     searchContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'white',
//         borderRadius: 8,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         marginBottom: 5,
//     },
//     input: {
//         flex: 1,
//         height: 50,
//         paddingHorizontal: 15,
//         fontSize: 16,
//         color: '#333',
//     },
//     loader: {
//         marginRight: 10,
//     },
//     listView: {
//         backgroundColor: 'white',
//         borderRadius: 8,
//         flex: 1,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//     },
//     predictionItem: {
//         padding: 15,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     mainText: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 4,
//     },
//     secondaryText: {
//         fontSize: 14,
//         color: '#666',
//     },
// });

// export default CustomPlacesAutocomplete;