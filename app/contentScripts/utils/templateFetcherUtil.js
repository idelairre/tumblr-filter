module.exports = (function templateCache(Tumblr, Backbone, $, _) {
  const { extend, trim } = _;

  const TemplateCache = function () {
    this.templates = {};
    this.initialize();
  };

  extend(TemplateCache.prototype, {
    get(templateId) {
      const cachedTemplate = this.templates[templateId];
      if (typeof cachedTemplate === 'undefined') {
        throw new Error(`Template "${templateId}" not found`);
      }
      return cachedTemplate;
    },
    put(templateId, template) {
      this.templates[templateId] = trim(template);
    },
    initialize() {
      const templates = $('[type="text/template"]');
      $.each(templates, (i, template) => {
        template = $(template);
        this.put(template.attr('id'), template.html());
      });
    }
  });

  Tumblr.Fox.Utils.TemplateCache = new TemplateCache();

});
