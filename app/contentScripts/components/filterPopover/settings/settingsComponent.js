module.exports = (function settings(Tumblr, Backbone, _) {
  const $ = Backbone.$;
  const { assign, clone, defer } = _;
  const { get, Popover } = Tumblr.Fox;
  const PopoverComponent = get('PopoverComponent');

  const settingsPopoverTemplate = `
    <script id="settingsPopoverTemplate" type="text/template">
      <i class="icon_search toggle-search nav_icon"></i>
    </script>`;

  const Settings = PopoverComponent.extend({
    className: 'search-settings',
    defaults: {
      popoverOptions: [{
        multipleSelection: false,
        name: 'searchTarget',
        listItems: [
          { icon: 'none', name: 'Search likes', data: 'likes', checked: false },
          { icon: 'none', name: 'Search by user', data: 'user', checked: true },
          { icon: 'none', name: 'Search dashboard', data: 'dashboard', checked: false, hidden: false }
        ]
      }, {
        hidden: false,
        multipleSelection: false,
        name: 'searchOptions',
        listItems: [
          { icon: 'none', name: 'Tag', data: 'tag', checked: true },
          { icon: 'none', name: 'Full text', data: 'text', checked: false },
        ]
      }]
    },
    template: $(settingsPopoverTemplate).html(),
    initialize(e) {
      this.intialized = false;
      this.options = assign({}, this.defaults, e);
      this.state = Tumblr.Fox.state;
      this.searchOptions = Tumblr.Fox.searchOptions;
      this.listenTo(this.state, 'change:state', ::this.setSearchStateMenu);
      this.listenTo(this.searchOptions, 'change:state', ::this.setSearchOptionMenu);
      if (!Tumblr.Fox.options.enableTextSearch) {
        this.options.popoverOptions[1].hidden = true;
      }
    },
    setSearchStateMenu(state) {
      if (!Tumblr.Fox.options.cachedTags && state === 'likes') {
        this.options.popoverOptions[1].listItems.splice(0, 1);
      } else {
        if (this.options.popoverOptions[1].listItems[0].name !== 'Tag') {
          this.options.popoverOptions[1].listItems.unshift({ icon: 'none', name: 'Tag', data: 'tag', checked: false });
        }
      }
    },
    setSearchOptionMenu(state) {
      if (state === 'text') {
        this.options.popoverOptions[0].listItems[2].hidden = true;
      } else {
        this.options.popoverOptions[0].listItems[2].hidden = false;
      }
    },
    render() {
      this.$el.html(this.template);
      this.initialized = true;
    },
    events: {
      'click .toggle-search': 'togglePopover'
    },
    togglePopover() {
      this.popover = new Popover({
        pinnedTarget: this.$el,
        pinnedSide: 'bottom',
        class: 'popover--settings-popover',
        selection: 'checkmark',
        items: this.options.popoverOptions,
        onSelect: ::this.onSelect
      });
      this.popover.render();
      this.listenTo(this.popover, 'close', this.onPopoverClose);
    },
    hidePopover() {
      this.popover && this.popover.hide();
    },
    onPopoverClose() {
      defer(() => {
        this.popover = null;
      });
    },
    onSelect(setting) {
      if (this.initialized) {
        switch(setting) {
          case 'tag':
            this.searchOptions.setState(setting);
            break;
          case 'text':
            this.searchOptions.setState(setting);
            this.state.setState('user');
            break;
          default:
            this.state.setState(setting);
            Tumblr.Fox.Posts.set('tagSearch', setting);
            break
        }
      }
    }
  });

  Tumblr.Fox.Settings = Settings;
});