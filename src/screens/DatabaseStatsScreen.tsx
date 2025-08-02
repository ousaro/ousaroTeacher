import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import DatabaseOptimizer from '../utils/databaseOptimizer';
import PerformanceMonitor from '../utils/performanceMonitor';

interface Props {
  navigation: any;
}

export default function DatabaseStatsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  const loadStats = async () => {
    try {
      const optimizationStats = await DatabaseOptimizer.getOptimizationStats();
      const perfStats = PerformanceMonitor.getStats();
      
      setStats(optimizationStats);
      setPerformanceStats(perfStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleOptimizeDatabase = async () => {
    Alert.alert(
      'Optimize Database',
      'This will optimize the database for better performance. It may take a few seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Optimize',
          onPress: async () => {
            setIsOptimizing(true);
            try {
              const success = await DatabaseOptimizer.forceOptimize();
              if (success) {
                Alert.alert('Success', 'Database optimized successfully!');
                await loadStats();
              } else {
                Alert.alert('Error', 'Failed to optimize database.');
              }
            } catch (error) {
              console.error('Optimization error:', error);
              Alert.alert('Error', 'An error occurred during optimization.');
            } finally {
              setIsOptimizing(false);
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Database Stats
          </Text>
        </View>
        <TouchableOpacity
          onPress={loadStats}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Database Statistics */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Database Statistics
          </Text>
          
          {stats ? (
            <>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Total Words:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.databaseStats.wordCount.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Database Size:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatBytes(stats.databaseStats.dbSize)}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Indexes:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.databaseStats.indexCount}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Last Optimized:
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatDate(stats.lastOptimized)}
                </Text>
              </View>
              
              {stats.nextOptimization && (
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Next Optimization:
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatDate(stats.nextOptimization)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading statistics...
            </Text>
          )}
        </View>

        {/* Performance Statistics */}
        {performanceStats && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Performance Statistics
            </Text>
            
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Operations:
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {performanceStats.totalOperations}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Average Duration:
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {performanceStats.averageDuration?.toFixed(2) || 0}ms
              </Text>
            </View>
            
            {Object.entries(performanceStats.operationStats || {}).map(([operation, stat]: [string, any]) => (
              <View key={operation} style={styles.operationStat}>
                <Text style={[styles.operationName, { color: theme.colors.text }]}>
                  {operation}:
                </Text>
                <Text style={[styles.operationValue, { color: theme.colors.textSecondary }]}>
                  {stat.count} calls, avg {stat.averageDuration?.toFixed(2)}ms
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions
          </Text>
          
          <TouchableOpacity
            onPress={handleOptimizeDatabase}
            disabled={isOptimizing}
            style={[
              styles.actionButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: isOptimizing ? 0.6 : 1 
              }
            ]}
          >
            <Ionicons 
              name="flash" 
              size={20} 
              color="white" 
              style={styles.actionIcon} 
            />
            <Text style={styles.actionButtonText}>
              {isOptimizing ? 'Optimizing...' : 'Optimize Database'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  operationStat: {
    paddingVertical: 4,
    paddingLeft: 16,
  },
  operationName: {
    fontSize: 13,
    fontWeight: '500',
  },
  operationValue: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
