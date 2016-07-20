import { oauthRequest } from '../lib/oauthRequest';
import { ajax, Deferred } from 'jquery';
import { isArray, omit } from 'lodash';
import BlogSource from './blogSource';
import db from '../lib/db';
import sendMessage from '../services/messageService';
import 'babel-polyfill';

export default class PostSource {
  static async applyNsfwFilter(posts) {
    if (typeof posts === 'undefined' || !isArray(posts)) {
      throw new Error('posts are undefined or not an array');
    }
    return posts.filter(async post => {
      const following = await db.following.get(post.blog_name);
      if (following && following.hasOwnProperty('content_rating')) {
        return;
      }
      return post
    });
  }

  static async fetchDashboardPosts(request) {
    const slug = {
      offset: request.next_offset || 0,
      limit: request.limit,
      url: 'https://api.tumblr.com/v2/user/dashboard'
    };
    if (typeof request.post_type !== 'undefined') {
      slug.type = request.post_type.toLowerCase();
    }
    try {
      const response = await oauthRequest(slug);
      console.log('[FETCH]', response);
      if (request.filter_nsfw && response.hasOwnProperty('posts')) {
        return await PostSource.applyNsfwFilter(response.posts);
      }
      return response.posts;
    } catch (e) {
      console.error(e);
    }
  }

  static async fetchDashboardPostsByTag(query) {
    const deferred = Deferred();
    try {
      const response = [];
      const following = await db.following.orderBy('updated').reverse().toArray();
      const promises = following.map(async follower => {
        const slug = {
          blogname: follower.uuid,
          tag: query.term,
          limit: 1
        };
        if (query.post_type !== 'ANY') {
          slug.type = query.post_type.toLowerCase();
        }
        const posts = await BlogSource.blogRequest(slug);
        if (typeof posts[0] !== 'undefined') {
          response.push(posts[0]);
          sendMessage({
            type: 'postFound',
            payload: posts[0]
          });
        }
      });
      Promise.all(promises);
      deferred.resolve(response);
    } catch (e) {
      console.error(e);
      deferred.reject(e);
    }
    return deferred.promise();
  }
}
