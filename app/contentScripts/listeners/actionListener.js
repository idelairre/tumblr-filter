import AppState from '../application/state';
import Listener from './listener';
import BlogSource from '../source/blogSource';
import ChromeMixin from '../components/mixins/chromeMixin';
import Events from '../application/events';

const ActionListener = Listener.extend({ // TODO: make this component watch for added and deleted following
  mixins: [ChromeMixin],
  initialize() {
    this.enabled = false;
    this.listenTo(Tumblr.Events, 'post:like:set', this.sendLike.bind(this, 'like'));
    this.listenTo(Tumblr.Events, 'post:unlike:set', this.sendLike.bind(this, 'unlike'));
    this.listenTo(Tumblr.Events, 'post:reblog:set', BlogSource.updateBlogCache);
    this.listenTo(Tumblr.Events, 'post:form:success', BlogSource.updateBlogCache);
    this.listenToOnce(AppState, 'change:state', () => {
      if (AppState.get('likes')) {
        this.listenTo(Events, 'fox:postsView:createPost', ::this.syncLike);
        this.enabled = true;
      }
    });
  },
  sendLike(type, postId) {
    const slug = {
      postId,
      type
    };
    this.chromeTrigger('chrome:update:likes', slug);
  },
  syncLike(postData) {
    if (!postData.model['is-tumblrfox-post']) {
      const post = postData.model;
      post.html = postData.el;
      post.blog_name = post.tumblelog;
      post['is-tumblrfox-post'] = true;
      this.chromeTrigger('chrome:sync:like', post);
    }
  }
});

module.exports = new ActionListener();
