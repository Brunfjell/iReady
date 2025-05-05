import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { registerWeatherTask } from '../background/weatherTask';
import WeatherCard from '../components/weatherCard';
import WeeklyForecast from '../components/weeklyForecast';
import { fetchWeather, fetchWeatherByCity } from '../services/weatherAPI';
import { getSuggestionsBasedOnWeather } from '../utils/advice';
import { sendWeatherNotifications } from '../utils/notifications';
import { storeWeatherLog } from '../utils/storage';

const backgroundImage = require('../assets/images/weather-bg.jpg'); 

export default function Home() {
  const [weather, setWeather] = useState<{ 
    temp: number; 
    humidity: number;
    description?: string;
    feels_like?: number;
    wind_speed?: number;
  } | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [bookmarkedCities, setBookmarkedCities] = useState<string[]>([]);
  const [bookmarksModalVisible, setBookmarksModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadBookmarks();
    getWeatherByLocation();
    registerWeatherTask();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  const BOOKMARKS_KEY = 'weather_bookmarks';
  const HISTORY_KEY = 'weather_history';

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarkedCities(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const saveBookmarks = async (updatedBookmarks: string[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  const getWeatherByLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      const data = await fetchWeather(location.coords.latitude, location.coords.longitude);
      setWeather({ 
        temp: data.main.temp, 
        humidity: data.main.humidity,
        description: data.weather[0].description,
        feels_like: data.main.feels_like,
        wind_speed: data.wind.speed
      });
      setCity(data.name);
      sendWeatherNotifications(data);
      await saveWeatherToHistory(data);
      await storeWeatherLog(data);
    } catch (err) {
      console.error('Weather error:', err);
      Alert.alert('Error', 'Could not fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByCity = async (cityName: string) => {
    try {
      setLoading(true);
      const data = await fetchWeatherByCity(cityName);
      setWeather({ 
        temp: data.main.temp, 
        humidity: data.main.humidity,
        description: data.weather[0].description,
        feels_like: data.main.feels_like,
        wind_speed: data.wind.speed
      });
      setCity(data.name);
      sendWeatherNotifications(data);
      await saveWeatherToHistory(data);
    } catch (err) {
      console.error('City weather error:', err);
      Alert.alert('Error', 'Could not find city.');
    } finally {
      setLoading(false);
    }
  };

  const saveWeatherToHistory = async (data: any) => {
    try {
      const historyRaw = await AsyncStorage.getItem(HISTORY_KEY);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
  
      const newEntry = {
        city: data.name,
        temp: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        feels_like: data.main.feels_like,
        wind_speed: data.wind.speed,
        timestamp: new Date().toISOString(),
      };
  
      const updatedHistory = [newEntry, ...history].slice(0, 20);
  
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save weather history:', error);
    }
  };
  

  const bookmarkCurrentCity = () => {
    if (!city || bookmarkedCities.includes(city)) return;
    const updated = [...bookmarkedCities, city];
    setBookmarkedCities(updated);
    saveBookmarks(updated);
    Alert.alert('Bookmarked', `${city} has been added to your bookmarks.`);
  };

  const removeBookmark = (cityToRemove: string) => {
    const updated = bookmarkedCities.filter(city => city !== cityToRemove);
    setBookmarkedCities(updated);
    saveBookmarks(updated);
  };

  const handleAdvicePress = () => {
    if (!weather) {
      Alert.alert("No data", "Weather data is unavailable right now.");
      return;
    }
  
    const weatherData = {
      main: {
        temp: weather.temp, 
      },
      weather: [
        {
          main: weather.description || '',
        },
      ],
      wind: {
        speed: weather.wind_speed || 0,
      },
    };
    
    const suggestions = getSuggestionsBasedOnWeather(weatherData);
    Alert.alert("Weather Advice", suggestions.join("\n"));
  };
    
  if (loading || !weather) {
    return (
      <ImageBackground source={backgroundImage} style={styles.loadingContainer} blurRadius={2}>
        <ActivityIndicator size="large" color="#03d3fc" />
        <Text style={styles.loadingText}>Fetching weather data...</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.safeArea} blurRadius={2}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.container}>
            <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.headerText}>iReady</Text>
              <View style={styles.rightButtons}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    onPress={() => {
                      animateButton();
                      handleAdvicePress();
                    }}
                    style={styles.adviceButton}
                  >
                    <MaterialIcons name="lightbulb" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => {
                      animateButton();
                      router.push('/history');
                    }}
                  >
                    <MaterialIcons name="history" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.weatherContainer, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.locationText}>{city}</Text>
              
              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                {['gps-fixed', 'location-city', 'bookmark-add', 'bookmarks'].map((icon, index) => (
                  <Animated.View 
                    key={icon}
                    style={[
                      styles.iconButtonContainer,
                      { 
                        transform: [{ translateY: slideAnim }],
                        backgroundColor: index === 0 ? 'rgba(74, 145, 226, 0.75)' : 
                                        index === 1 ? 'rgba(74, 226, 74, 0.75)' : 
                                        index === 2 ? 'rgba(226, 77, 74, 0.75)' : 
                                        'rgba(226, 132, 74, 0.75)'
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => {
                        animateButton();
                        if (index === 0) getWeatherByLocation();
                        else if (index === 1) setManualModalVisible(true);
                        else if (index === 2) bookmarkCurrentCity();
                        else setBookmarksModalVisible(true);
                      }}
                    >
                      <MaterialIcons 
                        name={icon} 
                        size={24} 
                        color={
                          index === 0 ? '#ffffff' : 
                          index === 1 ? '#ffffff' : 
                          index === 2 ? '#ffffff' : 
                          '#ffffff'
                        } 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              <WeatherCard 
                temp={weather.temp} 
                humidity={weather.humidity}
                description={weather.description}
                feels_like={weather.feels_like}
                wind_speed={weather.wind_speed}
              />

              {/* Weekly Forecast */}
              {location && (
                <Animated.View style={[styles.forecastContainer, { transform: [{ translateY: slideAnim }] }]}>
                  <WeeklyForecast />
                </Animated.View>
              )}
            </Animated.View>
          </View>
        </ScrollView>

        {/* Manual Location Modal */}
        <Modal visible={manualModalVisible} animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: fadeAnim }] }]}>
              <Text style={styles.modalTitle}>Enter City Name</Text>
              <TextInput
                placeholder="e.g. Tokyo, London, New York"
                placeholderTextColor="#999"
                value={manualCity}
                onChangeText={setManualCity}
                style={styles.modalInput}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      animateButton();
                      setManualModalVisible(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={() => {
                      animateButton();
                      setManualModalVisible(false);
                      getWeatherByCity(manualCity);
                      setManualCity('');
                    }}
                  >
                    <Text style={styles.submitButtonText}>Get Weather</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Bookmarks Modal */}
        <Modal visible={bookmarksModalVisible} animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <Animated.View style={[styles.modalContent, { maxHeight: '70%', transform: [{ scale: fadeAnim }] }]}>
              <Text style={styles.modalTitle}>Bookmarked Locations</Text>
              
              {bookmarkedCities.length > 0 ? (
                <FlatList
                  data={bookmarkedCities}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Animated.View style={[styles.bookmarkItem, { transform: [{ translateY: slideAnim }] }]}>
                      <TouchableOpacity 
                        style={styles.bookmarkTextContainer}
                        onPress={() => {
                          getWeatherByCity(item);
                          setBookmarksModalVisible(false);
                        }}
                      >
                        <MaterialIcons name="location-on" size={18} color="#6A5ACD" />
                        <Text style={styles.bookmarkText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeBookmark(item)}
                      >
                        <MaterialIcons name="delete" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  contentContainerStyle={styles.bookmarkList}
                />
              ) : (
                <Text style={styles.emptyText}>No bookmarks yet</Text>
              )}

              <View style={styles.modalButtons}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.clearButton]}
                    onPress={() => {
                      animateButton();
                      Alert.alert(
                        'Clear All Bookmarks',
                        'Are you sure you want to remove all bookmarks?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Clear All',
                            style: 'destructive',
                            onPress: () => {
                              setBookmarkedCities([]);
                              saveBookmarks([]);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      animateButton();
                      setBookmarksModalVisible(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    marginTop: 16,
    color: '#1e1e1e',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgb(35, 35, 35)',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgb(50,50, 50)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviceButton: {
    marginRight: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.75)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  historyButton: {
    backgroundColor: 'rgba(106, 90, 205, 0.75)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 90, 205, 0.5)',
  },
  weatherContainer: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  iconButtonContainer: {
    borderRadius: 20,
    padding: 5,
    borderWidth: 1,
  },
  iconButton: {
    padding: 10,
  },
  forecastContainer: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#2C3E50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#6A5ACD',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bookmarkTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookmarkText: {
    marginLeft: 12,
    color: '#34495E',
    fontSize: 16,
    fontWeight: '500',
  },
  bookmarkList: {
    paddingBottom: 10,
  },
  removeButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#BDC3C7',
    marginVertical: 25,
    fontSize: 16,
  },
});