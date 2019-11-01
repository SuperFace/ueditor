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

          //stat...插入html时，如果光标获取开始元素是填空<span class=“blank-item”>，就把光标排除到填空<span class=“blank-item>外
          var _startContainer = me.selection.getRange().startContainer, 
              _startOffset = me.selection.getRange().startOffset, 
              _endContainer = me.selection.getRange().endContainer,
              _endOffset = me.selection.getRange().endOffset,
              _collapsed = me.selection.getRange().collapsed;

          var focusStartNode = me.selection.getStart(); 
          var _className = focusStartNode.getAttribute('class');
          if(_className && _className.indexOf("blank-item") != -1){//当前光标所在结点为填空元素
            //创建音频节点
            var newAudio = doc.createElement("audio");
            floatStr = "margin:10px;width:"+(vi.width || 258)+"px;height:"+(vi.height || 48)+"px;";
            if(align == "left" || align == "right") floatStr += "display:block;float:" + align + ";";
            if(align == "center") floatStr += "display:block;margin:10px auto;";
            domUtils.setAttributes(newAudio, {
              url: url,
              class: cl,
              style: "position:relative;outline:none;" + floatStr,
              width: vi.width || 258,
              height: vi.height || 48,
              controlsList: "nodownload", 
              oncontextmenu: "return false"
            });
            // var pCenter = null;
            // if(align == "center"){
            //   pCenter = doc.createElement("p");
            //   domUtils.setAttributes(pCenter, {
            //     style: "text-align: center;"
            //   });
            //   pCenter.appendChild(newAudio);
            // }

            if(_collapsed){//闭合选区
              if(_startOffset==0 && _endOffset==0){//光标在文本开头
                // if(align == "center"){
                //   focusStartNode = domUtils.insertBefore(focusStartNode, pCenter);
                // }else{
                //   focusStartNode = domUtils.insertBefore(focusStartNode, newAudio); 
                // }
                focusStartNode = domUtils.insertBefore(focusStartNode, newAudio); 
                me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
              }else{//光标在文本中，or 文本结尾
                me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
                // if(align == "center"){
                //   domUtils.insertAfter(focusStartNode, pCenter);
                // }else{
                //   domUtils.insertAfter(focusStartNode, newAudio);
                // }
                domUtils.insertAfter(focusStartNode, newAudio);
                me.selection.getRange().setStartAfter(newAudio).collapse(true).select(true);
              }
            }else{//非闭合选区
              if(_startContainer==_endContainer 
                    && _startContainer.parentNode.getAttribute('class').indexOf("blank-item") != -1){
                me.selection.getRange().setStartAfter(_startContainer.parentNode).collapse(true).select(true);
                // if(align == "center"){
                //   domUtils.insertAfter(_startContainer.parentNode, pCenter);
                // }else{
                //   domUtils.insertAfter(_startContainer.parentNode, newAudio);
                // }
                domUtils.insertAfter(_startContainer.parentNode, newAudio);
                me.selection.getRange().setStartAfter(newAudio).collapse(true).select(true);
              }else{
                html = '';
                //if(align == "center") html += '<p style="text-align:center;">';
                floatStr = "margin: 10px;width:"+(vi.width || 258)+"px;height:"+(vi.height || 48)+"px;";
                if(align == "left" || align == "right") floatStr += 'display:block;float:' + align + ';';
                if(align == "center") floatStr += "display:block;margin:10px auto;";
                html += '<audio class="' + cl + '" controls="controls" controlsList="nodownload" oncontextmenu="return false" preload="auto" width="' + (vi.width || 258) + '" height="' + (vi.height || 48) + '" ' +
                (url ? 'src="' + url + '" style="position:relative;outline:none;' + floatStr + '"'
                : 'style="position:relative;outline:none;opacity:0.5;'  + floatStr  + '"')
                + '></audio>';
                //if(align == "center") html += '</p>';
                this.execCommand("inserthtml", html);
              }
            }
          }else{//当前光标所在结点为非填空元素
            html = '';
            //if(align == "center") html += '<p style="text-align:center;">';
            floatStr = "margin: 10px;width:"+(vi.width || 258)+"px;height:"+(vi.height || 48)+"px;";
            if(align == "left" || align == "right") floatStr += 'display:block;float:' + align + ';';
            if(align == "center") floatStr += "display:block;margin:10px auto;";
            html += '<audio class="' + cl + '" controls="controls" controlsList="nodownload" oncontextmenu="return false" preload="auto" width="' + (vi.width || 258) + '" height="' + (vi.height || 48) + '" ' +
            (url ? 'src="' + url + '" style="position:relative;outline:none;' + floatStr + '"'
            : 'style="position:relative;outline:none;opacity:0.5;'  + floatStr  + '"')
            + '></audio>';
            //if(align == "center") html += '</p>';
            this.execCommand("inserthtml", html);
          }
        }
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