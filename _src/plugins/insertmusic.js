/**
 * insertmusic插件， 为UEditor提供音频插入支持
 * @file
 * @since 1.0.0
 */

UE.plugins["insertmusic"] = function() {
  var me = this;
  me.addOutputRule(function(root) {

  });
  me.addInputRule(function(root) {

  });
  me.addListener("keydown", function(type, e) {
    var keyCode = e.keyCode || e.which;
    if(keyCode == 39 || keyCode == 37){
      var audios = me.body.ownerDocument.getElementsByTagName("audio");
      for(var i=0; i<audios.length;i++){
        var ele = audios[i];
        if(!domUtils.getNextDomNode(ele, false)){
          
          var txtNode = me.body.ownerDocument.createElement("span");
          txtNode.innerHTML = "&#8203;";
          domUtils.insertAfter(ele,txtNode);
        }
      }
    }
  }.bind(me));
  me.addListener("keyup", function(type, e) {
    var keyCode = e.keyCode || e.which;
    if(keyCode == 8){
      setTimeout(function(){
        var audios = me.body.ownerDocument.getElementsByTagName("audio");
        for(var i=0; i<audios.length;i++){
          var ele = audios[i];
          if(!domUtils.getNextDomNode(ele, false)){
            var txtNode = me.body.ownerDocument.createElement("span");
            txtNode.innerHTML = "&#8203;";
            domUtils.insertAfter(ele,txtNode);
          }
        }
      }, 300);
    }
  }.bind(me));
  me.addListener("click", function(type, e) {
    var audios = me.body.ownerDocument.getElementsByTagName("audio");
    for(var i=0; i<audios.length;i++){
      var ele = audios[i];
      if(!domUtils.getNextDomNode(ele, false)){
        var txtNode = me.body.ownerDocument.createElement("span");
        txtNode.innerHTML = "&#8203;";
        domUtils.insertAfter(ele,txtNode);
      }
    }
  });
  me.commands["insertmusic"] = {
    execCommand: function(cmd, musicObjs, type) {
      var doc = this.body.ownerDocument;  
      musicObjs = utils.isArray(musicObjs) ? musicObjs : [musicObjs];

      var html = '', id = "tmpMusic", cl, url, align, floatStr = '';
      for (var i = 0, vi, len = musicObjs.length; i < len; i++) {
        vi = musicObjs[i];
        url = vi.url;
        align = vi.align;
        cl = type == "upload"
          ? "insertmusic edui-upload-music"
          : "insertmusic edui-yunpan-music";
        floatStr = '';

        var _html = '';
        floatStr = "margin: 10px;width:"+(vi.width || 258)+"px;height:"+(vi.height || 48)+"px;";
        if(align == "center") floatStr += "display:block;margin:10px auto;";
        else floatStr += 'float:' + align + ';';
        _html += '<span>&#8203;</span><audio class="' + cl + '" controls="controls" controlsList="nodownload" oncontextmenu="return false" preload="auto" width="' + (vi.width || 258) + '" height="' + (vi.height || 48) + '" ' +
        (url ? 'src="' + url + '" style="position:relative;outline:none;vertical-align: middle;' + floatStr + '"'
        : 'style="position:relative;outline:none;opacity:0.5;'  + floatStr  + '"')
        + '>浏览器不支持音频</audio><span>&#8203;</span>';
        if(align == "center") _html = '<p>'+_html+'</p>';
        html += _html;
      }
      this.execCommand("inserthtml", html);
    },
    queryCommandValue: function() {
      var range = this.selection.getRange(),
        startNode,
        floatStyle,
        marginValue;
      if (range.collapsed) {
        return "none";
      }
      startNode = range.getClosedNode();
      if (startNode && startNode.nodeType == 1 && startNode.tagName == "AUDIO") {
        floatStyle =
          domUtils.getComputedStyle(startNode, "float");
          marginValue = domUtils.getComputedStyle(startNode, "margin");
        if (!floatStyle && marginValue.indexOf("auto")!=-1) {
          floatStyle = "center";
        }
        return {
          left: 1,
          right: 1,
          center: 1
        }[floatStyle]
          ? floatStyle
          : "none";
      }
      return "none";
    },
    queryCommandState: function() {
      var _audio = me.selection.getRange().getClosedNode(),
        flag =
        _audio &&
          (_audio.className.indexOf("edui-yunpan-music") != -1 ||
          _audio.className.indexOf("edui-upload-music") != -1);
      return flag ? 1 : 0;
    }
  };
};