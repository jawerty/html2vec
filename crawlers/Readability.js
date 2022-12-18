function Readability(b,a){if(a&&a.documentElement)b=a,a=arguments[2];else if(!b||!b.documentElement)throw new Error("First argument to Readability constructor should be a document object.");if(a=a||{},this._doc=b,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._debug=!!a.debug,this._maxElemsToParse=a.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE,this._nbTopCandidates=a.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES,this._charThreshold=a.charThreshold||this.DEFAULT_CHAR_THRESHOLD,this._classesToPreserve=this.CLASSES_TO_PRESERVE.concat(a.classesToPreserve||[]),this._keepClasses=!!a.keepClasses,this._serializer=a.serializer||function(a){return a.innerHTML},this._disableJSONLD=!!a.disableJSONLD,this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY,this._debug){let c=function(a){if(a.nodeType==a.TEXT_NODE)return`${a.nodeName} ("${a.textContent}")`;let b=Array.from(a.attributes||[],function(a){return`${a.name}="${a.value}"`}).join(" ");return`<${a.localName} ${b}>`};this.log=function(){if("undefined"!=typeof dump){var b=Array.prototype.map.call(arguments,function(a){return a&&a.nodeName?c(a):a}).join(" ");dump("Reader: (Readability) "+b+"\n")}else if("undefined"!=typeof console){let a=Array.from(arguments,a=>a&&a.nodeType==this.ELEMENT_NODE?c(a):a);a.unshift("Reader: (Readability)"),console.log.apply(console,a)}}}else this.log=function(){}}Readability.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,ELEMENT_NODE:1,TEXT_NODE:3,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_TAGS_TO_SCORE:"SECTION,H2,H3,H4,H5,H6,P,TD,PRE".split(","),DEFAULT_CHAR_THRESHOLD:500,REGEXPS:{unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i,positive:/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,negative:/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,extraneous:/print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby|p-author/i,replaceFonts:/<(\/?)font[^>]*>/gi,normalize:/\s{2,}/g,videos:/\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,shareElements:/(\b|_)(share|sharedaddy)(\b|_)/i,nextLink:/(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,tokenize:/\W+/g,whitespace:/^\s*$/,hasContent:/\S$/,hashUrl:/^#.+/,srcsetUrl:/(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,b64DataUrl:/^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,jsonLdArticleTypes:/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/},UNLIKELY_ROLES:["menu","menubar","complementary","navigation","alert","alertdialog","dialog"],DIV_TO_P_ELEMS:new Set(["BLOCKQUOTE","DL","DIV","IMG","OL","P","PRE","TABLE","UL"]),ALTER_TO_DIV_EXCEPTIONS:["DIV","ARTICLE","SECTION","P"],PRESENTATIONAL_ATTRIBUTES:["align","background","bgcolor","border","cellpadding","cellspacing","frame","hspace","rules","style","valign","vspace"],DEPRECATED_SIZE_ATTRIBUTE_ELEMS:["TABLE","TH","TD","HR","PRE"],PHRASING_ELEMS:["ABBR","AUDIO","B","BDO","BR","BUTTON","CITE","CODE","DATA","DATALIST","DFN","EM","EMBED","I","IMG","INPUT","KBD","LABEL","MARK","MATH","METER","NOSCRIPT","OBJECT","OUTPUT","PROGRESS","Q","RUBY","SAMP","SCRIPT","SELECT","SMALL","SPAN","STRONG","SUB","SUP","TEXTAREA","TIME","VAR","WBR"],CLASSES_TO_PRESERVE:["page"],HTML_ESCAPE_MAP:{lt:"<",gt:">",amp:"&",quot:'"',apos:"'"},_postProcessContent:function(a){this._fixRelativeUris(a),this._simplifyNestedElements(a),this._keepClasses||this._cleanClasses(a)},_removeNodes:function(a,d){if(this._docJSDOMParser&&a._isLiveNodeList)throw new Error("Do not pass live node lists to _removeNodes");for(var b=a.length-1;b>=0;b--){var c=a[b],e=c.parentNode;e&&(!d||d.call(this,c,b,a))&&e.removeChild(c)}},_replaceNodeTags:function(a,b){if(this._docJSDOMParser&&a._isLiveNodeList)throw new Error("Do not pass live node lists to _replaceNodeTags");for(let c of a)this._setNodeTag(c,b)},_forEachNode:function(a,b){Array.prototype.forEach.call(a,b,this)},_findNode:function(a,b){return Array.prototype.find.call(a,b,this)},_someNode:function(a,b){return Array.prototype.some.call(a,b,this)},_everyNode:function(a,b){return Array.prototype.every.call(a,b,this)},_concatNodeLists:function(){var a=Array.prototype.slice,b=a.call(arguments),c=b.map(function(b){return a.call(b)});return Array.prototype.concat.apply([],c)},_getAllNodesWithTag:function(a,b){return a.querySelectorAll?a.querySelectorAll(b.join(",")):[].concat.apply([],b.map(function(c){var b=a.getElementsByTagName(c);return Array.isArray(b)?b:Array.from(b)}))},_cleanClasses:function(a){var c=this._classesToPreserve,b=(a.getAttribute("class")||"").split(/\s+/).filter(function(a){return -1!=c.indexOf(a)}).join(" ");for(b?a.setAttribute("class",b):a.removeAttribute("class"),a=a.firstElementChild;a;a=a.nextElementSibling)this._cleanClasses(a)},_fixRelativeUris:function(a){var d=this._doc.baseURI,e=this._doc.documentURI;function f(a){if(d==e&&"#"==a.charAt(0))return a;try{return new URL(a,d).href}catch(b){}return a}var b=this._getAllNodesWithTag(a,["a"]);this._forEachNode(b,function(a){var b=a.getAttribute("href");if(b){if(0===b.indexOf("javascript:")){if(1===a.childNodes.length&&a.childNodes[0].nodeType===this.TEXT_NODE){var d=this._doc.createTextNode(a.textContent);a.parentNode.replaceChild(d,a)}else{for(var c=this._doc.createElement("span");a.firstChild;)c.appendChild(a.firstChild);a.parentNode.replaceChild(c,a)}}else a.setAttribute("href",f(b))}});var c=this._getAllNodesWithTag(a,["img","picture","figure","video","audio","source"]);this._forEachNode(c,function(a){var b=a.getAttribute("src"),c=a.getAttribute("poster"),d=a.getAttribute("srcset");if(b&&a.setAttribute("src",f(b)),c&&a.setAttribute("poster",f(c)),d){var e=d.replace(this.REGEXPS.srcsetUrl,function(_,a,b,c){return f(a)+(b||"")+c});a.setAttribute("srcset",e)}})},_simplifyNestedElements:function(d){for(var a=d;a;){if(a.parentNode&&["DIV","SECTION"].includes(a.tagName)&&!(a.id&&a.id.startsWith("readability"))){if(this._isElementWithoutContent(a)){a=this._removeAndGetNext(a);continue}if(this._hasSingleTagInsideElement(a,"DIV")||this._hasSingleTagInsideElement(a,"SECTION")){for(var c=a.children[0],b=0;b<a.attributes.length;b++)try{c.setAttribute(a.attributes[b].name,a.attributes[b].value)}catch(e){console.log(e)}a.parentNode.replaceChild(c,a),a=c;continue}}a=this._getNextNode(a)}},_getArticleTitle:function(){var c=this._doc,a="",b="";try{a=b=c.title.trim(),"string"!=typeof a&&(a=b=this._getInnerText(c.getElementsByTagName("title")[0]))}catch(i){}var e=!1;function d(a){return a.split(/\s+/).length}if(/ [\|\-\\\/>»] /.test(a))e=/ [\\\/>»] /.test(a),3>d(a=b.replace(/(.*)[\|\-\\\/>»] .*/gi,"$1"))&&(a=b.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi,"$1"));else if(-1!==a.indexOf(": ")){var h=this._concatNodeLists(c.getElementsByTagName("h1"),c.getElementsByTagName("h2")),j=a.trim();!this._someNode(h,function(a){return a.textContent.trim()===j})&&(3>d(a=b.substring(b.lastIndexOf(":")+1))?a=b.substring(b.indexOf(":")+1):d(b.substr(0,b.indexOf(":")))>5&&(a=b))}else if(a.length>150||a.length<15){var f=c.getElementsByTagName("h1");1===f.length&&(a=this._getInnerText(f[0]))}var g=d(a=a.trim().replace(this.REGEXPS.normalize," "));return g<=4&&(!e||g!=d(b.replace(/[\|\-\\\/>»]+/g,""))-1)&&(a=b),a},_prepDocument:function(){var a=this._doc;this._removeNodes(this._getAllNodesWithTag(a,["style"])),a.body&&this._replaceBrs(a.body),this._replaceNodeTags(this._getAllNodesWithTag(a,["font"]),"SPAN")},_nextNode:function(b){for(var a=b;a&&a.nodeType!=this.ELEMENT_NODE&&this.REGEXPS.whitespace.test(a.textContent);)a=a.nextSibling;return a},_replaceBrs:function(a){this._forEachNode(this._getAllNodesWithTag(a,["br"]),function(c){for(var a=c.nextSibling,d=!1;(a=this._nextNode(a))&&"BR"==a.tagName;){d=!0;var f=a.nextSibling;a.parentNode.removeChild(a),a=f}if(d){var b=this._doc.createElement("p");for(c.parentNode.replaceChild(b,c),a=b.nextSibling;a;){if("BR"==a.tagName){var e=this._nextNode(a.nextSibling);if(e&&"BR"==e.tagName)break}if(!this._isPhrasingContent(a))break;var g=a.nextSibling;b.appendChild(a),a=g}for(;b.lastChild&&this._isWhitespace(b.lastChild);)b.removeChild(b.lastChild);"P"===b.parentNode.tagName&&this._setNodeTag(b.parentNode,"DIV")}})},_setNodeTag:function(a,c){if(this.log("_setNodeTag",a,c),this._docJSDOMParser)return a.localName=c.toLowerCase(),a.tagName=c.toUpperCase(),a;for(var b=a.ownerDocument.createElement(c);a.firstChild;)b.appendChild(a.firstChild);a.parentNode.replaceChild(b,a),a.readability&&(b.readability=a.readability);for(var d=0;d<a.attributes.length;d++)try{b.setAttribute(a.attributes[d].name,a.attributes[d].value)}catch(e){}return b},_prepArticle:function(a){this._cleanStyles(a),this._markDataTables(a),this._fixLazyImages(a),this._cleanConditionally(a,"form"),this._cleanConditionally(a,"fieldset"),this._clean(a,"object"),this._clean(a,"embed"),this._clean(a,"footer"),this._clean(a,"link"),this._clean(a,"aside");var b=this.DEFAULT_CHAR_THRESHOLD;this._forEachNode(a.children,function(a){this._cleanMatchedNodes(a,function(a,c){return this.REGEXPS.shareElements.test(c)&&a.textContent.length<b})}),this._clean(a,"iframe"),this._clean(a,"input"),this._clean(a,"textarea"),this._clean(a,"select"),this._clean(a,"button"),this._cleanHeaders(a),this._cleanConditionally(a,"table"),this._cleanConditionally(a,"ul"),this._cleanConditionally(a,"div"),this._replaceNodeTags(this._getAllNodesWithTag(a,["h1"]),"h2"),this._removeNodes(this._getAllNodesWithTag(a,["p"]),function(a){var b=a.getElementsByTagName("img").length,c=a.getElementsByTagName("embed").length,d=a.getElementsByTagName("object").length,e=a.getElementsByTagName("iframe").length;return 0===b+c+d+e&&!this._getInnerText(a,!1)}),this._forEachNode(this._getAllNodesWithTag(a,["br"]),function(a){var b=this._nextNode(a.nextSibling);b&&"P"==b.tagName&&a.parentNode.removeChild(a)}),this._forEachNode(this._getAllNodesWithTag(a,["table"]),function(a){var c=this._hasSingleTagInsideElement(a,"TBODY")?a.firstElementChild:a;if(this._hasSingleTagInsideElement(c,"TR")){var d=c.firstElementChild;if(this._hasSingleTagInsideElement(d,"TD")){var b=d.firstElementChild;b=this._setNodeTag(b,this._everyNode(b.childNodes,this._isPhrasingContent)?"P":"DIV"),a.parentNode.replaceChild(b,a)}}})},_initializeNode:function(a){switch(a.readability={contentScore:0},a.tagName){case"DIV":a.readability.contentScore+=5;break;case"PRE":case"TD":case"BLOCKQUOTE":a.readability.contentScore+=3;break;case"ADDRESS":case"OL":case"UL":case"DL":case"DD":case"DT":case"LI":case"FORM":a.readability.contentScore-=3;break;case"H1":case"H2":case"H3":case"H4":case"H5":case"H6":case"TH":a.readability.contentScore-=5}a.readability.contentScore+=this._getClassWeight(a)},_removeAndGetNext:function(a){var b=this._getNextNode(a,!0);return a.parentNode.removeChild(a),b},_getNextNode:function(a,b){if(!b&&a.firstElementChild)return a.firstElementChild;if(a.nextElementSibling)return a.nextElementSibling;do a=a.parentNode;while(a&&!a.nextElementSibling)return a&&a.nextElementSibling},_textSimilarity:function(b,c){var d=b.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean),a=c.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);return d.length&&a.length?1-a.filter(a=>!d.includes(a)).join(" ").length/a.join(" ").length:0},_checkByline:function(a,c){if(this._articleByline)return!1;if(void 0!==a.getAttribute)var d=a.getAttribute("rel"),b=a.getAttribute("itemprop");return!!(("author"===d||b&& -1!==b.indexOf("author")||this.REGEXPS.byline.test(c))&&this._isValidByline(a.textContent))&&(this._articleByline=a.textContent.trim(),!0)},_getNodeAncestors:function(a,b){b=b||0;for(var d=0,c=[];a.parentNode&&(c.push(a.parentNode),!b|| ++d!==b);)a=a.parentNode;return c},_grabArticle:function(g){this.log("**** grabArticle ****");var n=this._doc,N=null!==g;if(!(g=g||this._doc.body))return this.log("No body found in document. Abort."),null;for(var O=g.innerHTML;;){this.log("Starting grabArticle loop");var c,P=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS),o=[],a=this._doc.documentElement;let D=!0;for(;a;){"HTML"===a.tagName&&(this._articleLang=a.getAttribute("lang"));var j=a.className+" "+a.id;if(!this._isProbablyVisible(a)){this.log("Removing hidden node - "+j),a=this._removeAndGetNext(a);continue}if(this._checkByline(a,j)){a=this._removeAndGetNext(a);continue}if(D&&this._headerDuplicatesTitle(a)){this.log("Removing header: ",a.textContent.trim(),this._articleTitle.trim()),D=!1,a=this._removeAndGetNext(a);continue}if(P){if(this.REGEXPS.unlikelyCandidates.test(j)&&!this.REGEXPS.okMaybeItsACandidate.test(j)&&!this._hasAncestorTag(a,"table")&&!this._hasAncestorTag(a,"code")&&"BODY"!==a.tagName&&"A"!==a.tagName){this.log("Removing unlikely candidate - "+j),a=this._removeAndGetNext(a);continue}if(this.UNLIKELY_ROLES.includes(a.getAttribute("role"))){this.log("Removing content with role "+a.getAttribute("role")+" - "+j),a=this._removeAndGetNext(a);continue}}if(("DIV"===a.tagName||"SECTION"===a.tagName||"HEADER"===a.tagName||"H1"===a.tagName||"H2"===a.tagName||"H3"===a.tagName||"H4"===a.tagName||"H5"===a.tagName||"H6"===a.tagName)&&this._isElementWithoutContent(a)){a=this._removeAndGetNext(a);continue}if(-1!==this.DEFAULT_TAGS_TO_SCORE.indexOf(a.tagName)&&o.push(a),"DIV"===a.tagName){for(var f=null,h=a.firstChild;h;){var Q=h.nextSibling;if(this._isPhrasingContent(h))null!==f?f.appendChild(h):this._isWhitespace(h)||(f=n.createElement("p"),a.replaceChild(f,h),f.appendChild(h));else if(null!==f){for(;f.lastChild&&this._isWhitespace(f.lastChild);)f.removeChild(f.lastChild);f=null}h=Q}if(this._hasSingleTagInsideElement(a,"P")&&.25>this._getLinkDensity(a)){var E=a.children[0];a.parentNode.replaceChild(E,a),a=E,o.push(a)}else this._hasChildBlockElement(a)||(a=this._setNodeTag(a,"P"),o.push(a))}a=this._getNextNode(a)}var F=[];this._forEachNode(o,function(a){if(a.parentNode&& void 0!==a.parentNode.tagName){var b=this._getInnerText(a);if(!(b.length<25)){var d=this._getNodeAncestors(a,5);if(0!==d.length){var c=0;c+=1,c+=b.split(",").length,c+=Math.min(Math.floor(b.length/100),3),this._forEachNode(d,function(a,b){if(a.tagName&&a.parentNode&& void 0!==a.parentNode.tagName){if(void 0===a.readability&&(this._initializeNode(a),F.push(a)),0===b)var d=1;else d=1===b?2:3*b;a.readability.contentScore+=c/d}})}}}});for(var i=[],u=0,R=F.length;u<R;u+=1){var k=F[u],v=k.readability.contentScore*(1-this._getLinkDensity(k));k.readability.contentScore=v,this.log("Candidate:",k,"with score "+v);for(var p=0;p<this._nbTopCandidates;p++){var G=i[p];if(!G||v>G.readability.contentScore){i.splice(p,0,k),i.length>this._nbTopCandidates&&i.pop();break}}}var b=i[0]||null,H=!1;if(null===b||"BODY"===b.tagName){for(b=n.createElement("DIV"),H=!0;g.firstChild;)this.log("Moving child out:",g.firstChild),b.appendChild(g.firstChild);g.appendChild(b),this._initializeNode(b)}else if(b){for(var q=[],r=1;r<i.length;r++)i[r].readability.contentScore/b.readability.contentScore>=.75&&q.push(this._getNodeAncestors(i[r]));var w=3;if(q.length>=w)for(c=b.parentNode;"BODY"!==c.tagName;){for(var x=0,y=0;y<q.length&&x<w;y++)x+=Number(q[y].includes(c));if(x>=w){b=c;break}c=c.parentNode}b.readability||this._initializeNode(b),c=b.parentNode;for(var z=b.readability.contentScore,S=z/3;"BODY"!==c.tagName;){if(!c.readability){c=c.parentNode;continue}var I=c.readability.contentScore;if(I<S)break;if(I>z){b=c;break}z=c.readability.contentScore,c=c.parentNode}for(c=b.parentNode;"BODY"!=c.tagName&&1==c.children.length;)c=(b=c).parentNode;b.readability||this._initializeNode(b)}var e=n.createElement("DIV");N&&(e.id="readability-content");var T=Math.max(10,.2*b.readability.contentScore);c=b.parentNode;for(var A=c.children,s=0,J=A.length;s<J;s++){var d=A[s],l=!1;if(this.log("Looking at sibling node:",d,d.readability?"with score "+d.readability.contentScore:""),this.log("Sibling has score",d.readability?d.readability.contentScore:"Unknown"),d===b)l=!0;else{var K=0;if(d.className===b.className&&""!==b.className&&(K+=.2*b.readability.contentScore),d.readability&&d.readability.contentScore+K>=T)l=!0;else if("P"===d.nodeName){var L=this._getLinkDensity(d),M=this._getInnerText(d),B=M.length;B>80&&L<.25?l=!0:B<80&&B>0&&0===L&& -1!==M.search(/\.( |$)/)&&(l=!0)}}l&&(this.log("Appending node:",d),-1===this.ALTER_TO_DIV_EXCEPTIONS.indexOf(d.nodeName)&&(this.log("Altering sibling:",d,"to div."),d=this._setNodeTag(d,"DIV")),e.appendChild(d),A=c.children,s-=1,J-=1)}if(this._debug&&this.log("Article content pre-prep: "+e.innerHTML),this._prepArticle(e),this._debug&&this.log("Article content post-prep: "+e.innerHTML),H)b.id="readability-page-1",b.className="page";else{var t=n.createElement("DIV");for(t.id="readability-page-1",t.className="page";e.firstChild;)t.appendChild(e.firstChild);e.appendChild(t)}this._debug&&this.log("Article content after paging: "+e.innerHTML);var C=!0,m=this._getInnerText(e,!0).length;if(m<this._charThreshold){if(C=!1,g.innerHTML=O,this._flagIsActive(this.FLAG_STRIP_UNLIKELYS))this._removeFlag(this.FLAG_STRIP_UNLIKELYS),this._attempts.push({articleContent:e,textLength:m});else if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES))this._removeFlag(this.FLAG_WEIGHT_CLASSES),this._attempts.push({articleContent:e,textLength:m});else if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY),this._attempts.push({articleContent:e,textLength:m});else{if(this._attempts.push({articleContent:e,textLength:m}),this._attempts.sort(function(a,b){return b.textLength-a.textLength}),!this._attempts[0].textLength)return null;e=this._attempts[0].articleContent,C=!0}}if(C){var U=[c,b].concat(this._getNodeAncestors(c));return this._someNode(U,function(a){if(!a.tagName)return!1;var b=a.getAttribute("dir");return!!b&&(this._articleDir=b,!0)}),e}}},_isValidByline:function(a){return("string"==typeof a||a instanceof String)&&(a=a.trim()).length>0&&a.length<100},_unescapeHtmlEntities:function(a){if(!a)return a;var b=this.HTML_ESCAPE_MAP;return a.replace(/&(quot|amp|apos|lt|gt);/g,function(_,a){return b[a]}).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi,function(_,a,b){var c=parseInt(a||b,a?16:10);return String.fromCharCode(c)})},_getJSONLD:function(a){var b,c=this._getAllNodesWithTag(a,["script"]);return this._forEachNode(c,function(c){if(!b&&"application/ld+json"===c.getAttribute("type"))try{var e=c.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g,""),a=JSON.parse(e);if(!a["@context"]||!a["@context"].match(/^https?\:\/\/schema\.org$/)||(!a["@type"]&&Array.isArray(a["@graph"])&&(a=a["@graph"].find(function(a){return(a["@type"]||"").match(this.REGEXPS.jsonLdArticleTypes)})),!a||!a["@type"]||!a["@type"].match(this.REGEXPS.jsonLdArticleTypes)))return;if(b={},"string"==typeof a.name&&"string"==typeof a.headline&&a.name!==a.headline){var d=this._getArticleTitle(),f=this._textSimilarity(a.name,d)>.75;this._textSimilarity(a.headline,d)>.75&&!f?b.title=a.headline:b.title=a.name}else"string"==typeof a.name?b.title=a.name.trim():"string"==typeof a.headline&&(b.title=a.headline.trim());a.author&&("string"==typeof a.author.name?b.byline=a.author.name.trim():Array.isArray(a.author)&&a.author[0]&&"string"==typeof a.author[0].name&&(b.byline=a.author.filter(function(a){return a&&"string"==typeof a.name}).map(function(a){return a.name.trim()}).join(", "))),"string"==typeof a.description&&(b.excerpt=a.description.trim()),a.publisher&&"string"==typeof a.publisher.name&&(b.siteName=a.publisher.name.trim());return}catch(g){this.log(g.message)}}),b||{}},_getArticleMetadata:function(c){var b={},a={},d=this._doc.getElementsByTagName("meta"),e=/\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title|site_name)\s*/gi,f=/^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;return this._forEachNode(d,function(d){var g=d.getAttribute("name"),i=d.getAttribute("property"),b=d.getAttribute("content");if(b){var h=null,c=null;i&&(h=i.match(e))&&(a[c=h[0].toLowerCase().replace(/\s/g,"")]=b.trim()),!h&&g&&f.test(g)&&(c=g,b&&(a[c=c.toLowerCase().replace(/\s/g,"").replace(/\./g,":")]=b.trim()))}}),b.title=c.title||a["dc:title"]||a["dcterm:title"]||a["og:title"]||a["weibo:article:title"]||a["weibo:webpage:title"]||a.title||a["twitter:title"],b.title||(b.title=this._getArticleTitle()),b.byline=c.byline||a["dc:creator"]||a["dcterm:creator"]||a.author,b.excerpt=c.excerpt||a["dc:description"]||a["dcterm:description"]||a["og:description"]||a["weibo:article:description"]||a["weibo:webpage:description"]||a.description||a["twitter:description"],b.siteName=c.siteName||a["og:site_name"],b.title=this._unescapeHtmlEntities(b.title),b.byline=this._unescapeHtmlEntities(b.byline),b.excerpt=this._unescapeHtmlEntities(b.excerpt),b.siteName=this._unescapeHtmlEntities(b.siteName),b},_isSingleImage:function(a){return"IMG"===a.tagName||1===a.children.length&&""===a.textContent.trim()&&this._isSingleImage(a.children[0])},_unwrapNoscriptImages:function(a){var b=Array.from(a.getElementsByTagName("img"));this._forEachNode(b,function(a){for(var b=0;b<a.attributes.length;b++){var c=a.attributes[b];switch(c.name){case"src":case"srcset":case"data-src":case"data-srcset":return}if(/\.(jpg|jpeg|png|webp)/i.test(c.value))return}a.parentNode.removeChild(a)});var c=Array.from(a.getElementsByTagName("noscript"));this._forEachNode(c,function(g){var d=a.createElement("div");if(d.innerHTML=g.innerHTML,this._isSingleImage(d)){var c=g.previousElementSibling;if(c&&this._isSingleImage(c)){var e=c;"IMG"!==e.tagName&&(e=c.getElementsByTagName("img")[0]);for(var h=d.getElementsByTagName("img")[0],i=0;i<e.attributes.length;i++){var b=e.attributes[i];if(""!==b.value&&("src"===b.name||"srcset"===b.name||/\.(jpg|jpeg|png|webp)/i.test(b.value))){if(h.getAttribute(b.name)===b.value)continue;var f=b.name;h.hasAttribute(f)&&(f="data-old-"+f),h.setAttribute(f,b.value)}}g.parentNode.replaceChild(d.firstElementChild,c)}}})},_removeScripts:function(a){this._removeNodes(this._getAllNodesWithTag(a,["script"]),function(a){return a.nodeValue="",a.removeAttribute("src"),!0}),this._removeNodes(this._getAllNodesWithTag(a,["noscript"]))},_hasSingleTagInsideElement:function(a,b){return 1==a.children.length&&a.children[0].tagName===b&&!this._someNode(a.childNodes,function(a){return a.nodeType===this.TEXT_NODE&&this.REGEXPS.hasContent.test(a.textContent)})},_isElementWithoutContent:function(a){return a.nodeType===this.ELEMENT_NODE&&0==a.textContent.trim().length&&(0==a.children.length||a.children.length==a.getElementsByTagName("br").length+a.getElementsByTagName("hr").length)},_hasChildBlockElement:function(a){return this._someNode(a.childNodes,function(a){return this.DIV_TO_P_ELEMS.has(a.tagName)||this._hasChildBlockElement(a)})},_isPhrasingContent:function(a){return a.nodeType===this.TEXT_NODE|| -1!==this.PHRASING_ELEMS.indexOf(a.tagName)||("A"===a.tagName||"DEL"===a.tagName||"INS"===a.tagName)&&this._everyNode(a.childNodes,this._isPhrasingContent)},_isWhitespace:function(a){return a.nodeType===this.TEXT_NODE&&0===a.textContent.trim().length||a.nodeType===this.ELEMENT_NODE&&"BR"===a.tagName},_getInnerText:function(c,a){a=void 0===a||a;var b=c.textContent.trim();return a?b.replace(this.REGEXPS.normalize," "):b},_getCharCount:function(b,a){return a=a||",",this._getInnerText(b).split(a).length-1},_cleanStyles:function(a){if(a&&"svg"!==a.tagName.toLowerCase()){for(var c=0;c<this.PRESENTATIONAL_ATTRIBUTES.length;c++)a.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[c]);-1!==this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(a.tagName)&&(a.removeAttribute("width"),a.removeAttribute("height"));for(var b=a.firstElementChild;null!==b;)this._cleanStyles(b),b=b.nextElementSibling}},_getLinkDensity:function(a){var b=this._getInnerText(a).length;if(0===b)return 0;var c=0;return this._forEachNode(a.getElementsByTagName("a"),function(a){var b=a.getAttribute("href"),d=b&&this.REGEXPS.hashUrl.test(b)?.3:1;c+=this._getInnerText(a).length*d}),c/b},_getClassWeight:function(a){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))return 0;var b=0;return"string"==typeof a.className&&""!==a.className&&(this.REGEXPS.negative.test(a.className)&&(b-=25),this.REGEXPS.positive.test(a.className)&&(b+=25)),"string"==typeof a.id&&""!==a.id&&(this.REGEXPS.negative.test(a.id)&&(b-=25),this.REGEXPS.positive.test(a.id)&&(b+=25)),b},_clean:function(b,a){var c=-1!==["object","embed","iframe"].indexOf(a);this._removeNodes(this._getAllNodesWithTag(b,[a]),function(a){if(c){for(var b=0;b<a.attributes.length;b++)if(this.REGEXPS.videos.test(a.attributes[b].value))return!1;if("object"===a.tagName&&this.REGEXPS.videos.test(a.innerHTML))return!1}return!0})},_hasAncestorTag:function(a,c,b,d){b=b||3,c=c.toUpperCase();for(var e=0;a.parentNode&&(!(b>0)||!(e>b));){if(a.parentNode.tagName===c&&(!d||d(a.parentNode)))return!0;a=a.parentNode,e++}return!1},_getRowAndColumnCount:function(j){for(var g=0,d=0,e=j.getElementsByTagName("tr"),a=0;a<e.length;a++){var b=e[a].getAttribute("rowspan")||0;b&&(b=parseInt(b,10)),g+=b||1;for(var h=0,i=e[a].getElementsByTagName("td"),f=0;f<i.length;f++){var c=i[f].getAttribute("colspan")||0;c&&(c=parseInt(c,10)),h+=c||1}d=Math.max(d,h)}return{rows:g,columns:d}},_markDataTables:function(f){for(var d=f.getElementsByTagName("table"),c=0;c<d.length;c++){var a=d[c];if("presentation"==a.getAttribute("role")||"0"==a.getAttribute("datatable")){a._readabilityDataTable=!1;continue}if(a.getAttribute("summary")){a._readabilityDataTable=!0;continue}var e=a.getElementsByTagName("caption")[0];if(e&&e.childNodes.length>0){a._readabilityDataTable=!0;continue}var g=function(b){return!!a.getElementsByTagName(b)[0]};if(["col","colgroup","tfoot","thead","th"].some(g)){this.log("Data table because found data-y descendant"),a._readabilityDataTable=!0;continue}if(a.getElementsByTagName("table")[0]){a._readabilityDataTable=!1;continue}var b=this._getRowAndColumnCount(a);if(b.rows>=10||b.columns>4){a._readabilityDataTable=!0;continue}a._readabilityDataTable=b.rows*b.columns>10}},_fixLazyImages:function(a){this._forEachNode(this._getAllNodesWithTag(a,["img","picture","figure"]),function(a){if(a.src&&this.REGEXPS.b64DataUrl.test(a.src)){if("image/svg+xml"===this.REGEXPS.b64DataUrl.exec(a.src)[1])return;for(var f=!1,d=0;d<a.attributes.length;d++){var b=a.attributes[d];if("src"!==b.name&&/\.(jpg|jpeg|png|webp)/i.test(b.value)){f=!0;break}}if(f){var h=a.src.search(/base64\s*/i)+7,i=a.src.length-h;i<133&&a.removeAttribute("src")}}if(!a.src&&(!a.srcset||"null"==a.srcset)|| -1!==a.className.toLowerCase().indexOf("lazy")){for(var e=0;e<a.attributes.length;e++)if("src"!==(b=a.attributes[e]).name&&"srcset"!==b.name&&"alt"!==b.name){var c=null;if(/\.(jpg|jpeg|png|webp)\s+\d/.test(b.value)?c="srcset":/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(b.value)&&(c="src"),c){if("IMG"===a.tagName||"PICTURE"===a.tagName)a.setAttribute(c,b.value);else if("FIGURE"===a.tagName&&!this._getAllNodesWithTag(a,["img","picture"]).length){var g=this._doc.createElement("img");g.setAttribute(c,b.value),a.appendChild(g)}}}}})},_getTextDensity:function(a,c){var b=this._getInnerText(a,!0).length;if(0===b)return 0;var d=0,e=this._getAllNodesWithTag(a,c);return this._forEachNode(e,a=>d+=this._getInnerText(a,!0).length),d/b},_cleanConditionally:function(a,b){this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)&&this._removeNodes(this._getAllNodesWithTag(a,[b]),function(a){var k=function(a){return a._readabilityDataTable},d="ul"===b||"ol"===b;if(!d){var n=0,o=this._getAllNodesWithTag(a,["ul","ol"]);this._forEachNode(o,a=>n+=this._getInnerText(a).length),d=n/this._getInnerText(a).length>.9}if("table"===b&&k(a)||this._hasAncestorTag(a,"table",-1,k)||this._hasAncestorTag(a,"code"))return!1;var g=this._getClassWeight(a);if(this.log("Cleaning Conditionally",a),g+0<0)return!0;if(10>this._getCharCount(a,",")){for(var h=a.getElementsByTagName("p").length,f=a.getElementsByTagName("img").length,p=a.getElementsByTagName("li").length-100,q=a.getElementsByTagName("input").length,r=this._getTextDensity(a,["h1","h2","h3","h4","h5","h6"]),i=0,e=this._getAllNodesWithTag(a,["object","embed","iframe"]),c=0;c<e.length;c++){for(var j=0;j<e[c].attributes.length;j++)if(this.REGEXPS.videos.test(e[c].attributes[j].value))return!1;if("object"===e[c].tagName&&this.REGEXPS.videos.test(e[c].innerHTML))return!1;i++}var l=this._getLinkDensity(a),m=this._getInnerText(a).length;return f>1&&h/f<.5&&!this._hasAncestorTag(a,"figure")|| !d&&p>h||q>Math.floor(h/3)|| !d&&r<.9&&m<25&&(0===f||f>2)&&!this._hasAncestorTag(a,"figure")|| !d&&g<25&&l>.2||g>=25&&l>.5||1===i&&m<75||i>1}return!1})},_cleanMatchedNodes:function(b,c){for(var d=this._getNextNode(b,!0),a=this._getNextNode(b);a&&a!=d;)a=c.call(this,a,a.className+" "+a.id)?this._removeAndGetNext(a):this._getNextNode(a)},_cleanHeaders:function(a){let b=this._getAllNodesWithTag(a,["h1","h2"]);this._removeNodes(b,function(a){let b=0>this._getClassWeight(a);return b&&this.log("Removing header with low class weight:",a),b})},_headerDuplicatesTitle:function(a){if("H1"!=a.tagName&&"H2"!=a.tagName)return!1;var b=this._getInnerText(a,!1);return this.log("Evaluating similarity of header:",b,this._articleTitle),this._textSimilarity(this._articleTitle,b)>.75},_flagIsActive:function(a){return(this._flags&a)>0},_removeFlag:function(a){this._flags=this._flags& ~a},_isProbablyVisible:function(a){return(!a.style||"none"!=a.style.display)&&!a.hasAttribute("hidden")&&(!a.hasAttribute("aria-hidden")||"true"!=a.getAttribute("aria-hidden")||a.className&&a.className.indexOf&& -1!==a.className.indexOf("fallback-image"))},parse:function(){if(this._maxElemsToParse>0){var c=this._doc.getElementsByTagName("*").length;if(c>this._maxElemsToParse)throw new Error("Aborting parsing document; "+c+" elements found")}this._unwrapNoscriptImages(this._doc);var f=this._disableJSONLD?{}:this._getJSONLD(this._doc);this._removeScripts(this._doc),this._prepDocument();var a=this._getArticleMetadata(f);this._articleTitle=a.title;var b=this._grabArticle();if(!b)return null;if(this.log("Grabbed: "+b.innerHTML),this._postProcessContent(b),!a.excerpt){var d=b.getElementsByTagName("p");d.length>0&&(a.excerpt=d[0].textContent.trim())}var e=b.textContent;return{title:this._articleTitle,byline:a.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang,content:this._serializer(b),textContent:e,length:e.length,excerpt:a.excerpt,siteName:a.siteName||this._articleSiteName}}}; window.Readability = Readability;