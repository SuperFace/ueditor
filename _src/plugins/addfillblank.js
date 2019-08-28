/**
 * 插入填空题
 * @file
 */

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

UE.commands["fillblank"] = {
  execCommand: function(cmd, format) {
    var me = this;
    var selection = me.selection;
    var range = selection.getRange();

    !range.collapsed && range.deleteContents();

    var count = this.body.getElementsByClassName("ue-blank-item").length;
    count++;

    //stat...插入html时，如果光标获取开始元素是填空<span class=“ue-blank-item”>，就把光标排除到填空<span class=“ue-blank-item>外
    var focusStartNode = me.selection.getStart();  
    var _className = focusStartNode.getAttribute('class');
    if(_className && _className.indexOf("ue-blank-item") != -1){
      me.selection.getRange().setStartAfter(focusStartNode).collapse(true).select(true);
      var newBlankNode = document.createElement("span");
      newBlankNode.innerHTML = '【填空'+(count)+'】';
      domUtils.setAttributes(newBlankNode, {
        class: "ue-blank-item"
      });
      domUtils.insertAfter(focusStartNode, newBlankNode);
    }else{
      this.execCommand("inserthtml", '<span class="ue-blank-item">【填空'+(count)+'】</span>');
    }
    //end....

    setTimeout(function(){
      count = 0;
      var _blankArr = this.body.getElementsByClassName("ue-blank-item");
      if(_blankArr.length > 0){
          for (var i = 0, l = _blankArr.length; i < l; i++) {
              var item = _blankArr[i];
              if(item && domUtils.isEmptyNode(item)){
                domUtils.remove(item);
              }else if(item){
                var _html = item.innerHTML;
                var reg = /\【填空\d+\】.*/g;
                if(reg.test(_html)){
                  count++;
                  var reg = /\【填空\d+\】/g;
                  var txt = '【填空'+count+'】';
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
      setTimeout(function(){
        count = 0;
        var _blankArr = this.body.getElementsByClassName("ue-blank-item");
        if(_blankArr.length > 0){
            for (var i = 0, l = _blankArr.length; i < l; i++) {
                var item = _blankArr[i];
                if(item && domUtils.isEmptyNode(item)){
                  domUtils.remove(item);
                }else if(item){
                  var _html = item.innerHTML;
                  var reg = /\【填空\d+\】.*/g;
                  if(reg.test(_html)){
                    count++;
                    var reg = /\【填空\d+\】/g;
                    var txt = '【填空'+count+'】';
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
      }.bind(me), 200);
    }.bind(me), 0);

  }
};
