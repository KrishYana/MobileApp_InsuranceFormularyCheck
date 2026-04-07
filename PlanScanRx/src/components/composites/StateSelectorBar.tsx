import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { saveSelectedState, getSelectedState } from '../../services/storage';
import { US_STATES } from '../../constants/states';
import type { USState } from '../../types/auth';
import { NeuSurface, NeuInset, SearchBar } from '../primitives';

export default function StateSelectorBar() {
  const { theme } = useTheme();
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSelectedState().then((state) => {
      if (state) setSelectedState(state);
      else setModalVisible(true);
    });
  }, []);

  const handleSelect = useCallback(async (state: USState) => {
    setSelectedState(state);
    await saveSelectedState(state);
    setModalVisible(false);
    setSearch('');
  }, []);

  const filteredStates = search
    ? US_STATES.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.code.toLowerCase().includes(search.toLowerCase()),
      )
    : US_STATES;

  return (
    <>
      {/* Persistent selector bar — inset into the surface */}
      <NeuInset level="insetSmall" cornerRadius={0}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            gap: Spacing.sm,
            backgroundColor: theme.surface,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            selectedState
              ? `Selected state: ${selectedState.name}. Tap to change.`
              : 'Select your state'
          }>
          <Text style={{ ...Typography.bodyMedium, color: theme.textAccent }}>
            {selectedState ? selectedState.name : 'Select your state'}
          </Text>
          <Text style={{ fontSize: 10, color: theme.textAccent }}>▼</Text>
        </Pressable>
      </NeuInset>

      {/* State picker modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (selectedState) setModalVisible(false);
        }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: Spacing.xxl,
              paddingVertical: Spacing.xl,
            }}>
            <Text style={{ ...Typography.title2, color: theme.textPrimary }}>
              Select Your State
            </Text>
            {selectedState && (
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setSearch('');
                }}>
                <Text style={{ ...Typography.bodyBold, color: theme.textAccent }}>Done</Text>
              </Pressable>
            )}
          </View>

          <View style={{ paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.lg }}>
            <SearchBar
              placeholder="Search states..."
              value={search}
              onChangeText={setSearch}
              onClear={() => setSearch('')}
            />
          </View>

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl }}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selectedState?.code === item.code;
              const row = (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.xl,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                  }}>
                  <Text style={{ ...Typography.body, color: theme.textPrimary }}>
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      ...Typography.label,
                      color: isSelected ? theme.accent : theme.textSecondary,
                    }}>
                    {isSelected ? '✓' : item.code}
                  </Text>
                </Pressable>
              );

              if (isSelected) {
                return <NeuInset level="insetSmall" cornerRadius={Radius.base}>{row}</NeuInset>;
              }
              return <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>{row}</NeuSurface>;
            }}
            ListEmptyComponent={
              <Text
                style={{
                  ...Typography.body,
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginTop: Spacing.huge,
                }}>
                No states matching "{search}"
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
