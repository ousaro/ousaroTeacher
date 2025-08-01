// Optimized character item component for better mobile performance

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { AlphabetLetter, NumberItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CharacterItemProps {
  item: AlphabetLetter | NumberItem;
  index: number;
  itemWidth: number;
  onPress: (item: AlphabetLetter | NumberItem) => void;
  shouldAnimate?: boolean;
}

const CharacterItem = memo<CharacterItemProps>(({ 
  item, 
  index, 
  itemWidth, 
  onPress, 
  shouldAnimate = false 
}) => {
  const { theme } = useTheme();

  // Type guards
  const isAlphabetLetter = (item: AlphabetLetter | NumberItem): item is AlphabetLetter => {
    return 'character' in item;
  };

  const isNumberItem = (item: AlphabetLetter | NumberItem): item is NumberItem => {
    return 'number' in item;
  };

  const handlePress = () => {
    onPress(item);
  };

  const containerStyle = [
    styles.letterContainer, 
    { width: itemWidth }
  ];

  const cardStyle = [
    styles.letterCard,
    { backgroundColor: theme?.colors?.surface || '#fff' }
  ];

  const content = (
    <TouchableOpacity
      onPress={handlePress}
      style={cardStyle}
      activeOpacity={0.85}
    >
      {isAlphabetLetter(item) ? (
        <>
          <Text style={[styles.letterText, { color: theme?.colors?.text || '#000' }]}>
            {item.character}
          </Text>
          <Text style={[styles.letterName, { color: theme?.colors?.textSecondary || '#666' }]}>
            {item.name}
          </Text>
        </>
      ) : isNumberItem(item) ? (
        <>
          <Text style={[styles.kanjiText, { color: theme?.colors?.text || '#000' }]}>
            {item.text}
          </Text>
          <Text style={[styles.numberText, { color: theme?.colors?.textSecondary || '#666' }]}>
            {item.number}
          </Text>
          <Text style={[styles.pronunciationText, { color: theme?.colors?.textSecondary || '#666' }]}>
            {item.pronunciation}
          </Text>
        </>
      ) : null}
    </TouchableOpacity>
  );

  // Only animate first 20 items for performance
  if (shouldAnimate && index < 20) {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 15}
        style={containerStyle}
      >
        {content}
      </Animatable.View>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.itemWidth === nextProps.itemWidth &&
    prevProps.shouldAnimate === nextProps.shouldAnimate
  );
});

CharacterItem.displayName = 'CharacterItem';

const styles = StyleSheet.create({
  letterContainer: {
    marginBottom: 8,
  },
  letterCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    position: "relative",
  },
  letterText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  letterName: {
    fontSize: 10,
    fontWeight: "500",
  },
  kanjiText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 1,
  },
  numberText: {
    fontSize: 8,
    fontWeight: "600",
    marginBottom: 1,
  },
  pronunciationText: {
    fontSize: 8,
    fontWeight: "500",
  },
});

export default CharacterItem;
