import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchWeatherForecast } from '../services/weatherAPI';

type ForecastViewMode = 'horizontal' | 'stack';

const WeeklyForecast = () => {
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ForecastViewMode>('horizontal');

  useEffect(() => {
    const loadForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission required');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const data = await fetchWeatherForecast(latitude, longitude);
        
        if (!data?.list) {
          throw new Error('Invalid forecast data');
        }

        // Get midday forecast for each day
        const dailyData = data.list.filter((item) => {
          const date = new Date(item.dt * 1000);
          return date.getHours() >= 11 && date.getHours() <= 13;
        }).slice(0, 5);

        setForecast(dailyData);
      } catch (error) {
        console.error('Error loading forecast:', error);
        setError('Failed to load forecast. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadForecast();
  }, []);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'horizontal' ? 'stack' : 'horizontal');
  };

  const renderForecastItem = ({ item }: { item: any }) => (
    <View style={[
      styles.forecastItem, 
      viewMode === 'stack' && styles.forecastItemStack
    ]}>
      <Text style={styles.dayText}>
        {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
      </Text>
      <MaterialIcons 
        name={getWeatherIcon(item.weather[0].main)} 
        size={32} 
        color="#4A90E2" 
      />
      <Text style={styles.tempText}>{Math.round(item.main.temp)}°C</Text>
      <Text style={styles.descriptionText}>{item.weather[0].description}</Text>
      <View style={styles.detailRow}>
        <MaterialIcons name="water" size={16} color="#42A5F5" />
        <Text style={styles.detailText}>{item.main.humidity}%</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons name="air" size={16} color="#26C6DA" />
        <Text style={styles.detailText}>{item.wind.speed} m/s</Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={32} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading forecast...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>5-Day Forecast</Text>
        <TouchableOpacity onPress={toggleViewMode}>
          <MaterialIcons 
            name={viewMode === 'horizontal' ? 'view-agenda' : 'view-carousel'} 
            size={24} 
            color="#4A90E2" 
          />
        </TouchableOpacity>
      </View>

      {viewMode === 'horizontal' ? (
        <FlatList
          horizontal
          data={forecast}
          keyExtractor={(item) => item.dt.toString()}
          renderItem={renderForecastItem}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <ScrollView>
          {forecast.map((item) => (
            <View key={item.dt}>
              {renderForecastItem({ item })}
              {forecast.indexOf(item) < forecast.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// Helper function to get weather icons
const getWeatherIcon = (weatherCondition: string) => {
  switch (weatherCondition.toLowerCase()) {
    case 'clear':
      return 'wb-sunny';
    case 'clouds':
      return 'cloud';
    case 'rain':
      return 'grain';
    case 'snow':
      return 'ac-unit';
    case 'thunderstorm':
      return 'flash-on';
    case 'drizzle':
      return 'grain';
    default:
      return 'wb-cloudy';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  horizontalList: {
    paddingHorizontal: 8,
  },
  forecastItem: {
    width: 140,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  forecastItemStack: {
    width: '100%',
    marginHorizontal: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  tempText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7043',
    marginVertical: 4,
  },
  descriptionText: {
    color: '#78909C',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7F8C8D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#7F8C8D',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default WeeklyForecast;