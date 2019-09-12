/**
 * 插入填空题
 * @file
 */
UE.plugins["addfillblank"] = function() {
  var me = this;

  me.addListener("keydown", function(type, evt) {
    console.log("keydown");
    var keyCode = evt.keyCode || evt.which;

  }.bind(me));

  me.addListener("keyup", function(type, evt) {
    console.log("keyup");
    var keyCode = evt.keyCode || evt.which;

    //当前焦点开始结点
    var focusStartNode = me.selection.getStart(); 
    //规范文本结点
    focusStartNode.normalize();
    focusStartNode.parentNode.normalize();
    
    if(me.mergeBlanktxtHandler) clearTimeout(me.mergeBlanktxtHandler);
    me.mergeBlanktxtHandler = setTimeout(function(){
      var count = 0;
      var _blankArr = this.body.getElementsByClassName("blank-item");
      if(_blankArr.length > 0){
          for (var i = 0, l = _blankArr.length; i < l; i++) {
              var item = _blankArr[i];
              if(item && domUtils.isEmptyNode(item)){
                domUtils.remove(item);
              }else if(item){
                var _html = item.innerHTML;
                var reg = /\[填空\d+\].*/g;
                if(reg.test(_html)){
                  count++;
                  var reg = /\[填空\d+\]/g;
                  var reg1 = /\[.*填.*空[^\d]*\d+.*\]/g;
                  var txt = '[填空'+count+']';
                  _html = _html.replace(reg, txt);
                  var txtArr = _html.replace(reg1, ' ').split(' ');
                  var txtLeft = txtArr[0];
                  var txtRight = txtArr[1];
                  if(txtRight){
                    var txtRightNode = document.createTextNode(txtRight);
                    domUtils.insertAfter(item, txtRightNode);
                    _html = _html.replace(txtRight, '');
                    me.selection.getRange().setStartAfter(txtRightNode).collapse(true).select(true);
                  }
                }else{
                  var txtNode = document.createTextNode(_html);
                  domUtils.insertAfter(item, txtNode);
                  domUtils.remove(item);
                }
              }
          }
      }
    }.bind(me), 500);
  }.bind((me)));

  me.addListener("contentchange", function() {
    console.log("contentchange");
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
        var newBlankNode = document.createElement("span");
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
            this.execCommand("inserthtml", '<span class="blank-item" style="display:inline-block;">[填空'+(count)+']</span>');
          }
        }
      }else{//当前光标所在结点为非填空元素
        this.execCommand("inserthtml", '<span class="blank-item" style="display:inline-block;">[填空'+(count)+']</span>');
      }
      //规范化文本结点
      focusStartNode.normalize();
      focusStartNode.parentNode.normalize();
      //end....插入html
      
      //纠正填空结点序号，并将不是完整的填空结点文本化
      if(me.twoClearHandler) clearTimeout(me.twoClearHandler);
      setTimeout(function(){
        count = 0;
        var _blankArr = this.body.getElementsByClassName("blank-item");
        if(_blankArr.length > 0){
            for (var i = 0, l = _blankArr.length; i < l; i++) {//遍历填空元素
                var item = _blankArr[i];
                if(item && domUtils.isEmptyNode(item)){//空
                  domUtils.remove(item);
                }else if(item){
                  var _html = item.innerHTML;
                  var reg = /\[填空\d+\].*/g;

                  if(reg.test(_html)){//重新排列序号
                    count++;
                    var reg = /\[填空\d+\]/g;
                    var txt = '[填空'+count+']';
                    item.innerHTML = _html.replace(reg, txt);
                    var txt1 = _html.replace(reg, '');
                    if(txt1){
                      var txt1Node = document.createTextNode(txt1);
                      domUtils.insertAfter(item, txt1Node);
                      item.innerHTML = _html.replace(txt1, '');
                      me.selection.getRange().setStartAfter(txt1Node).collapse(true).select(true);
                    }
                  }else{
                    var txtNode = document.createTextNode(_html);
                    domUtils.insertAfter(item, txtNode);
                    domUtils.remove(item);
                  }
                }
            }
        }
        //二次纠正
        me.twoClearHandler = setTimeout(function(){
          count = 0;
          var _blankArr = this.body.getElementsByClassName("blank-item");
          if(_blankArr.length > 0){
              for (var i = 0, l = _blankArr.length; i < l; i++) {
                  var item = _blankArr[i];
                  if(item && domUtils.isEmptyNode(item)){
                    domUtils.remove(item);
                  }else if(item){
                    var _html = item.innerHTML;
                    var reg = /\[填空\d+\].*/g;
                    if(reg.test(_html)){
                      count++;
                      var reg = /\[填空\d+\]/g;
                      var txt = '[填空'+count+']';
                      item.innerHTML = _html.replace(reg, txt);
                      var txt1 = _html.replace(reg, '');
                      if(txt1){
                        var txt1Node = document.createTextNode(txt1);
                        domUtils.insertAfter(item, txt1Node);
                        item.innerHTML = _html.replace(txt1, '');
                      }
                    }else{
                      var txtNode = document.createTextNode(_html);
                      domUtils.insertAfter(item, txtNode);
                      domUtils.remove(item);
                    }
                  }
              }
          }
          setTimeout(function(){
            //当前焦点开始结点
            var focusStartNode = me.selection.getStart(); 
            //规范文本结点
            focusStartNode.normalize();
            focusStartNode.parentNode.normalize();
          }.bind(me), 100);
        }.bind(me), 200);
      }.bind(me), 0);
      //end。。。。
    }
  };
};
