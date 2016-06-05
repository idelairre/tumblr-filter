module.exports = (function popover(Tumblr, Backbone, _) {
  const $ = Backbone.$;
  const { assign, template } = _;
  const { get, PopoverMixin } = Tumblr.Fox;
  const PopoverComponent = get('PopoverComponent');

  /**
   * Constructor - passed in through controller component
   * @constructor
   * @param {HTML Element} pinnedTarget Element to pin popover to
   * @param {String} pinnedSide Direction popover will appear from
   * @param {String} class Optional css class of the popover.
   * @param {String} selection Optional selection indicator. Recognized parameters"
   *     "checkmark" {String} Displays checkmark
   *     "none" {String} Displays nothing
   * @param {Array} items Html list items and headers to display. Recognized parameters:
   *     "header" {String} Optional section title
   *     "suffix" {String} Optional secondary text
   *     "multipleSelection" {Boolean} Optional toggles multiple selection
   *     "listItems" {Array} Li tags and their properties. Recognized parameters:
   *        "icon" {String} Optional css class of the icon to prepend to list item
   *         "name" {String} Optional text body of the list item
   *         "checked" {Boolean} Optional default checked state
   * @param {Function} onSelect Optional function to perform on list item selection.
   */

   /**
   * Component API:
   * In your controller component set the following in defaults or wherever:
   *   ...
   *   popoverOptions: [{
   *     header: 'Whatever',
   *     listItems: [
   *       { icon: 'none', name: 'Search likes', checked: false },
   *       { icon: 'none', name: 'Search by user', checked: true },
   *       { icon: 'none', name: 'Search dashboard', checked: false }
   *     ]
   *   }]
   *
   * Then in the body of the Backbone.View class set a method like the following:
   *   ...
   *   togglePopover() {
   *     this.popover || (this.popover = new Popover({
   *       pinnedTarget: this.$el,
   *       pinnedSide: 'bottom',
   *       class: 'popover--settings-popover',
   *       selection: 'checkmark',
   *       items: this.options.popoverOptions,
   *       onSelect: this.onSelect
   *     }),
   *     this.popover.render(),
   *     this.listenTo(this.popover, 'close', this.onPopoverClose));
   *   },
   */

  const Popover = PopoverComponent.extend({
    mixins: [PopoverMixin],
    template: template($('#popoverTemplate').html()),
    events: {
      'click li.popover_menu_item': 'toggleSelected'
    },
    initialize(e) {
      this.options = assign({}, e);
      this.initialized = false;
    },
    render() {
      this.$el = this.$el.html(this.template(this.options));
      this.$el.addClass(this.options.class);
      let hiddenItems = null;
      this.options.items.map(item => {
        if (item.hidden) {
          hiddenItems =+ 1;
          this.$(`#${item.name}`).hide();
        }
        item.listItems.map(li => {
          if (li.hidden) {
            this.$(`[data-js-menu-item="${li.data}"]`).hide();
          }
        });
      });
      if (hiddenItems && (this.options.items.length - hiddenItems === 1)) {
        this.$('ul.popover_inner_list').css('border-bottom', '0px');
      }
    },
    toggleSelected(e) {
      const target = $(e.currentTarget);
      const sectionName = $(e.currentTarget).parent('ul').attr('id');
      const tag = target.prop('tagName');
      let option = {};
      if (tag === 'LI') {
        option = target.data('js-menu-item');
      } else if (tag === 'A') {
        option = target.data('js-menu-item-link');
      }
      this.options.items.map(section => {
        if (!section.multipleSelection && sectionName === section.name) {
          section.listItems.map(li => {
            if (li.data === option) {
              li.checked = true;
            } else {
              li.checked = false;
            }
            return li;
          });
        } else if (sectionName === section.name) {
          if (li.data === option) {
            li.checked = li.checked ? false : true;
          }
        }
        return section;
      });
      this.setSelected(this.options.items);
      return this.options.onSelect.call(this, option);
    },
    setSelected(listItems) {
      listItems.map(li => {
        if (li.checked) {
          this.$el.find(`i.icon[data-check="${li.data}"]`).show();
        } else {
          this.$el.find(`i.icon[data-check="${li.data}"]`).hide();
        }
      });
    }
  });

  Tumblr.Fox.Popover = Popover;
});