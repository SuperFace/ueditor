/**
 * 插入填空题
 * @file
 */
UE.plugins["addfillblank"] = function() {
  var me = this;
  
  me.addListener("keydown", function(type, evt) {
    var keyCode = evt.keyCode || evt.which;
  }.bind(me));

  me.addListener("keyup", function(type, evt) {
    var keyCode = evt.keyCode || evt.which;
  }.bind((me)));

  me.addListener("contentchange", function(e, data) {
    var doc = this.body.ownerDocument;
    //纠正填空结点序号，并将不是完整的填空结点文本化
    if(me.onwClearHandler) clearTimeout(me.onwClearHandler);
    if(me.twoClearHandler) clearTimeout(me.twoClearHandler);

    //遍历
    var traversalNodes = function(node){
      node = node || this.body;
      var nodeChilds = node.childNodes;
      if(nodeChilds.length){
        for(var k=0,l=nodeChilds.length; k<l;k++){
          var item = nodeChilds[k];
          var reg = /\[填空\d+\]/g;
          if(item.nodeType==1){//元素结点
            if(!domUtils.hasClass(item, "blank-item")){//非填空结点，继续遍历
              traversalNodes(item);
            }
          }
          if(item.nodeType==3 && !domUtils.isWhitespace(item) && item.length){//文本结点
            var _html = item.nodeValue;
            if(reg.test(_html)){
              var newBlankNode = doc.createElement("span");
              newBlankNode.innerHTML = _html;
              domUtils.setAttributes(newBlankNode, {
                class: "blank-item",
                style: "display:inline-block;"
              });
              domUtils.insertAfter(item, newBlankNode);
              domUtils.remove(item);
            }
          }
        }
      }
    }.bind(me);

    //重新排序、格式化填空题
    var resetOrder = function(){
      var focusStartNode = me.selection.getStart(); 
      var count = 0;
      var _blankArr = this.body.getElementsByClassName("blank-item");
      if(_blankArr.length > 0){
          for (var i = 0, l = _blankArr.length; i < l; i++) {//遍历填空元素
              var item = _blankArr[i];
              if(item && domUtils.isEmptyNode(item)){//空
                domUtils.remove(item);
              }else if(item){
                var _html = item.innerHTML;
                var reg = /\[填空\d+\]/g;
                var reg1 = /\].*\[/g;
                var regHTML = /<\/?.+?\/?>/g;
                _html = _html.replace(regHTML, '').replace(/\u200B/g,'');
                if(reg.test(_html)){//重新排列序号
                  var txt1 = _html.replace(reg, '');
                  var isMulit = reg1.test(_html);
                  if(txt1 || isMulit){
                    var execObj = null, index1=0, index2=0, itemTxt='';
                    var frag = doc.createDocumentFragment();
                    while(execObj = reg.exec(_html)){
                      itemTxt = execObj[0];
                      index2 = execObj.index;
                      var ssHtml = _html.substring(index1, index2);
                      if(!!ssHtml){
                        ssHtml = ssHtml.replace(/&nbsp;/g, " ");
                        var txtNode = doc.createTextNode(ssHtml);
                        frag.appendChild(txtNode);
                      }

                      var newBlankNode = doc.createElement("span");
                      newBlankNode.innerHTML = '[填空'+(++count)+']';
                      domUtils.setAttributes(newBlankNode, {
                        class: "blank-item",
                        style: "display:inline-block;"
                      });
                      frag.appendChild(newBlankNode);
                      index1 = index2 + itemTxt.length;
                    }
                    var ssHtml = _html.substr(index1);
                    ssHtml = ssHtml.replace(/&nbsp;/g, " ");
                    var txtNode = doc.createTextNode(ssHtml);
                    frag.appendChild(txtNode);
                    domUtils.insertAfter(item, frag);
                    if(focusStartNode == item) focusStartNode = txtNode;
                    domUtils.remove(item);
                    me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
                  }else{
                    var txt = '[填空'+(++count)+']';
                    item.innerHTML = _html.replace(reg, txt);
                  }
                }else{
                  _html = _html.replace(/&nbsp;/g, " ");
                  var txtNode = doc.createTextNode(_html);
                  domUtils.insertAfter(item, txtNode);
                  if(focusStartNode == item) focusStartNode = txtNode;
                  domUtils.remove(item);
                  me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
                }
              }
          }
      }
    }.bind(me);

    me.onwClearHandler = setTimeout(function(){
      //遍历所有文本结点
      traversalNodes();
      //重新排序
      resetOrder();

      me.twoClearHandler = setTimeout(function(){
        //二次重新排序
        resetOrder();
        //规范文本结点
        var focusStartNode = me.selection.getStart(); 
        focusStartNode.normalize();
        focusStartNode.parentNode.normalize();
      }.bind(me), 0);
    }.bind(me), 0);
    //end。。。。
  }.bind(me));

  /**
   * 插入填空题，格式：【填空n】​
   * @command fillblank
   * @method execCommand
   * @param { String } cmd 命令字符串
   * @example
   * ```javascript
   * editor.execCommand( 'fillblank');
   * ```
   */
  me.commands["fillblank"] = {
    execCommand: function(cmd, format) {

      //当前Range是否闭合，如果没有闭合，就删除选区
      //var range = me.selection.getRange();
      //!range.collapsed && range.deleteContents();
      var doc = this.body.ownerDocument;
      var count = this.body.getElementsByClassName("blank-item").length;
      count++;

      //stat...插入html时，如果光标获取开始元素是填空<span class=“blank-item”>，就把光标排除到填空<span class=“blank-item>外
      var _startContainer = me.selection.getRange().startContainer, 
          _startOffset = me.selection.getRange().startOffset, 
          _endContainer = me.selection.getRange().endContainer,
          _endOffset = me.selection.getRange().endOffset,
          _collapsed = me.selection.getRange().collapsed;

      var focusStartNode = me.selection.getStart(); 
      var _className = focusStartNode.getAttribute('class');
      if(_className && _className.indexOf("blank-item") != -1){//当前光标所在结点为填空元素
        //创建填空结点
        var newBlankNode = doc.createElement("span");
        newBlankNode.innerHTML = '[填空'+(count)+']';
        domUtils.setAttributes(newBlankNode, {
          class: "blank-item",
          style: "display:inline-block;"
        });

        if(_collapsed){//闭合选区
          if(_startOffset==0 && _endOffset==0){//光标在文本开头
            focusStartNode = domUtils.insertBefore(focusStartNode, newBlankNode);
            me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
          }else{//光标在文本中，or 文本结尾
            me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
            domUtils.insertAfter(focusStartNode, newBlankNode);
          }
        }else{//非闭合选区
          if(_startContainer==_endContainer 
                && _startContainer.parentNode.getAttribute('class').indexOf("blank-item") != -1){
            me.selection.getRange().setStartAfter(_startContainer.parentNode).collapse(true).select(true);
            domUtils.insertAfter(_startContainer.parentNode, newBlankNode);
          }else{
            this.execCommand("inserthtml", '<span class="blank-item" style="display:inline-block;">[填空'+(count)+']</span>&#8203;');
          }
        }
      }else{//当前光标所在结点为非填空元素
        this.execCommand("inserthtml", '<span class="blank-item" style="display:inline-block;">[填空'+(count)+']</span>&#8203;');
      }
      //end....插入html
    }
  };
};
