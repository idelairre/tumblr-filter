import constants from '../constants';
import receiverHandler from '../services/receiverService';
import BlogStore from '../stores/blogStore';
import BlogSource from '../source/blogSource';
import PostSource from '../source/postSource';
import Tags from '../stores/tagStore';
import Likes from '../stores/likeStore';
import Following from '../stores/followingStore';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
  constants.set('previousVersion');
});

const setConstants = payload => {
  if (typeof payload !== 'undefined') {
    constants.set(payload);
  }
};

const sendConstants = () => {
  return constants.toJSON();
};

const chromeReciever = receiverHandler({
  cacheBlogPosts: BlogStore.cache,
  fetchCachedBlogPosts: BlogStore.fetch,
  fetchConstants: sendConstants,
  fetchDashboardPosts: PostSource.fetchDashboardPosts,
  fetchFollowing: Following.fetch,
  fetchBlogPosts: BlogSource.fetchBlogPosts,
  fetchDashboardPostsByTag: PostSource.fetchDashboardPostsByTag,
  fetchLikedTags: Tags.fetchLikedTags,
  fetchNsfwBlogs: Following.fetchNsfwBlogs,
  fetchTagsByUser: Tags.fetchTagsByUser,
  initializeConstants: setConstants,
  refreshFollowing: Following.refresh,
  searchLikesByTag: Likes.fetch,
  searchLikesByTerm: Likes.searchLikesByTerm,
  setFilter: Likes.setFilter,
  syncLike: Likes.syncLike,
  updateCache: BlogStore.update,
  updateLikes: Likes.updateLikes,
  validateCache: BlogStore.validateCache
});

export default chromeReciever;
