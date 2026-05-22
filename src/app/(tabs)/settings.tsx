import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const countries = [
  { name: 'India', code: 'in' },
  { name: 'United States', code: 'us' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
];

const languages = [
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Telugu', code: 'te' },
  { name: 'French', code: 'fr' },
  { name: 'Spanish', code: 'es' },
];

const allCategories = [
  'Technology',
  'Business',
  'Sports',
  'Health',
  'Science',
  'Entertainment',
  'Politics',
  'General',
];

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  arrow?: boolean;
  onPress?: () => void;
  darkMode?: boolean;
};

function SettingRow({
  icon,
  iconBg,
  title,
  subtitle,
  toggle,
  value,
  onToggle,
  arrow,
  onPress,
  darkMode,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: darkMode ? '#1F2937' : '#FFF' },
      ]}
      activeOpacity={toggle ? 1 : 0.7}
      onPress={!toggle ? onPress : undefined}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#FFF" />
      </View>

      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowTitle,
            { color: darkMode ? '#FFF' : '#1A1A2E' },
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.rowSub,
              { color: darkMode ? '#A0AEC0' : '#999' },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {toggle && onToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E8', true: '#1A6BFF' }}
          thumbColor="#FFF"
        />
      ) : arrow ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={darkMode ? '#A0AEC0' : '#CCC'}
        />
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedCategories, setSelectedCategories] = useState([
    'Technology',
    'Business',
  ]);

  const [countryModal, setCountryModal] = useState(false);
  const [languageModal, setLanguageModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const theme = {
    bg: darkMode ? '#111827' : '#F3F4F8',
    card: darkMode ? '#1F2937' : '#FFF',
    text: darkMode ? '#FFF' : '#1A1A2E',
    sub: darkMode ? '#A0AEC0' : '#999',
    divider: darkMode ? '#374151' : '#F5F5FA',
    modal: darkMode ? '#1F2937' : '#FFF',
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((c) => c !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const openLink = async (url: string) => {
    await Linking.openURL(url);
  };

  const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=${selectedCountry.code}&language=${selectedLanguage.code}&category=${selectedCategories[0]?.toLowerCase()}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.bg }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Settings
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.card }]}
          onPress={() => setAboutModal(true)}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#1A6BFF" />
          </View>

          <View style={styles.profileText}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              Daily Brief Reader
            </Text>
            <Text style={[styles.profileSub, { color: theme.sub }]}>
              Personalize your news experience
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={darkMode ? '#A0AEC0' : '#CCC'}
          />
        </TouchableOpacity>

        <Text style={styles.groupLabel}>PREFERENCES</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="notifications"
            iconBg="#1A6BFF"
            title="Push Notifications"
            toggle
            value={notifications}
            onToggle={setNotifications}
            darkMode={darkMode}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <SettingRow
            icon="moon"
            iconBg="#5856D6"
            title="Dark Mode"
            toggle
            value={darkMode}
            onToggle={setDarkMode}
            darkMode={darkMode}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <SettingRow
            icon="play-circle"
            iconBg="#34C759"
            title="Auto-play Videos"
            toggle
            value={autoPlay}
            onToggle={setAutoPlay}
            darkMode={darkMode}
          />
        </View>

        <Text style={styles.groupLabel}>NEWS SETTINGS</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="earth"
            iconBg="#FF9500"
            title="Country"
            subtitle={selectedCountry.name}
            arrow
            darkMode={darkMode}
            onPress={() => setCountryModal(true)}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <SettingRow
            icon="language"
            iconBg="#00C7BE"
            title="Language"
            subtitle={selectedLanguage.name}
            arrow
            darkMode={darkMode}
            onPress={() => setLanguageModal(true)}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <SettingRow
            icon="list"
            iconBg="#FF2D55"
            title="Manage Categories"
            subtitle={`${selectedCategories.length} selected`}
            arrow
            darkMode={darkMode}
            onPress={() => setCategoryModal(true)}
          />
        </View>
                <Text style={styles.groupLabel}>ABOUT</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="information-circle"
            iconBg="#1A6BFF"
            title="About Daily Brief"
            arrow
            darkMode={darkMode}
            onPress={() => setAboutModal(true)}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <SettingRow
            icon="shield-checkmark"
            iconBg="#34C759"
            title="Privacy Policy"
            arrow
            darkMode={darkMode}
            onPress={() => openLink('https://newsapi.org/privacy')}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <SettingRow
            icon="document-text"
            iconBg="#FF9500"
            title="Terms of Service"
            arrow
            darkMode={darkMode}
            onPress={() => openLink('https://newsapi.org/terms')}
          />
        </View>

        <View style={styles.version}>
          <Text style={[styles.versionText, { color: theme.sub }]}>
            {/* Daily Brief v1.0.0 */}
          </Text>

          <Text style={[styles.versionSub, { color: theme.sub }]}>
            {/* API Ready */}
          </Text>
        </View>
      </ScrollView>

      {/* COUNTRY MODAL */}
      <Modal visible={countryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Country
            </Text>

            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountryModal(false);
                  }}
                >
                  <Text style={[styles.modalText, { color: theme.text }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal visible={languageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Language
            </Text>

            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedLanguage(item);
                    setLanguageModal(false);
                  }}
                >
                  <Text style={[styles.modalText, { color: theme.text }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* CATEGORY MODAL */}
      <Modal visible={categoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Manage Categories
            </Text>

            <FlatList
              data={allCategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => toggleCategory(item)}
                >
                  <Text style={[styles.modalText, { color: theme.text }]}>
                    {item}
                  </Text>

                  {selectedCategories.includes(item) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#1A6BFF"
                    />
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setCategoryModal(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ABOUT MODAL */}
      <Modal visible={aboutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.aboutBox, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              About Daily Brief
            </Text>

            <Text style={[styles.aboutText, { color: theme.text }]}>
              Daily Brief is a personalized news reader application.
            </Text>

            <Text style={[styles.aboutText, { color: theme.text }]}>
              Country: {selectedCountry.name}
            </Text>

            <Text style={[styles.aboutText, { color: theme.text }]}>
              Language: {selectedLanguage.name}
            </Text>

            <Text style={[styles.aboutText, { color: theme.text }]}>
              Categories: {selectedCategories.join(', ')}
            </Text>

            <Text style={[styles.apiText, { color: theme.sub }]}>
              API URL:
            </Text>

            <Text style={[styles.apiUrl, { color: '#1A6BFF' }]}>
              {newsApiUrl}
            </Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setAboutModal(false)}
            >
              <Text style={styles.doneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 18, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800' },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    elevation: 2,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700' },
  profileSub: { fontSize: 12, marginTop: 2 },

  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAA',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12 },
  divider: { height: 1, marginLeft: 60 },

  version: {
    alignItems: 'center',
    paddingVertical: 24,
  },

  versionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  versionSub: {
    fontSize: 11,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '75%',
  },

  aboutBox: {
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },

  modalItem: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalText: {
    fontSize: 16,
  },

  doneButton: {
    backgroundColor: '#1A6BFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },

  doneText: {
    color: '#FFF',
    fontWeight: '700',
  },

  aboutText: {
    fontSize: 15,
    marginBottom: 10,
  },

  apiText: {
    marginTop: 12,
    fontSize: 13,
  },

  apiUrl: {
    fontSize: 12,
    marginTop: 6,
  },
});