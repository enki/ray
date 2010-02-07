/* Simple parser for Django templates */

var itag = false;
var DjangoParser = Editor.Parser = (function() {
  var tokenizeDjango = (function() {
    function normal(source, setState) {
      var ch = source.next();
      if (ch === '{' && source.peek() === "%") {
        source.next();
        setState(inTag);
        return "django-tag";
      }
//    else if (ch == "%" && source.peek('}')) {
//      source.next();
//      return "django-end-tag";
//    }
//    else if (ch == "{" && source.peek('{')) {
//      source.next();
//      setState(inVar);
//      return "django-var";
//    }
//    else if (ch == "}" && source.peek('}')) {
//      source.next();
//      return "django-end-var";
//    }
//      return 'test';

//      if (ch == "%" && source.equals("{")) {
//        source.nextWhileMatches(/\}/);
//        return "django-tag";
//      }
/*      
      if (ch == "@") {
        source.nextWhileMatches(/\w/);
        return "css-at";
      }
      else if (ch == "/" && source.equals("*")) {
        setState(inCComment);
        return null;
      }
      else if (ch == "<" && source.equals("!")) {
        setState(inSGMLComment);
        return null;
      }
      else if (ch == "=") {
        return "css-compare";
      }
      else if (source.equals("=") && (ch == "~" || ch == "|")) {
        source.next();
        return "css-compare";
      }
      else if (ch == "\"" || ch == "'") {
        setState(inString(ch));
        return null;
      }
      else if (ch == "#") {
        source.nextWhileMatches(/\w/);
        return "css-hash";
      }
      else if (ch == "!") {
        source.nextWhileMatches(/[ \t]/);
        source.nextWhileMatches(/\w/);
        return "css-important";
      }
      else if (/\d/.test(ch)) {
        source.nextWhileMatches(/[\w.%]/);
        return "css-unit";
      }
      else if (/[,.+>*\/]/.test(ch)) {
        return "css-select-op";
      }
      else if (/[;{}:\[\]]/.test(ch)) {
        return "css-punctuation";
      }
      else {
        source.nextWhileMatches(/[\w\\\-_]/);
        return "css-identifier";
      }
    */
    }
    function inTag(source, setState) {
//      console.log('x-x-x-', source.next())
      if (source.nextWhileMatches(/block|extends/)) {
          return "django-in-tag";
      }
      else if (source.nextWhileMatches(/\w+/)) {
          return "django-builtin-tag";
      }
      else {
          while (!source.endOfLine()) {
            var ch = source.next();
            if (ch == "%" && source.peek() == '}') {
                source.next();
                setState(normal);
                break;
            }
          }
      }
    }
    function inVar(source, setState) {
      var dashes = 0;
      while (!source.endOfLine()) {
        var ch = source.next();
        if (dashes >= 2 && ch == ">") {
          setState(normal);
          break;
        }
        dashes = (ch == "-") ? dashes + 1 : 0;
      }
      return "django-var";
    }
/*
    function inCComment(source, setState) {
      var maybeEnd = false;
      while (!source.endOfLine()) {
        var ch = source.next();
        if (maybeEnd && ch == "/") {
          setState(normal);
          break;
        }
        maybeEnd = (ch == "*");
      }
      return "css-comment";
    }


    function inString(quote) {
      return function(source, setState) {
        var escaped = false;
        while (!source.endOfLine()) {
          var ch = source.next();
          if (ch == quote && !escaped)
            break;
          escaped = !escaped && ch == "\\";
        }
        if (!escaped)
          setState(normal);
        return "css-string";
      };
    }
    */

    return function(source, startState) {
      return tokenizer(source, startState || normal);
    };
  })();

//function indentCSS(inBraces, inRule, base) {
//  return function(nextChars) {
//    if (!inBraces || /^\}/.test(nextChars)) return base;
//    else if (inRule) return base + indentUnit * 2;
//    else return base + indentUnit;
//  };
//}

  // This is a very simplistic parser -- since CSS does not really
  // nest, it works acceptably well, but some nicer colouroing could
  // be provided with a more complicated parser.
  function parseDjango(source, basecolumn) {
    basecolumn = basecolumn || 0;
    var tokens = tokenizeDjango(source);
    var inBraces = false, inDjangoFilter = false, inDjangoTag = false;

    var iter = {
      next: function() {
        var token = tokens.next(), style = token.style, content = token.content;
        console.log(token, style, content);
        
//      if (style == "css-identifier" && inRule)
//        token.style = "css-value";
//      if (style == "css-hash")
//        token.style =  inRule ? "css-colorcode" : "css-identifier";

//        if (content == "\n")
//          token.indentation = indentCSS(inBraces, inRule, basecolumn);

//      if (content == "{")
//        inBraces = true;
//      else if (content == "}")
//        inBraces = inRule = false;
//      else if (inBraces && content == ";")
//        inRule = false;
//      else if (inBraces && style != "css-comment" && style != "whitespace")
//        inRule = true;

        return token;
      },

      copy: function() {
        var _inBraces = inBraces, _inDjangoTag = inDjangoTag, _inDjangoFilter = inDjangoFilter, _tokenState = tokens.state;
        return function(source) {
          tokens = tokenizeDjango(source, _tokenState);
          inDjangoTag = _inDjangoTag;
          inDjangoFilter = _inDjangoFilter;
          return iter;
        };
      }
    };
    return iter;
  }

  return {make: parseDjango, electricChars: "}"};
})();
