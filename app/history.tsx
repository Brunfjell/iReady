import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { clearWeatherLogs, deleteWeatherLogByIndex, getWeatherLogs } from '../utils/storage';

export default function HistoryScreen() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const stored = await getWeatherLogs();
    console.log('Loaded logs:', stored); 
    const sorted = [...stored].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLogs(sorted);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Logs',
      'Are you sure you want to clear all weather history?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearWeatherLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const handleDelete = async (index: number) => {
    await deleteWeatherLogByIndex(index);
    await loadLogs();
  };

  const renderRightActions = (index: number) => (
    <TouchableOpacity
      onPress={() => handleDelete(index)}
      style={styles.deleteButton}
    >
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: any) => (
    <Swipeable 
      renderRightActions={() => renderRightActions(index)}
      containerStyle={styles.swipeableContainer}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="history" size={20} color="#4A90E2" />
          <Text style={styles.date}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          <Text style={[styles.detailText, { marginLeft: 'auto', color: '#E91E63' }]}>
            {item.city}
          </Text>
        </View>
        
        <View style={styles.weatherDetail}>
          <MaterialIcons name="device-thermostat" size={18} color="#FF7043" />
          <Text style={styles.detailText}>Temp: {item.main?.temp}°C</Text>
        </View>
        
        <View style={styles.weatherDetail}>
          <MaterialIcons name="water" size={18} color="#42A5F5" />
          <Text style={styles.detailText}>Humidity: {item.main?.humidity}%</Text>
        </View>
        
        <View style={styles.weatherDetail}>
          <MaterialIcons name="wb-cloudy" size={18} color="#78909C" />
          <Text style={styles.detailText}>Weather: {item.weather?.[0]?.main}</Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Weather History</Text>
          {logs.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearAll} 
              style={styles.clearButton}
            >
              <MaterialIcons name="delete-sweep" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        {logs.length > 0 ? (
          <FlatList
            data={logs}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>No weather history yet</Text>
            <Text style={styles.emptySubtext}>Your weather logs will appear here</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  swipeableContainer: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  date: {
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#34495E',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 4,
  },
  clearButton: {
    padding: 8,
  },
});