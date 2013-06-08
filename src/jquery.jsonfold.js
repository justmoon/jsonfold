;(function ($, window, document, undefined) {
	var pluginName = "jsonfold",
			defaults = {
        indent: null,
				indentChar: "\u00A0",
        indentWidth: 2
		  };

	function JsonFold(element, options)
  {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	JsonFold.prototype = {
		init: function ()
    {
      var $el = $(this.element);
      if (this.settings.json) {
        this.parse(this.settings.json);
      } else if (this.settings.obj) {
        this.format(this.settings.obj);
      } else if ($el.text().length) {
        var text = $el.text();
        this.element.empty();
        this.parse(text);
      }

      $el.delegate(".toggle", "click", function (evt) {
        $(this).parent().toggleClass("expanded");
      });
		},
    parse: function (json)
    {
      this.format($.parseJSON(json));
    },
    format: function (obj)
    {
      this._render(obj, $(this.element));
    },
    collapse: function (depth)
    {
      // XXX Honor depth parameter
      $(this.element).find('.expanded').removeClass("expanded");
    },
    expand: function (depth)
    {
      // XXX Honor depth parameter
      $(this.element).find('ul > li').addClass("expanded");
    },
		_render: function (v, ct, depth)
    {
      ct = ct || $(this.element);
			depth = depth || 0;

      var indent = ("string" === typeof this.settings.indent)
            ? this.settings.indent
            : repeat(this.settings.indentChar, this.settings.indentWidth);

      switch (typeof v) {
      case "object":
        var el, sub = null, count, arr = Array.isArray(v);
        ct.append(arr ? "[" : "{");
        if (arr) {
          count = v.length;
          for (var i = 0; i < count; i++) {
            if (!sub) {
              $('<a class="toggle"></a>').appendTo(ct);
              $('<span class="ellipsis"></span>')
                .text(this._getEllipText(count)).appendTo(ct);
              el = $("<ul></ul>");
            } else sub.append(",");
            sub = $("<li></li>").addClass("type-" + typeof v[i]);
            sub.append(repeat(indent, depth + 1));
            this._render(v[i], sub, depth + 1);
            sub.appendTo(el);
          }
        } else {
          count = Object.keys(v).length;
          for (var i in v) {
            if (!sub) {
              $('<a class="toggle"></a>').appendTo(ct);
              $('<span class="ellipsis"></span>')
                .text(this._getEllipText(Object.keys(v))).appendTo(ct);
              el = $("<ul></ul>");
            } else sub.append(",");
            sub = $("<li></li>").addClass("type-" + typeof v[i]);
            sub.append(repeat(indent, depth + 1));
            $("<span></span>").addClass('name').text(i).appendTo(sub);
            $("<span></span>").addClass('sep').text(" : ").appendTo(sub);
            this._render(v[i], sub, depth + 1);
            sub.appendTo(el);
          }
        }
        if (el) {
          el.appendTo(ct);
          $('<span class="indentafter"></span>')
            .text(repeat(indent, depth)).appendTo(ct);
        }
        ct.append(arr ? "]" : "}");
        break;
      case "string":
        $("<span></span>").addClass('val').text('"'+v+'"').appendTo(ct);
        break;
      case "number":
        $("<span></span>").addClass('val').text(""+v).appendTo(ct);
        break;
      case "boolean":
        $("<span></span>").addClass('val').text(v ? "true" : "false").appendTo(ct);
        break;
      }
		},
    _getEllipText: function (count) {
      var label = "...";
      if (Array.isArray(count)) {
        label = "";
        while (label.length < 15) {
          if (!count.length) break;
          if (label.length) label += ", ";
          label += count.shift();
        }
        if (count.length) label += ", ...";
      } else if ("number" === typeof count) {
        label = "" + count + " items";
      }
      return "\u00A0/* "+label+" */\u00A0";
    }
	};

  function repeat(str, times) {
    return (new Array(times + 1)).join(str);
  }

	$.fn[pluginName] = function (options) {
    var cmd, param;
    if ("string" === typeof options) {
      cmd = options;
      param = arguments[1];
      options = arguments[2];
    }
    return this.each(function() {
      var fold = $.data(this, "plugin_" + pluginName);
			if (!fold) {
				fold = new JsonFold(this, options);
        $.data(this, "plugin_" + pluginName, fold);
			}

      if ("string" === typeof cmd &&
          "function" === typeof fold[cmd] &&
          cmd[0] !== "_") {
        fold[cmd](param);
      }
		});
	};

  $.fn[pluginName].defaults = defaults;
})(jQuery, window, document);
