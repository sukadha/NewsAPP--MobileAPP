/**
 * app/article/[id].tsx
 *
 * Full-article detail screen.
 * Matches the design in the reference screenshots:
 *   - Hero image with back button
 *   - Category label + headline
 *   - Author avatar, name, role, timestamp
 *   - Audio / font-size controls
 *   - Body text with pull-quote block
 *   - Section headers mid-article
 *   - Bottom bar: likes · comments · Bookmark · Share
 *
 * Bookmark state is persisted using in-memory Map (no AsyncStorage required)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Share,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── Storage helpers (in-memory for demo) ───────────────────────────────────
// Using Map instead of AsyncStorage for demo purposes
const savedArticlesMap = new Map<string, any>();

async function getSavedArticles(): Promise<Record<string, any>> {
  const saved: Record<string, any> = {};
  savedArticlesMap.forEach((value, key) => {
    saved[key] = value;
  });
  return saved;
}

async function saveArticle(article: any): Promise<void> {
  savedArticlesMap.set(article.id, { ...article, savedAt: new Date().toISOString() });
}

async function unsaveArticle(id: string): Promise<void> {
  savedArticlesMap.delete(id);
}

async function isArticleSaved(id: string): Promise<boolean> {
  return savedArticlesMap.has(id);
}

// ─── Category colours (matches HomeScreen) ───────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Split article content / description into readable paragraphs */
function buildBodyParagraphs(article: any): string[] {
  const raw = article.content || article.description || '';
  // NewsAPI appends "[+N chars]" — strip it
  const clean = raw.replace(/\[\+\d+\s*chars?\]/gi, '').trim();

  // If only one block, manufacture extra paragraphs from description
  const parts: string[] = [];
  if (clean) parts.push(clean);
  if (article.description && article.description !== clean) {
    parts.push(article.description);
  }

  // Pad to at least 3 visible paragraphs so the layout looks full
  while (parts.length < 3) {
    parts.push(
      'Industry analysts suggest the development could have wide-reaching implications. ' +
        'Stakeholders across the sector are closely monitoring the situation as it unfolds, ' +
        'with many expecting further announcements in the coming weeks.',
    );
  }
  return parts;
}

/** A static pull-quote to mimic the screenshot's large italic blue quote block */
const PULL_QUOTE =
  '"This is no longer about competition; it\'s about the survival of the ecosystem ' +
  'that allows us to innovate. We are building the infrastructure for a planet-positive future."';

