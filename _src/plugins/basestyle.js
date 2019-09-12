/**
 * B、I、sub、super命令支持
 * @file
 * @since 1.2.6.1
 */

UE.plugins["basestyle"] = function() {
  /**
     * 字体加粗
     * @command bold
     * @param { String } cmd 命令字符串
     * @remind 对已加粗的文本内容执行该命令， 将取消加粗
     * @method execCommand
     * @example
     * ```javascript
     * //editor是编辑器实例
     * //对当前选中的文本内容执行加粗操作
     * //第一次执行， 文本内容加粗
     * editor.execCommand( 'bold' );
     *
     * //第二次执行， 文本内容取消加粗
     * editor.execCommand( 'bold' );
     * ```
     */

  /**
     * 字体倾斜
     * @command italic
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @remind 对已倾斜的文本内容执行该命令， 将取消倾斜
     * @example
     * ```javascript
     * //editor是编辑器实例
     * //对当前选中的文本内容执行斜体操作
     * //第一次操作， 文本内容将变成斜体
     * editor.execCommand( 'italic' );
     *
     * //再次对同一文本内容执行， 则文本内容将恢复正常
     * editor.execCommand( 'italic' );
     * ```
     */

  /**
     * 下标文本，与“superscript”命令互斥
     * @command subscript
     * @method execCommand
     * @remind  把选中的文本内容切换成下标文本， 如果当前选中的文本已经是下标， 则该操作会把文本内容还原成正常文本
     * @param { String } cmd 命令字符串
     * @example
     * ```javascript
     * //editor是编辑器实例
     * //对当前选中的文本内容执行下标操作
     * //第一次操作， 文本内容将变成下标文本
     * editor.execCommand( 'subscript' );
     *
     * //再次对同一文本内容执行， 则文本内容将恢复正常
     * editor.execCommand( 'subscript' );
     * ```
     */

  /**
     * 上标文本，与“subscript”命令互斥
     * @command superscript
     * @method execCommand
     * @remind 把选中的文本内容切换成上标文本， 如果当前选中的文本已经是上标， 则该操作会把文本内容还原成正常文本
     * @param { String } cmd 命令字符串
     * @example
     * ```javascript
     * //editor是编辑器实例
     * //对当前选中的文本内容执行上标操作
     * //第一次操作， 文本内容将变成上标文本
     * editor.execCommand( 'superscript' );
     *
     * //再次对同一文本内容执行， 则文本内容将恢复正常
     * editor.execCommand( 'superscript' );
     * ```
     */
  var basestyles = {
    bold: ["strong", "b"],
    italic: ["em", "i"],
    subscript: ["sub"],
    superscript: ["sup"]
  },
    getObj = function(editor, tagNames) {
      return domUtils.filterNodeList(
        editor.selection.getStartElementPath(),
        tagNames
      );
    },
    me = this;
  //添加快捷键
  me.addshortcutkey({
    Bold: "ctrl+66", //^B
    Italic: "ctrl+73", //^I
    Underline: "ctrl+85" //^U
  });
  me.addInputRule(function(root) {
    utils.each(root.getNodesByTagName("b i"), function(node) {
      switch (node.tagName) {
        case "b":
          node.tagName = "strong";
          break;
        case "i":
          node.tagName = "em";
      }
    });
  });
  for (var style in basestyles) {
    (function(cmd, tagNames) {
      me.commands[cmd] = {
        execCommand: function(cmdName) {
          //填空题
          var range = me.selection.getRange();
          var _startContainer = range.startContainer, 
              _endContainer = range.endContainer;
          if(_startContainer.nodeType==3 && domUtils.hasClass(_startContainer.parentNode, "blank-item")){
            range.setStartBefore(_startContainer.parentNode);
          }
          if(_endContainer.nodeType==3 && domUtils.hasClass(_endContainer.parentNode, "blank-item")){
            range.setEndAfter(_endContainer.parentNode);
          }

          setTimeout(function(){
            range = me.selection.getRange(),
            obj = getObj(this, tagNames);
            if (range.collapsed) {
              if (obj) {
                var tmpText = me.document.createTextNode("");
                range.insertNode(tmpText).removeInlineStyle(tagNames);
                range.setStartBefore(tmpText);
                domUtils.remove(tmpText);
              } else {
                var tmpNode = range.document.createElement(tagNames[0]);
                if (cmdName == "superscript" || cmdName == "subscript") {
                  tmpText = me.document.createTextNode("");
                  range
                    .insertNode(tmpText)
                    .removeInlineStyle(["sub", "sup"])
                    .setStartBefore(tmpText)
                    .collapse(true);
                }
                range.insertNode(tmpNode).setStart(tmpNode, 0);
              }
              range.collapse(true);
            } else {
              if (cmdName == "superscript" || cmdName == "subscript") {
                if (!obj || obj.tagName.toLowerCase() != cmdName) {
                  range.removeInlineStyle(["sub", "sup"]);
                }
              }
              obj
                ? range.removeInlineStyle(tagNames)
                : range.applyInlineStyle(tagNames[0]);
            }
            range.select();

            setTimeout(function(){
              //删除产生的空填空结点
              var _blankArr = this.body.getElementsByClassName("blank-item");
              if(_blankArr.length > 0){
                  for (var i = 0, l = _blankArr.length; i < l; i++) {//遍历填空元素
                      var item = _blankArr[i];
                      if(item && domUtils.isEmptyNode(item)){//空
                        domUtils.remove(item);
                      }else if(item){
                       
                      }
                  }
              }

              //当前焦点开始结点
              var focusStartNode = me.selection.getStart(); 
              //规范文本结点
              focusStartNode.normalize();
              focusStartNode.parentNode.normalize();
            }.bind(me), 200);
          }.bind(me), 100);

        },
        queryCommandState: function() {
          return getObj(this, tagNames) ? 1 : 0;
        }
      };
    })(style, basestyles[style]);
  }
};
