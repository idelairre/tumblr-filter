module.exports = (function filterPopoverContainer(Tumblr, Backbone, _) {
  const $ = Backbone.$;
  const { assign } = _;
  const { get } = Tumblr.Fox;
  const { FilterPopoverComponent } = Tumblr.Fox;
  const PrimaComponent = get('PrimaComponent');

  const FilterPopoverContainer = PrimaComponent.extend({
    name: 'FilterPopover',
    view(e) {
      assign(e, {
        pinnedTarget: $('#filter_button'),
        isFixedPosition: true,
        autoTeardown: false,
        teardownOnEscape: false
      });
      return new FilterPopoverComponent(e);
    },
    show() {
      this.view.show();
    },
    render() {
      this.view.render();
      this.trigger('append');
    }
  });

  Tumblr.Fox.FilterPopoverContainer = FilterPopoverContainer;
});