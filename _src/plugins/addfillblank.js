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


    var count = 0;
    var blankArr = this.body.getElementsByTagName('span');
    if(blankArr.length > 0){
        for (var i = 0, l = blankArr.length; i < l; i++) {
            var item = blankArr[i];
            var _className = item.getAttribute('class');
            if(_className && _className.indexOf("blank-item") != -1){
                count++;
            } 
        }
    }
    this.execCommand("inserthtml", '<span class="blank-item">【填空'+(++count)+'】</span>');
  }
};
