/*

Copyright (c) 2009-2010 Maxime Haineault.  All rights reserved.
The copyrights embodied in the content of this file are licensed by
Motion Média Inc. under the BSD (revised) open source license

Based on parsexml.js (by ???)

Maxime Haineault <max@motion-m.ca>
*/



/* This file defines an XML parser, with a few kludges to make it
 * useable for HTML. autoSelfClosers defines a set of tag names that
 * are expected to not have a closing tag, and doNotIndent specifies
 * the tags inside of which no indentation should happen (see Config
 * object). These can be disabled by passing the editor an object like
 * {useHTMLKludges: false} as parserConfig option.
 */

var DjangoParser = Editor.Parser = (function() {
  var Kludges = {
    autoSelfClosers: {"br": true, "img": true, "hr": true, "link": true, "input": true,
                      "meta": true, "col": true, "frame": true, "base": true, "area": true},
    doNotIndent: {"pre": true, "!cdata": true}
  };
  var NoKludges = {autoSelfClosers: {}, doNotIndent: {"!cdata": true}};
  var UseKludges = Kludges;
  var alignCDATA = false;
  var inVar, inBlock = false;
  var isTag = /[\s\W|]/;

  // Simple stateful tokenizer for XML documents. Returns a
  // MochiKit-style iterator, with a state property that contains a
  // function encapsulating the current state. See tokenize.js.
  var tokenizeDjango = (function() {


    function readBlock(source, setState) {
        source.nextWhileMatches(/%\}/)
        console.log('l ', source.get())
        setState(inText);
        return 'django-blocktest'
    }                        



    function inText(source, setState) {
      var ch = source.next();

      if (ch == '{') {
        if (source.equals('%')) {
            setState(inBlock);
            return "django-block";
        }
      }
      /*
      else {
        return 'test'
      }
      */
/*
      // template tag
      if (ch == '{' && source.equals('%')) {
        source.next();
        if (source.peek() == ' ') {
            source.next();
        }
        inBlock = true;
        return "django-block";
      }
      if (inBlock && ch == '}') {
        inBlock = false;
        return "django-block";
      }

      // template filter
      if (ch == '|' && inBlock || inVar) {
        source.nextWhileMatches(/\W\s/);

        return "django-variable";
      }

      // template variable
      if (ch == '{' && source.equals('{')) {
        source.next();
        if (source.peek() == ' ') {
            source.next();
        }
        source.nextWhileMatches(/[\w\._\-]/);
        setState(inBlock("django-variable", "}}"));
        inVar = true;
        return "django-variable";
      }

      if (inVar && source.equals('}')) {
        invar = false;
        return "django-variable";
      }



      else {
        source.nextWhileMatches(/[^&<\n}|]/);
        return "django-text";
      }
      /*
      if (ch == "%") {

        
        // template filter
        else if (source.equals('|')) {
          setState(inBlock("django-filter", " "));
        }
        else if (source.equals("?")) {
          source.next();
          source.nextWhileMatches(/[\w\._\-]/);
          setState(inBlock("django-processing", "?>"));
          return "django-processing";
        }
        else {
          if (source.equals("/")) source.next();
          setState(inTag);
          return "django-punctuation";
        }
      }
      */
    }

    function inTag(source, setState) {
      var ch = source.next();
      console.log('aaa', ch);
      if (ch == ">") {
        setState(inText);
        return "django-punctuation";
      }
      else if (/[?\/]/.test(ch) && source.equals(">")) {
        source.next();
        setState(inText);
        return "django-punctuation";
      }
      else if (ch == "=") {
        return "django-punctuation";
      }
      else if (/[\'\"]/.test(ch)) {
        setState(inAttribute(ch));
        return null;
      }
      else {
        source.nextWhileMatches(/[^\s\u00a0=<>\"\'\/?]/);
        return "django-name";
      }
    }

    function inAttribute(quote) {
      return function(source, setState) {
        while (!source.endOfLine()) {
          if (source.next() == quote) {
            setState(inTag);
            break;
          }
        }
        return "django-attribute";
      };
    }

    function inBlock(style, terminator) {
      return function(source, setState) {
        while (!source.endOfLine()) {
          if (source.lookAhead(terminator, true)) {
            setState(inText);
            break;
          }
          source.next();
        }
        return style;
      };
    }

    return function(source, startState) {
        console.log('zzzzz ', source);
      return tokenizer(source, startState || inText);
    };
  })();

  // The parser. The structure of this function largely follows that of
  // parseJavaScript in parsejavascript.js (there is actually a bit more
  // shared code than I'd like), but it is quite a bit simpler.
  function parseDjango(source) {
    var tokens = tokenizeDjango(source), token;
    var cc = [base];
    var tokenNr = 0, indented = 0;
    var currentTag = null, context = null;
    var consume;
    
    function push(fs) {
      for (var i = fs.length - 1; i >= 0; i--)
        cc.push(fs[i]);
    }
    function cont() {
      push(arguments);
      consume = true;
    }
    function pass() {
      push(arguments);
      consume = false;
    }

    function markErr() {
      //token.style += " xml-error";
    }
    function expect(text) {
      return function(style, content) {
        if (content == text) cont();
        else {markErr(); cont(arguments.callee);}
      };
    }

    function pushContext(tagname, startOfLine) {
      var noIndent = UseKludges.doNotIndent.hasOwnProperty(tagname) || (context && context.noIndent);
      context = {prev: context, name: tagname, indent: indented, startOfLine: startOfLine, noIndent: noIndent};
    }
    function popContext() {
      context = context.prev;
    }
    function computeIndentation(baseContext) {
      return function(nextChars, current) {
        var context = baseContext;
        if (context && context.noIndent)
          return current;
        if (alignCDATA && /<!\[CDATA\[/.test(nextChars))
          return 0;
        if (context && /^<\//.test(nextChars))
          context = context.prev;
        while (context && !context.startOfLine)
          context = context.prev;
        if (context)
          return context.indent + indentUnit;
        else
          return 0;
      };
    }

    function base() {
      return pass(element, base);
    }
    var harmlessTokens = {"django-text": true, "xml-entity": true, "xml-comment": true, "xml-processing": true};
    function element(style, content) {
        console.log('xxx ', style, content);
      if (content == "{") cont(tagname, attributes, endtag(tokenNr == 1));
      else if (content == "{%") cont(closetagname, expect("%}"));
      else if (harmlessTokens.hasOwnProperty(style)) cont();
      else {markErr(); cont();}
    }
    function tagname(style, content) {
      if (style == "django-name") {
        currentTag = content.toLowerCase();
        token.style = "django-tagname";
        cont();
      }
      else {
        currentTag = null;
        pass();
      }
    }
    function closetagname(style, content) {
      if (style == "django-name") {
        token.style = "django-tagname";
        if (context && content.toLowerCase() == context.name) popContext();
        else markErr();
      }
      cont();
    }
    function endtag(startOfLine) {
      return function(style, content) {
        if (content == "/>" || (content == ">" && UseKludges.autoSelfClosers.hasOwnProperty(currentTag))) cont();
        else if (content == ">") {pushContext(currentTag, startOfLine); cont();}
        else {markErr(); cont(arguments.callee);}
      };
    }
    function attributes(style) {
      if (style == "django-name") {token.style = "xml-attname"; cont(attribute, attributes);}
      else pass();
    }
    function attribute(style, content) {
      if (content == "=") cont(value);
      else if (content == ">" || content == "/>") pass(endtag);
      else pass();
    }
    function value(style) {
      if (style == "django-attribute") cont(value);
      else pass();
    }

    return {
      indentation: function() {return indented;},

      next: function(){
        token = tokens.next();
        if (token.style == "whitespace" && tokenNr == 0)
          indented = token.value.length;
        else
          tokenNr++;
        if (token.content == "\n") {
          indented = tokenNr = 0;
          token.indentation = computeIndentation(context);
        }

        if (token.style == "whitespace" || token.type == "django-comment")
          return token;

        while(true){
          consume = false;
          cc.pop()(token.style, token.content);
          if (consume) return token;
        }
      },

      copy: function(){
        var _cc = cc.concat([]), _tokenState = tokens.state, _context = context;
        var parser = this;
        
        return function(input){
          cc = _cc.concat([]);
          tokenNr = indented = 0;
          context = _context;
          tokens = tokenizeDjango(input, _tokenState);
          return parser;
        };
      }
    };
  }

  return {
    make: parseDjango,
    electricChars: "/",
    configure: function(config) {
      if (config.useHTMLKludges != null)
        UseKludges = config.useHTMLKludges ? Kludges : NoKludges;
      if (config.alignCDATA)
        alignCDATA = config.alignCDATA;
    }
  };
})();

