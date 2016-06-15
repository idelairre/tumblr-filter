module.exports = (function postView(Tumblr, Backbone, _) {
  const { $ } = Backbone;
  const { template } = _;
  const { state, Utils } = Tumblr.Fox;
  const { TemplateCache } = Utils;
  const { PostView } = Tumblr;
  const { currentUser } = Tumblr.Prima;

  /**
  * PostView viewModel
  * @namespace Tumblr.Fox.PostView
  * @property accepts-answers: {Boolean}
  * @property can_reply: {Boolean}
  * @property direct-video: {Boolean}
  * @property id: {Number}
  * @property is-animated: {Boolean}
  * @property is-pinned: {Boolean}
  * @property is-mine: {Boolean}
  * @property is_reblog: {Boolean}
  * @property is-recommended: {Boolean}
  * @property liked: {Boolean}
  * @property log-index: {String}
  * @property placement_id: {Number}
  * @property post-id: {Number}
  * @property premium-tracked: {Number}
  * @property pt: {String}
  * @property reblog-key: {String}
  * @property reblog_key: {String}
  * @property reblog_source: {String}
  * @property recommendation_reason: {String}
  * @property root_id: {String}
  * @property share_popover_data: {Object}
  * @property sponsered: {String}
  * @property tumblelog: {String}
  * @property tumblelog-data: {Object}
  * @property tumblelog-key: {String}
  * @property tumblelog-name: {String}
  * @property tumblelog-parent-data: {Object}
  * @property tumblelog-root-data: {Object}
  * @property type: {String}
  */

  const tagTemplate = template(`<a class="post_tag" data-tag="<%= tag %>" href="<%= Tumblr.Utils.PostTags.tag_url(tag) %>">#<%= tag %></a>`);

  const FoxPostView = PostView.extend({
    tagName: 'li',
    className: 'post_container',
    template: template(TemplateCache.get('postViewTemplate')),
    initialize(options) { // TODO: note count should be comma seperated
      if (options.model && options.model.get('html')) {
        this.$el.html(options.model.get('html'));
        this.model = options.model;
        Tumblr.Fox.constants.attachNode.before(this.$el);
        this.$el.attr('data-pageable', `post_${this.model.get('id')}`);
      } else if (options.model && options.model.get('is-tumblrfox-post')) {
        this.model = options.model;
        this.render();
      }
      this._parseTags();
      PostView.prototype.initialize.apply(this);
      Tumblr.postsView.postViews.push(this);
      if (this.model.get('liked')) { // its probably coming from the backend
        setTimeout(() => {
          this._initializeSelectors();
          this.sync();
        }, 0);
      }
      Tumblr.Events.trigger('postsView:createPost', this);
      Tumblr.Events.trigger('DOMEventor:updateRect');
      this.model.collection = Tumblr.postsView.collection;
      this.model.collection.add(this.model);
    },
    render() {
      this.$el.html(this.template({
        model: this.model
      }));
      Tumblr.Fox.constants.attachNode.before(this.$el);
      this.$el.attr('data-pageable', `post_${this.model.get('id')}`);
      this._initializeSelectors();
      this.setAttributes();
      return this;
    },
    setAttributes() {
      this.$post = this.$post || this.$el.find('.post');
      currentUser().get('name') === this.model.get('tumblelog') ? this.$post.addClass('is_mine') : this.$post.addClass('not_mine');
      this.model.get('tumblelog-parent-data') ? this.$post.addClass('is_reblog') : this.$post.addClass('is_original');
      this.model.get('source_title') ? this.$post.addClass('has_source') : this.$post.addClass('no_source');
      // this.model.get('post_html').includes('View On') ? this.$post.addClass('app_source') : this.$post.addClass('generic_source');
      this.model.get('notes.count') === 0 ? this.post.addClass('no_notes') : null;
    },
    _initializeSelectors() {
      if (this.$el.find('.reblog-list').length) {
        this.$reblog_list = this.$el.find('.reblog-list');
      }
      this.$avatar = this.$el.find('.post_avatar_link');
      this.$content = this.$el.find('.post_content_inner');
      this.$followButton = this.$el.find('.follow_link');
      this.$notes = this.$el.find('.note_link_current');
      this.$tags = this.$el.find('.post_tags_inner');
      this.$post = this.$el.find('.post');
    },
    _post_action_follow(action, el) {
      $(el).fadeOut(300);
      PostView.prototype._post_action_follow.apply(this, arguments);
    },
    _parseTags() {
      if (!this.model.get('tags')) {
        Utils.PostFormatter.parseTags(this);
      }
      if (state.get('dashboard')) {
        Tumblr.Events.trigger('fox:updateTags', this.model.get('tags'));
      }
    },
    sync(update) {
      const deferred = $.Deferred();
      const slug = {
        tumblelog_name_or_id: this.model.get('tumblelog'),
        post_id: this.model.get('id'),
        limit: 1,
        offset: 0
      };
      $.ajax({
        url: 'https://www.tumblr.com/svc/indash_blog/posts',
        beforeSend: xhr => {
          xhr.setRequestHeader('x-tumblr-form-key', Tumblr.Fox.constants.formKey);
        },
        data: slug,
        success: data => {
          if (typeof update === 'undefined' || update === true) {
            this._updateAttributes(data.response.posts[0], data.response.tumblelog);
          }
          deferred.resolve(data);
        },
        fail: error => {
          deferred.reject(error);
        }
      });
      return deferred.promise();
    },
    _updateAttributes(model, tumblelog) {
      if (this.$followButton && this.$followButton.length > 0 && model.followed) {
        this.$followButton.hide();
      }
      this.model.set('tumblelog-data', tumblelog);
      this.model.set('tags', model.tags);
      const peeprData = JSON.stringify({
        tumblelog: this.model.get('tumblelog')
      });
      this.$avatar.attr('data-peepr', peeprData);
      const links = this.$el.find('.post_info_link');
      $.each(links, (i, el) => {
        const link = $(el);
        link.attr('data-peepr', JSON.stringify({
          tumblelog: link.text()
        }));
      });
      this.$notes.data('count', model.notes.count);
      this.$notes.attr('title', model.notes.current);
      this.$notes.data('less', model.notes.less);
      this.$notes.data('more', model.notes.more);
      this.$notes.text(model.notes.current);
      let tagElems = '';
      model.tags.map(tag => {
        const tagEl = tagTemplate({ tag });
        tagElems += tagEl;
      });
      this.$tags.html(tagElems);
    }
  });

  Tumblr.Fox.register('PostViewComponent', FoxPostView);
  Tumblr.PostView = FoxPostView;
});