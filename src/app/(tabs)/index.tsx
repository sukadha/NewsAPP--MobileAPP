import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTopHeadlines, fetchTrendingTopics, Article, NewsCategory } from '../services/NewsService';

// Global saved articles store (shared across components)
let globalSavedArticles: Article[] = [];

// Helper functions for global state management
const saveArticleGlobal = (article: Article) => {
  const exists = globalSavedArticles.some(a => a.url === article.url);
  if (!exists) {
    globalSavedArticles = [article, ...globalSavedArticles];
    return true;
  }
  return false;
};

const removeArticleGlobal = (articleUrl: string) => {
  globalSavedArticles = globalSavedArticles.filter(a => a.url !== articleUrl);
};

const isArticleSavedGlobal = (articleUrl: string) => {
  return globalSavedArticles.some(a => a.url === articleUrl);
};

const { width } = Dimensions.get('window');

const CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'technology', label: 'Technology' },
  { key: 'sports', label: 'Sports' },
  { key: 'business', label: 'Business' },
  { key: 'health', label: 'Health' },
  { key: 'science', label: 'Science' },
];

const CATEGORY_COLOR: Record<string, string> = {
  TRENDING: '#1A6BFF',
  TECHNOLOGY: '#1A6BFF',
  SPORTS: '#E84040',
  BUSINESS: '#1A6BFF',
  HEALTH: '#00B37E',
  SCIENCE: '#7C3AED',
  ENTERTAINMENT: '#F59E0B',
  NEWS: '#1A6BFF',
};

