import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  temp: number;
  humidity: number;
  description?: string;
  feels_like?: number;
  wind_speed?: number;
  isDaily?: boolean;
  date?: string;
};

export default function WeatherCard({ 
  temp, 
  humidity, 
  description, 
  feels_like, 
  wind_speed,
  isDaily = false,
  date 
}: Props) {
  return (
    <View style={[styles.card, isDaily && styles.dailyCard]}>
      {date && <Text style={styles.dateText}>{date}</Text>}
      
      <View style={styles.weatherRow}>
        <MaterialIcons name="device-thermostat" size={24} color="#FF7043" />
        <Text style={styles.text}>{Math.round(temp)}°C</Text>
      </View>
      
      <View style={styles.weatherRow}>
        <MaterialIcons name="water" size={24} color="#42A5F5" />
        <Text style={styles.text}>{humidity}% humidity</Text>
      </View>

      {description && (
        <View style={styles.weatherRow}>
          <MaterialIcons name="wb-cloudy" size={24} color="#78909C" />
          <Text style={styles.text} capitalize>{description}</Text>
        </View>
      )}

      {feels_like && (
        <View style={styles.weatherRow}>
          <MaterialIcons name="wb-sunny" size={24} color="#FFA000" />
          <Text style={styles.text}>Feels like {Math.round(feels_like)}°C</Text>
        </View>
      )}

      {wind_speed && (
        <View style={styles.weatherRow}>
          <MaterialIcons name="air" size={24} color="#26C6DA" />
          <Text style={styles.text}>{wind_speed} m/s wind</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyCard: {
    marginHorizontal: 8,
    width: 150,
    alignItems: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  text: {
    fontSize: 16,
    marginLeft: 8,
    color: '#34495E',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
});