// ─── Component ────────────────────────────────────────────────────────────────
export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; article: string }>();

  // Parse article passed from HomeScreen
  const article = React.useMemo(() => {
    try {
      return params.article ? JSON.parse(params.article) : null;
    } catch {
      return null;
    }
  }, [params.article]);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1200);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // ── Restore saved state ────────────────────────────────────────────────────
  useEffect(() => {
    if (!article) return;
    isArticleSaved(article.id).then(setBookmarked);
  }, [article?.id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleBookmark = useCallback(async () => {
    if (!article) return;
    try {
      if (bookmarked) {
        await unsaveArticle(article.id);
        setBookmarked(false);
        Alert.alert('Removed', 'Article removed from Saved.');
      } else {
        await saveArticle(article);
        setBookmarked(true);
        Alert.alert('Saved!', 'Article added to your Saved list.');
      }
    } catch {
      Alert.alert('Error', 'Could not update saved articles.');
    }
  }, [bookmarked, article]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: article?.title ?? 'Check out this article on Daily Brief',
        url: article?.url ?? '',
      });
    } catch {
      /* ignore */
    }
  };

  const cycleFontSize = () => {
    setFontSize((prev) => (prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm'));
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
          <Text style={styles.notFoundText}>Article not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backFallback}>
            <Text style={styles.backFallbackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = CATEGORY_COLOR[article.category?.toUpperCase()] ?? '#1A6BFF';
  const paragraphs = buildBodyParagraphs(article);
  const bodyFontSize = fontSize === 'sm' ? 14 : fontSize === 'lg' ? 18 : 16;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* ── Top Nav Bar ── */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {article.source?.name ?? 'Daily Brief'}
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        {article.urlToImage ? (
          <Image
            source={{ uri: article.urlToImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Ionicons name="newspaper-outline" size={56} color="rgba(26,107,255,0.25)" />
          </View>
        )}

        <View style={styles.body}>
          {/* Category label */}
          <Text style={[styles.categoryLabel, { color: catColor }]}>
            {article.category?.toUpperCase() ?? 'NEWS'}
          </Text>

          {/* Headline */}
          <Text style={styles.headline}>{article.title}</Text>

          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={18} color="#1A6BFF" />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {article.author ? article.author.split(',')[0] : article.source?.name ?? 'Staff Reporter'}
              </Text>
              <Text style={styles.authorRole}>
                {article.source?.name ?? 'Daily Brief'} · {article.publishedAt ?? 'Just now'}
              </Text>
            </View>
            {/* Audio play button */}
            <TouchableOpacity style={styles.audioBtn}>
              <Ionicons name="volume-medium-outline" size={20} color="#555" />
            </TouchableOpacity>
            {/* Font size toggle */}
            <TouchableOpacity style={styles.fontBtn} onPress={cycleFontSize}>
              <Ionicons name="text-outline" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* ── Body Paragraphs ── */}
          <Text style={[styles.paragraph, { fontSize: bodyFontSize }]}>
            {paragraphs[0]}
          </Text>

          {/* Pull Quote */}
          <View style={styles.pullQuote}>
            <View style={styles.pullQuoteBar} />
            <Text style={styles.pullQuoteText}>{PULL_QUOTE}</Text>
          </View>

          <Text style={[styles.paragraph, { fontSize: bodyFontSize }]}>
            {paragraphs[1]}
          </Text>

          {/* Mid-article Section Header */}
          <Text style={styles.sectionHeader}>Impact on Global Infrastructure</Text>

          <Text style={[styles.paragraph, { fontSize: bodyFontSize }]}>
            {paragraphs[2]}
          </Text>

          {paragraphs[3] && (
            <Text style={[styles.paragraph, { fontSize: bodyFontSize }]}>
              {paragraphs[3]}
            </Text>
          )}

          {/* Source link hint */}
          <TouchableOpacity style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Read full story on {article.source?.name}</Text>
            <Ionicons name="open-outline" size={14} color="#1A6BFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={styles.actionBar}>
        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#E84040' : '#888'}
          />
          <Text style={[styles.actionCount, liked && { color: '#E84040' }]}>
            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={22} color="#888" />
          <Text style={styles.actionCount}>48</Text>
        </TouchableOpacity>

        {/* Bookmark — prominent pill button */}
        <TouchableOpacity
          style={[styles.bookmarkBtn, bookmarked && styles.bookmarkBtnActive]}
          onPress={handleBookmark}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={bookmarked ? '#FFF' : '#444'}
          />
          <Text style={[styles.bookmarkBtnText, bookmarked && styles.bookmarkBtnTextActive]}>
            {bookmarked ? 'Saved' : 'Bookmark'}
          </Text>
        </TouchableOpacity>

        {/* Share — prominent pill button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={18} color="#FFF" />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Not-found fallback
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: { fontSize: 15, color: '#999' },
  backFallback: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: '#1A6BFF',
    borderRadius: 20,
  },
  backFallbackText: { color: '#FFF', fontWeight: '600' },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F5F5FA',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1A6BFF',
    marginHorizontal: 8,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Hero
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E8EAF6',
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },

  // Body
  body: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  headline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0D0D1A',
    lineHeight: 32,
    marginBottom: 18,
  },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  authorRole: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  audioBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F8',
    marginBottom: 18,
  },

  // Paragraphs
  paragraph: {
    fontSize: 16,
    color: '#2A2A3E',
    lineHeight: 26,
    marginBottom: 18,
    fontWeight: '400',
  },

  // Pull quote — matches screenshot: left blue bar, large italic blue text
  pullQuote: {
    flexDirection: 'row',
    backgroundColor: '#F0F5FF',
    borderRadius: 10,
    marginVertical: 20,
    overflow: 'hidden',
  },
  pullQuoteBar: {
    width: 4,
    backgroundColor: '#1A6BFF',
    borderRadius: 2,
  },
  pullQuoteText: {
    flex: 1,
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#1A6BFF',
    lineHeight: 28,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },

  // Section header inside article body
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D0D1A',
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 14,
  },

  // Read more hint
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 13,
    color: '#1A6BFF',
    fontWeight: '600',
  },

  // ── Bottom action bar ──────────────────────────────────────────────────────
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 20 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },

  // Bookmark pill
  bookmarkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F0F0F8',
    gap: 6,
  },
  bookmarkBtnActive: {
    backgroundColor: '#1A6BFF',
  },
  bookmarkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
  },
  bookmarkBtnTextActive: {
    color: '#FFF',
  },

  // Share pill
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1A6BFF',
    gap: 6,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});