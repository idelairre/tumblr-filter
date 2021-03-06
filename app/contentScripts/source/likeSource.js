import $ from 'jquery';
import { has, omit, pick } from 'lodash';
import ChromeMixin from '../components/mixins/chromeMixin';
import Source from './source';

const LikeSource = Source.extend({
  mixins: [ChromeMixin],
  fetch(slug) { // NOTE: this is slightly confusing, fetch is more like a helper method and search is more like fetch
    if (typeof slug.term === 'undefined' || (has(slug, 'term') && slug.term.length === 0)) {
      return this.filter(slug);
    }
    
    return this.filterByTerm(slug);
  },
  filter(slug) {
    const deferred = $.Deferred();
    this.chromeTrigger('chrome:search:likesByTag', slug, deferred.resolve);
    return deferred.promise();
  },
  filterByTerm(slug) {
    const deferred = $.Deferred();
    this.chromeTrigger('chrome:search:likesByTerm', slug, deferred.resolve);
    return deferred.promise();
  },
  search(query) {
    const deferred = $.Deferred();
    query = pick(query, 'blogname', 'before', 'filter_nsfw', 'limit', 'next_offset', 'post_role', 'post_type', 'sort', 'term');

    if (query.blogname === Tumblr.Prima.currentUser().id) {
      query = omit(query, 'blogname');
    }

    this.fetch(query).then(deferred.resolve);
    return deferred.promise();
  },
  clientFetch(page) {
    const deferred = $.Deferred();

    $.ajax({
      method: 'GET',
      dataType: 'html',
      url: `https://www.tumblr.com/likes/page/${page}`,
      success: response => {
        const posts = Array.from($(response).find('.post'));
        deferred.resolve(posts);
      },
      error: error => {
        deferred.reject(error);
      }
    });
    return deferred.promise();
  }
});

module.exports = new LikeSource();
