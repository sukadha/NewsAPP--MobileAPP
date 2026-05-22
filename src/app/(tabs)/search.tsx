import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchEverything, Article } from '../services/NewsService';

const TRENDING_SEARCHES = [
  'AI Technology', 'Climate Change', 'Stock Market', 'Space Exploration',
  'Electric Vehicles', 'Cryptocurrency', 'Health Research',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const articles = await fetchEverything(q.trim(), 20);
      setResults(articles);
    } catch (e: any) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news, topics, sources..."
            placeholderTextColor="#BBB"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => doSearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#BBB" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch(query)}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!searched ? (
          <View style={styles.suggestSection}>
            <Text style={styles.suggestTitle}>Trending Searches</Text>
            <View style={styles.chips}>
              {TRENDING_SEARCHES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.chip}
                  onPress={() => { setQuery(s); doSearch(s); }}
                >
                  <Ionicons name="trending-up" size={13} color="#1A6BFF" />
                  <Text style={styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1A6BFF" />
            <Text style={styles.centerText}>Searching...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={44} color="#CCC" />
            <Text style={styles.centerText}>{error}</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="search-outline" size={44} color="#CCC" />
            <Text style={styles.centerText}>No results found for "{query}"</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>{results.length} results for "{query}"</Text>
            {results.map((article) => (
              <TouchableOpacity key={article.id} style={styles.resultCard} activeOpacity={0.85}>
                <View style={styles.resultBody}>
                  <Text style={styles.resultCategory}>{article.category}</Text>
                  <Text style={styles.resultTitle} numberOfLines={2}>{article.title}</Text>
                  <View style={styles.resultFooter}>
                    <Text style={styles.resultSource}>{article.source.name}</Text>
                    <Text style={styles.resultTime}>{article.publishedAt}</Text>
                  </View>
                </View>
                {article.urlToImage ? (
                  <Image source={{ uri: article.urlToImage }} style={styles.resultThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.resultThumb, styles.thumbPlaceholder]}>
                    <Ionicons name="newspaper-outline" size={22} color="#CCC" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 18, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8F0',
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A2E' },
  searchBtn: {
    backgroundColor: '#1A6BFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1 },
  suggestSection: { paddingHorizontal: 16, paddingTop: 8 },
  suggestTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#1A6BFF' },
  center: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 40 },
  centerText: { fontSize: 14, color: '#999', textAlign: 'center' },
  resultCount: { fontSize: 13, color: '#999', paddingHorizontal: 16, marginBottom: 10 },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  resultBody: { flex: 1 },
  resultCategory: { fontSize: 10, fontWeight: '700', color: '#1A6BFF', letterSpacing: 0.8, marginBottom: 4 },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', lineHeight: 19, marginBottom: 8 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  resultSource: { fontSize: 11, color: '#888', fontWeight: '600' },
  resultTime: { fontSize: 11, color: '#BBB' },
  resultThumb: { width: 80, height: 80, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: '#F0F0F8', alignItems: 'center', justifyContent: 'center' },
});