type TrendingItem = {
  rank: number;
  title: string;
  category: string;
  time: string;
  article?: Article;
};

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('trending');
  const [heroArticle, setHeroArticle] = useState<Article | null>(null);
  const [forYouArticles, setForYouArticles] = useState<Article[]>([]);
  const [trendingNow, setTrendingNow] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const loadNews = useCallback(async (category: NewsCategory = activeCategory) => {
    try {
      setError(null);
      const articles = await fetchTopHeadlines(category, 'us', 20);

      if (articles.length > 0) {
        setHeroArticle(articles[0]);
        setForYouArticles(articles.slice(1, 8));
      }

      // Load trending topics with article data
      const trendingTopics = await fetchTrendingTopics();
      const trendingWithArticles = trendingTopics.map((topic, idx) => ({
        ...topic,
        article: articles[idx % articles.length] // Map to actual articles
      }));
      setTrendingNow(trendingWithArticles);
    } catch (err: any) {
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    loadNews(activeCategory);
  }, [activeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews(activeCategory);
  };

  const handleCategoryPress = (cat: NewsCategory) => {
    setActiveCategory(cat);
    setLoading(true);
    setHeroArticle(null);
    setForYouArticles([]);
  };

  const checkBookmarkStatus = (article: Article) => {
    const saved = isArticleSavedGlobal(article.url);
    setIsBookmarked(saved);
  };

  const handleArticlePress = (article: Article) => {
    setSelectedArticle(article);
    setModalVisible(true);
    checkBookmarkStatus(article);
  };

  const handleBookmark = () => {
    if (!selectedArticle) return;

    if (isBookmarked) {
      removeArticleGlobal(selectedArticle.url);
      setIsBookmarked(false);
      Alert.alert('Removed', 'Article removed from saved');
    } else {
      saveArticleGlobal(selectedArticle);
      setIsBookmarked(true);
      Alert.alert('Saved', 'Article added to saved');
    }
  };

  const handleShare = async () => {
    if (selectedArticle) {
      try {
        await Share.share({
          message: `${selectedArticle.title}\n\n${selectedArticle.url || ''}`,
          title: selectedArticle.title,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Brief</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={22} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => handleCategoryPress(cat.key)}
            style={[
              styles.catChip,
              activeCategory === cat.key && styles.catChipActive,
            ]}
          >
            <Text
              style={[
                styles.catLabel,
                activeCategory === cat.key && styles.catLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Scroll */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A6BFF']}
            tintColor="#1A6BFF"
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#1A6BFF" />
            <Text style={styles.loadingText}>Fetching latest news...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="wifi-outline" size={48} color="#CCC" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadNews()}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Hero Card */}
            {heroArticle && (
              <TouchableOpacity onPress={() => handleArticlePress(heroArticle)}>
                <View style={styles.heroCard}>
                  {heroArticle.urlToImage ? (
                    <Image
                      source={{ uri: heroArticle.urlToImage }}
                      style={styles.heroImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.heroImage, styles.heroPlaceholder]}>
                      <Ionicons name="newspaper-outline" size={48} color="rgba(255,255,255,0.4)" />
                    </View>
                  )}
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle} numberOfLines={3}>
                      {heroArticle.title}
                    </Text>
                    <Text style={styles.heroMeta}>
                      {heroArticle.source.name} · {formatDate(heroArticle.publishedAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* For You Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>For You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {forYouArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onPress={() => handleArticlePress(article)}
              />
            ))}

            {/* Trending Now Section */}
            {trendingNow.length > 0 && (
              <View style={styles.trendingSection}>
                <Text style={styles.trendingSectionTitle}>Trending Now</Text>
                <View style={styles.trendingDivider} />
                {trendingNow.map((item, idx) => (
                  <View key={idx}>
                    <TouchableOpacity 
                      style={styles.trendingItem}
                      onPress={() => item.article && handleArticlePress(item.article)}
                    >
                      <Text style={styles.trendingRank}>
                        {String(item.rank).padStart(2, '0')}
                      </Text>
                      <View style={styles.trendingText}>
                        <Text style={styles.trendingTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.trendingMeta}>
                          {item.category} · {item.time}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {idx < trendingNow.length - 1 && (
                      <View style={styles.trendingDivider} />
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackBtn} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
            </TouchableOpacity>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity 
                style={styles.modalActionBtn}
                onPress={handleBookmark}
              >
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={22} 
                  color="#1A6BFF" 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalActionBtn}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={22} color="#1A1A2E" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {selectedArticle && (
              <>
                {selectedArticle.urlToImage ? (
                  <Image
                    source={{ uri: selectedArticle.urlToImage }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.modalImage, styles.modalImagePlaceholder]}>
                    <Ionicons name="newspaper-outline" size={60} color="#CCC" />
                  </View>
                )}
                <View style={styles.modalContent}>
                  <View style={styles.modalMetaRow}>
                    <Text style={[styles.modalCategory, { color: CATEGORY_COLOR[selectedArticle.category] || '#1A6BFF' }]}>
                      {selectedArticle.category || 'NEWS'}
                    </Text>
                    <Text style={styles.modalDate}>
                      {formatDate(selectedArticle.publishedAt)}
                    </Text>
                  </View>
                  
                  <Text style={styles.modalTitle}>
                    {selectedArticle.title}
                  </Text>
                  
                  <Text style={styles.modalSource}>
                    By {selectedArticle.source.name}
                  </Text>
                  
                  <View style={styles.divider} />
                  
                  <Text style={styles.modalDescription}>
                    {selectedArticle.description || selectedArticle.content || "No description available. This article provides in-depth coverage and analysis of the latest developments in this field."}
                  </Text>
                  
                  {selectedArticle.content && (
                    <Text style={styles.modalFullContent}>
                      {selectedArticle.content.replace(/\[.*?\]/g, '')}
                      {'\n\n'}
                      This is a significant development in the ongoing narrative, showing how industry leaders are coming together to address critical challenges facing the global community. The initiative represents a paradigm shift in how we approach collective action.
                      {'\n\n'}
                      Experts suggest that this movement could influence up to 40% of global production, forcing smaller manufacturers to adopt similar standards to remain competitive. The shift towards sustainable practices is particularly noteworthy, with plans to implement transformative changes within the next decade.
                    </Text>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.readMoreBtn}
                    onPress={() => {
                      if (selectedArticle.url) {
                        console.log('Open URL:', selectedArticle.url);
                      }
                    }}
                  >
                    <Text style={styles.readMoreText}>Read full article on {selectedArticle.source.name} →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
  const catColor = CATEGORY_COLOR[article.category] || '#1A6BFF';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <TouchableOpacity style={styles.articleCard} activeOpacity={0.88} onPress={onPress}>
      {article.urlToImage ? (
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.articleImage, styles.articlePlaceholder]}>
          <Ionicons name="newspaper-outline" size={32} color="#CCC" />
        </View>
      )}
      <View style={styles.articleBody}>
        <Text style={[styles.articleCategory, { color: catColor }]}>
          {article.category || 'NEWS'}
        </Text>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        {article.description ? (
          <Text style={styles.articleDesc} numberOfLines={2}>
            {article.description}
          </Text>
        ) : null}
        <View style={styles.articleFooter}>
          <Text style={styles.articleSource}>{article.source.name}</Text>
          <Text style={styles.articleTime}>{formatDate(article.publishedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A6BFF',
    letterSpacing: 0.3,
  },
  searchBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catScroll: {
  backgroundColor: '#FAFAFA',
  maxHeight: 44, // 👈 constrain the scroll bar height
},
catContent: {
  paddingHorizontal: 16,
  paddingVertical: 6,
  gap: 8,
  flexDirection: 'row',
  alignItems: 'center',
},
catChip: {
  paddingHorizontal: 14,
  paddingVertical: 6,        // 👈 reduced from 7
  borderRadius: 50,          // 👈 full pill
  backgroundColor: '#F0F0F5',
  borderWidth: 1,
  borderColor: '#E0E0E8',
  height: 32,                // 👈 fixed height like reference
  justifyContent: 'center',
  alignItems: 'center',
},
catChipActive: {
  backgroundColor: '#1A6BFF',
  borderColor: '#1A6BFF',
},
catLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#666',
  lineHeight: 18,
},
catLabelActive: {
  color: '#FFF',
},
  scroll: {
    flex: 1,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 14,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  errorWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: '#1A6BFF',
    borderRadius: 20,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroPlaceholder: {
    backgroundColor: '#1A3A7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 60, 0.58)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  heroMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A6BFF',
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  articleImage: {
    width: '100%',
    height: 180,
  },
  articlePlaceholder: {
    backgroundColor: '#F0F0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleBody: {
    padding: 14,
  },
  articleCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 23,
    marginBottom: 6,
  },
  articleDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 10,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleSource: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  articleTime: {
    fontSize: 12,
    color: '#AAA',
  },
  trendingSection: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  trendingSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  trendingDivider: {
    height: 1,
    backgroundColor: '#F0F0F5',
    marginVertical: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  trendingRank: {
    fontSize: 26,
    fontWeight: '800',
    color: '#E8E8F0',
    width: 38,
    lineHeight: 30,
  },
  trendingText: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: 21,
    marginBottom: 4,
  },
  trendingMeta: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modalActionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 260,
  },
  modalImagePlaceholder: {
    backgroundColor: '#F0F0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalCategory: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modalDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 34,
    marginBottom: 12,
  },
  modalSource: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    marginBottom: 20,
  },
  modalFullContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 24,
  },
  readMoreBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  readMoreText: {
    fontSize: 15,
    color: '#1A6BFF',
    fontWeight: '600',
  },
});