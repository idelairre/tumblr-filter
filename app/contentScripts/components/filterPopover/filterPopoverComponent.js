module.exports = (function filterPopoverComponent(Tumblr, Backbone, _) {
  const $ = Backbone.$;
  const { assign } = _;
  const { get, FilterMenuComponent, SearchComponent } = Tumblr.Fox;
  const transition = get('animation').transition;
  const popover = get('PopoverMixin');
  const PopoverComponent = get('PopoverComponent');
  const ClickHandler = get('ClickHandler');
  const { Tumblelog } = Tumblr.Prima.Models;
  const { currentUser } = Tumblr.Prima;

  // NOTE: teardown is not consistently resetting the original peepr-search component

  const filterPopoverTemplate = `
    <script id="filterPopoverTemplate" type="text/template">
      <div id="filterPopoverMenu" class="popover popover_menu popover_gradient" style="display: block; width: 240px; margin-top: -4px;">
        <div class="popover_inner">
          <ul class="popover_inner_list">
            <div class="filter-menu" data-subview="filterMenu"></div>
            <div data-subview="searchFilter"></div>
          </ul>
        </div>
      </div>
    </script>`;

  const FilterPopoverComponent = PopoverComponent.extend({
    className: 'popover--filter-popover',
    defaults: {
      preventInteraction: true,
      state: {
        likes: false,
        dashboard: false,
        user: true
      }
    },
    mixins: [popover],
    template: $(filterPopoverTemplate).html(),
    subviews: {
      filterMenu: {
        constructor: FilterMenuComponent
      },
      searchFilter: {
        constructor: SearchComponent,
        options: {
          blogname: currentUser().id,
          blog: Tumblelog.collection.models[0]
        }
      }
    },
    initialize(e) {
      this.options = assign({}, this.defaults, e);
      this.state = Tumblr.Fox.state;
      this.listenTo(Tumblr.Events, 'fox:setSearchState', ::this.state.setState);
      this.listenTo(Tumblr.Events, 'fox:apiFetch:initial', ::this.hide);
    },
    render() {
      this.$el.html(this.template);
      this.$pinned.addClass('active');
      this.$filterPopoverMenu = this.$('.popover_menu');
      this.$searchBar = this.$('.filter-search');
      setTimeout(() => {
        this.$filterPopoverMenu.addClass('popover--active');
        this.bindClickOutside();
      }, 1);
    },
    afterRenderSubviews() {
      setTimeout(() => {
        this.state.setState('user');
      }, 1);
    },
    bindClickOutside() {
      const options = {
        preventInteraction: true,
        ignoreSelectors: ['.popover', '.popover_inner', '.popover_content_wrapper', '.popover_inner_list', '.popover_menu_list', '.tumblelog_popover', '.ui_peepr_glass', '.drawer']
      };
      this.clickOutside = new ClickHandler(this.el, options);
      this.clickOutside.on('click:outside', this.hide, this);
      this.listenTo(Tumblr.Events, 'DOMEventor:keyup:escape', this.hide);
    },
    beforeTeardown() {
      this.remove();
      this.$pinned.removeClass('active');
    },
    unbindClickOutside() {
      this.clickOutside.remove();
      this.clickOutside = null;
      this.stopListening(Tumblr.Events, 'DOMEventor:keyup:escape');
    },
    hide() {
      Tumblr.Events.trigger('popover:close', this);
      this.unbindClickOutside();
      this.searchFilter.unbindEvents();
      this.$pinned.removeClass('active');
      this.$filterPopoverMenu.removeClass('popover--active');
      transition(this.$el, ::this.afterHide);
    },
    afterHide() {
      this.$el.css({ display: 'none' });
    },
    show() {
      Tumblr.Events.trigger('popover:open', this);
      this.bindClickOutside();
      this.$pinned.addClass('active');
      this.$el.css({ display: 'block' });
      setTimeout(() => {
        this.$filterPopoverMenu.addClass('popover--active');
      }, 1);
    }
  });

  Tumblr.Fox.FilterPopoverComponent = FilterPopoverComponent;
});