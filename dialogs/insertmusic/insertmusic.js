/**
 * 本地插入音频、云盘选择音频、在线音频url链接插入音频
 * 作者：lxl
 * Time: 2019-10-31
 * V: 1.0.0
 */

(function(){

    var uploadMusicList = [],
        selectYanPanMusicList = [],//记录选中的云盘音频id
        selectYanPanMusicObj = {},//记录选中的云盘id:val
        isModifyUploadMusic = false,
        isModifyYunPanMusic = false,
        userRole = null, //请求云盘需要用户身份：(0, u"学校校长"), (1, u"学院主任"), (2, u"老师"), (-2, u"视频管理员")
        universityId = null,//请求云盘需要学校id
        yunpanServerUrl = editor.getOpt('yunpanServerUrl') || "",//云盘列表接口
        uploadFile;

    window.onload = function(){
        userRole = utils.getCookie('user_role') || 0;
        universityId = utils.getCookie('university_id') || 122;
        $(document).on('ajaxSend', function (event, xhr, settings) {
            // 在发送请求之前做些什么
            if(settings.url.indexOf(yunpanServerUrl) != -1){
               
            }
        });

        initTabs();
        initMusic();
        initUpload();
    };

    /* 初始化tab标签 */
    function initTabs(){
        var tabs = $G('tabHeads').children;
        for (var i = 0; i < tabs.length; i++) {
            domUtils.on(tabs[i], "click", function (e) {
                var j, bodyId, target = e.target || e.srcElement;
                for (j = 0; j < tabs.length; j++) {
                    bodyId = tabs[j].getAttribute('data-content-id');
                    if(tabs[j] == target){
                        domUtils.addClass(tabs[j], 'focus');
                        domUtils.addClass($G(bodyId), 'focus');
                        if(bodyId == "yunpan"){
                            //$focus($G("search-input"));
                            fetchYunPanList(true);
                        }
                    }else {
                        domUtils.removeClasses(tabs[j], 'focus');
                        domUtils.removeClasses($G(bodyId), 'focus');
                    }
                }
            });
        }
    }

    /* 切换tab标签 */
    function selectTabs(type){
        var tabs = $G('tabHeads').children;
        for (var i = 0; i < tabs.length; i++) {
            var bodyId = tabs[i].getAttribute('data-content-id');
            domUtils.removeClasses(tabs[i], 'focus');
            domUtils.removeClasses($G(bodyId), 'focus');
            if(bodyId == type){
                domUtils.addClass(tabs[i], 'focus');
                domUtils.addClass($G(bodyId), 'focus');
                if(bodyId == "yunpan"){
                    //$focus($G("search-input"));
                    fetchYunPanList(true);
                }
            }
        }
    }


    function initMusic(){
        createAlignButton( ["musicFloat", "upload_alignment"] );
        addOkListener();
        //addSearchListener();

        //编辑视频时初始化相关信息
        (function(){
            var _audio = editor.selection.getRange().getClosedNode(),
                url;
            if(_audio && _audio.className){
                var hasYunPanClass = _audioclassName.indexOf("edui-yunpan-music")!=-1,
                    hasUploadClass = _audio.className.indexOf("edui-upload-music")!=-1;
                
                if(hasYunPanClass){
                    selectTabs("yunpan");
                    
                    $G("musicWidth").value = _audio.width;
                    $G("musicHeight").value = _audio.height;
                    var align = domUtils.getComputedStyle(_audio,"float"),
                        parentAlign = domUtils.getComputedStyle(_audio.parentNode,"text-align");
                    updateAlignButton(parentAlign==="center"?"center":align, "yunpan");

                    isModifyYunPanMusic = true;
                }
                if(hasUploadClass) {
                    selectTabs("upload");
                    $G("upload_width").value = _audio.width;
                    $G("upload_height").value = _audio.height;
                    var align = domUtils.getComputedStyle(_audio,"float"),
                        parentAlign = domUtils.getComputedStyle(_audio.parentNode,"text-align");
                    updateAlignButton(parentAlign==="center"?"center":align, "upload");

                    isModifyUploadMusic = true;
                }
            }
            //createPreviewMusic(url);
        })();
        
    }

    /**
     * 监听确认和取消两个按钮事件，用户执行插入或者清空正在播放的视频实例操作
     */
    function addOkListener(){
        dialog.onok = function(){

            var currentTab =  findFocus("tabHeads","tabSrc");
            switch(currentTab){
                case "yunpan":
                    return insertYunPan();
                    break;
                case "upload":
                    return insertUpload();
                    break;
            }
        };
        dialog.oncancel = function(){

        };
    }

    //控制云盘面板的状态
    function setYunPanListState(isLoading){
        if(!isLoading){
            $G('filelist-box').style.display = "none";
            $G('loading-wrapper').style.display = "none";
            $G('yunpan-filelist').innerHTML = '';
            $G('yunpan-placeholder').style.display = "block";
        }else{
            $G('filelist-box').style.display = "none";
            $G('yunpan-filelist').innerHTML = '';
            $G('yunpan-placeholder').style.display = "none";
            $G('loading-wrapper').style.display = "block";
        }
        updateYunPanInfo();//更新选中个数
    }

    //显示搜索出来的音频列表
    function showSearchYanPanList(data){
        var sourceFileList = "data" in data && !!data.data && "files" in data.data && utils.isArray(data.data.files) ? data.data.files : [];
        if(sourceFileList.length > 0 || selectYanPanMusicList.length > 0){
            var musicHTML = '';
            if(selectYanPanMusicList.length > 0){
                for(var j=0; j<selectYanPanMusicList.length; j++){
                    var id = selectYanPanMusicList[j];
                    var _music1 = selectYanPanMusicObj[id];
                    // {
                    //     id: id,
                    //     url: durl,
                    //     name: dname,
                    //     size: dsize,
                    //     update_time: dtime
                    // }
                    musicHTML += '<li class="block" durl="' + _music1.url + '" dname="' + _music1.name + '" dsize="' + _music1.size + '" id="' + _music1.id + '" dtime="' + _music1.update_time + '">'
                                + '<p class="title">' + _music1.name + '</p>'
                                + '<p class="imgWrap notimage">'
                                    + '<i class="file-preview file-type-mp3"></i>'
                                + '</p>'
                                + '<span class="edui-checkbox is-checked">'
                                    + '<span class="edui-checkbox_inner"></span>'
                                    + '<input type="checkbox" class="edui-checkbox_original" />'
                                + '</span>'
                              + '</li>';
                }
            }
            if(sourceFileList.length > 0){
                for(var i=0; i<sourceFileList.length; i++){
                    var _music2 = sourceFileList[i];
                    // {
                    //     "file_value": "B430E1746B4484909C33DC5901307461",
                    //     "name": "Wildlife - avi.avi",
                    //     "file_type": 1,
                    //     "size": 22797044,
                    //     "update_time": "2019-10-28 17:06:45",
                    //     "id": 448
                    // }
                    //排重
                    var isExist = false;
                    for(var j=0; j<selectYanPanMusicList.length; j++){
                        var id = selectYanPanMusicList[j];
                        if(id == _music2.id){
                            isExist = true;
                        }
                    }
                    if(!isExist){
                        musicHTML += '<li class="block" durl="' + _music2.file_value + '" dname="' + _music2.name + '" dsize="' + _music2.size + '" id="' + _music2.id + '" dtime="' + _music2.update_time + '">'
                                + '<p class="title">' + _music2.name + '</p>'
                                + '<p class="imgWrap notimage">'
                                    + '<i class="file-preview file-type-mp3"></i>'
                                + '</p>'
                                + '<span class="edui-checkbox">'
                                    + '<span class="edui-checkbox_inner"></span>'
                                    + '<input type="checkbox" class="edui-checkbox_original" />'
                                + '</span>'
                              + '</li>';
                    }
                }
            }
            $G('yunpan-filelist').innerHTML = musicHTML;
            $G('filelist-box').style.display = "block";
            $G('yunpan-placeholder').style.display = "none";
            $G('loading-wrapper').style.display = "none";

            addYunPanFileSelectListener();
        }else{
            setYunPanListState(false);
        }
    }

    //为搜索出来的音频添加click事件
    function addYunPanFileSelectListener(){
        $("#filelist-box").find("li").on("click", function(e){
            if($(this).find(".edui-checkbox").hasClass("is-checked")){
                var id = $(this).attr("id");
                utils.removeItem(selectYanPanMusicList, id);
                delete selectYanPanMusicObj[id];
                updateYunPanInfo();
                $(this).find(".edui-checkbox").removeClass("is-checked");
            }else{
                var id = $(this).attr("id");
                var durl = $(this).attr("durl");
                var dname = $(this).attr("dname");
                var dtime = $(this).attr("dtime");
                selectYanPanMusicList.push(id);
                selectYanPanMusicObj[id] = {
                    id: id,
                    url: durl,
                    name: dname,
                    update_time: dtime
                };
                updateYunPanInfo();
                $(this).find(".edui-checkbox").addClass("is-checked");
            }
        });
    }

    //为云盘音频列表添加事件
    
    function addYunPanTreeMusicListener(){

        $(".folder-closeopen").off("click").on("click", function(e){
            var _folder = $(this).parent().parent();
            var folderId = _folder.attr("did");
            if($(this).hasClass("folder-close")){
                $(this).removeClass("folder-close").addClass("folder-open");
                _folder.children(".box-content").removeClass("show");
            }else{
                $(this).removeClass("folder-open").addClass("folder-close");
                _folder.children(".box-content").addClass("show");
                fetchFolderTreeList(folderId, _folder);
            }
        });
        
        $(".tree-box.file.music").off("click").on("click", function(e){
            if($(this).hasClass("is-checked")){
                var id = $(this).attr("did");
                utils.removeItem(selectYanPanMusicList, id);
                delete selectYanPanMusicObj[id];
                updateYunPanInfo();
                $(this).removeClass("is-checked");
            }else{
                var id = $(this).attr("did");
                var durl = $(this).attr("durl");
                var dname = $(this).attr("dname");
                var dtime = $(this).attr("dtime");
                selectYanPanMusicList.push(id);
                selectYanPanMusicObj[id] = {
                    id: id,
                    url: durl,
                    name: dname,
                    update_time: dtime
                };
                updateYunPanInfo();
                $(this).addClass("is-checked");
            }
        });
    }

    //更新已经选中的云盘音频个数信息
    function updateYunPanInfo(){
        var num = selectYanPanMusicList.length;
        $G('yunpan-info').innerHTML = '已经选中'+num+'个音频';
    }

    function fetchFolderTreeList(folderId, folderDOM){
        if(folderId){
            if(folderDOM.children(".box-content").attr("status") != "loaded"){
                fetchYunPanList(false, folderId, folderDOM);
            } 
        }
    }

    //显示云盘树结构：
    function showYanPanTreeList(init, folderDOM, data){
        var treeList = data && "data" in data && toString.call(data.data) == "[object Array]" ? data.data : [];
        if(treeList.length){
            var treeHTML = '<div class="box-content show" status="loaded">';
            if(init) treeHTML = '<li class="tree-root"><div class="tree-box root folder" did="0"><div class="header"><i class="folder-closeopen folder-close"></i><i class="folder-icon"></i><span class="file-name">全部文件</span></div><div class="box-content show" status="loaded">';
            for(var i=0; i<treeList.length; i++){
                var _file = treeList[i];
                var fileType = _file.file_type;//0-文件夹、1-视频、2-音频、3-文档
                var fileName = _file.name;
                var fileId = _file.id;
                var fileLink = _file.file_value;
                var update_time = _file.update_time;
                
                
                if(fileType == 0){//文件夹
                    treeHTML += '<div class="tree-box folder" dtime="'+update_time+'" dname="'+fileName+'" did="'+fileId+'"><div class="header"><i class="folder-closeopen folder-open"></i><i class="folder-icon"></i><span class="file-name">'+fileName+'</span></div><div class="box-content">'
                             + '<div class="tree-box loading show"><div class="header"><div class="typing_loader"></div></div></div>'
                             +'</div></div>';
                }else if(fileType == 1){//视频
                    treeHTML += '<div class="tree-box file no-music" durl="'+fileLink+'" dtime="'+update_time+'" dname="'+fileName+'" did="'+fileId+'"><div class="header"><i class="file-icon video"></i><span class="file-name">'+fileName+'</span></div></div>';
                }else if(fileType == 2){//音频
                    treeHTML += '<div class="tree-box file music" durl="'+fileLink+'" dtime="'+update_time+'" dname="'+fileName+'" did="'+fileId+'"><div class="header"><i class="file-icon music"></i><span class="file-name">'+fileName+'</span></div></div>';
                }else if(fileType == 3){//文档
                    treeHTML += '<div class="tree-box file no-music" durl="'+fileLink+'" dtime="'+update_time+'" dname="'+fileName+'" did="'+fileId+'"><div class="header"><i class="file-icon txt"></i><span class="file-name">'+fileName+'</span></div></div>';
                }
            }
            if(init){
                treeHTML += '</div></li>';
                $G('yunpan-filelist').innerHTML = treeHTML;
                $G('filelist-box').style.display = "block";
                $G('yunpan-placeholder').style.display = "none";
                $G('loading-wrapper').style.display = "none";
            }else{
                treeHTML += '</div>';
                folderDOM.children(".box-content").remove();
                $(treeHTML).appendTo(folderDOM);
            }
            addYunPanTreeMusicListener();
        }else{
            if(init) setYunPanListState(false);//loading
            else folderDOM.children(".box-content").innerHTML = '<div class="tree-box error"><div class="header">空</div></div>';
        }
    }

    //加载云盘列表初始化、加载数据
    function fetchYunPanList(init, folderId, folderDOM){//init-初始化
        if(init) setYunPanListState(true);//loading
        if(userRole == 0 || userRole == 1 || userRole == 2 || userRole == -2){
            var current_location = folderId || 0;
            $.ajax({
                url: yunpanServerUrl + "?role=" + userRole + "&file_type=-1&current_location=" + current_location,
                type: "GET",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('UNIVERSITY-ID', universityId);
                },
                dataType: "json",
                success: function(data){
                    showYanPanTreeList(init, folderDOM, data);
                },
                error: function(xhr, err, e){
                    showYanPanTreeList(init, folderDOM, null);
                }
            });
        }else{
            if(init) setYunPanListState(false);//loading
            else folderDOM.children(".box-content").innerHTML = '<div class="tree-box error"><div class="header">空</div></div>';
        }
    }

    /**
     * 初始化云盘搜索
     */
    function addSearchListener(){
        setYunPanListState(false);

        domUtils.on($G('search-btn'), "click", function (e) {
            var target = e.target || e.srcElement;
            var searchVal = $G('search-input').value;
            if(!!searchVal){
                setYunPanListState(true);
                $.ajax({
                    //url: "http://apimock.xuetangx.com/mock/131/api/open/yunpan/file/search?role=" + userRole + "&file_type=2&search=" + encodeURIComponent(searchVal),
                    url: yunpanServerUrl + "?role=" + userRole + "&file_type=2&current_location=0",
                    type: "GET",
                    beforeSend: function(xhr){
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.setRequestHeader('UNIVERSITY-ID', universityId);
                    },
                    dataType: "json",
                    success: function(data){
                        showSearchYanPanList(data);
                    },
                    error: function(xhr, err, e){
                        showSearchYanPanList(null);
                    }
                });
            }
        });
    }


    /**
     * 依据传入的align值更新按钮信息
     * @param align
     */
    function updateAlignButton( align, type ) {
        var aligns = null;
        if(type == "yunpan"){
            aligns = $G( "musicFloat" ).children;
        }else if(type == "upload"){
            aligns = $G( "upload_alignment" ).children;
        }
        for ( var i = 0, ci; ci = aligns[i++]; ) {
            if (ci &&  ci.getAttribute( "name" ) == align ) {
                if ( ci.className !="focus" ) {
                    ci.className = "focus";
                }
            } else {
                if (ci &&  ci.className =="focus" ) {
                    ci.className = "";
                }
            }
        }
    }

    /**
     * 将单个音频信息插入编辑器中
     */
    function insertSingle(){
        var width = $G("musicWidth"),
            height = $G("musicHeight"),
            url=$G('musicUrl').value,
            align = findFocus("musicFloat","name");
        if(!url) return false;
        if ( !checkNum( [width, height] ) ) return false;
        editor.execCommand('insertmusic', {
            url: convert_url(url),
            width: width.value,
            height: height.value,
            align: align
        }, isModifyUploadMusic ? 'upload':null);
    }

    //插入云盘音频
    function insertYunPan(){
        var musicObjs=[],
            width = $G('musicWidth').value || 258,
            height = $G('musicHeight').value || 48,
            align = findFocus("musicFloat","name") || 'none';
        if ( !checkNum( [width, height] ) ) return false;

        if(selectYanPanMusicList.length > 0){
            for(var j=0; j<selectYanPanMusicList.length; j++){
                var id = selectYanPanMusicList[j];
                var _music1 = selectYanPanMusicObj[id];
                //雨课堂音频域名替换：
                //    http://st0.ykt.io/Fi_KzW-iVvJxno-3fQgBhjxd8Jds.mp3  
                //    https://qn-st0.yuketang.cn/Fi_KzW-iVvJxno-3fQgBhjxd8Jds.mp3
                _music1.url = _music1.url.replace(/^http:\/\/([a-z|A-Z|0-9]+)\.ykt\.io\/([a-z|A-Z|0-9]+)/g, "https://qn-$1.yuketang.cn/$2");
                musicObjs.push({
                    id: _music1.id,
                    //url: "https://yunpanx.bj.bcebos.com/v1/encodetest/Kalimba%20-%20%E5%89%AF%E6%9C%AC.mp3",
                    url: _music1.url,
                    name: _music1.name,
                    update_time: _music1.update_time,
                    width: width,
                    height: height,
                    align: align
                });
            }
        }
        editor.execCommand('insertmusic', musicObjs, 'yunpan');
    }

    /**
     * 将元素id下的所有代表视频的图片插入编辑器中
     * @param id
     */
    function insertSearch(id){
        var imgs = domUtils.getElementsByTagName($G(id),"img"),
            musicObjs=[];
        for(var i=0,img; img=imgs[i++];){
            if(img.getAttribute("selected")){
                musicObjs.push({
                    url:img.getAttribute("ue_video_url"),
                    width:420,
                    height:280,
                    align:"none"
                });
            }
        }
        editor.execCommand('insertmusic',musicObjs);
    }

    /**
     * 找到id下具有focus类的节点并返回该节点下的某个属性
     * @param id
     * @param returnProperty
     */
    function findFocus( id, returnProperty ) {
        var tabs = $G( id ).children,
                property;
        for ( var i = 0, ci; ci = tabs[i++]; ) {
            if ( ci.className=="focus" ) {
                property = ci.getAttribute( returnProperty );
                break;
            }
        }
        return property;
    }
    function convert_url(url){
        if ( !url ) return '';
        url = utils.trim(url)
            .replace(/v\.youku\.com\/v_show\/id_([\w\-=]+)\.html/i, 'player.youku.com/player.php/sid/$1/v.swf')
            .replace(/(www\.)?youtube\.com\/watch\?v=([\w\-]+)/i, "www.youtube.com/v/$2")
            .replace(/youtu.be\/(\w+)$/i, "www.youtube.com/v/$1")
            .replace(/v\.ku6\.com\/.+\/([\w\.]+)\.html.*$/i, "player.ku6.com/refer/$1/v.swf")
            .replace(/www\.56\.com\/u\d+\/v_([\w\-]+)\.html/i, "player.56.com/v_$1.swf")
            .replace(/www.56.com\/w\d+\/play_album\-aid\-\d+_vid\-([^.]+)\.html/i, "player.56.com/v_$1.swf")
            .replace(/v\.pps\.tv\/play_([\w]+)\.html.*$/i, "player.pps.tv/player/sid/$1/v.swf")
            .replace(/www\.letv\.com\/ptv\/vplay\/([\d]+)\.html.*$/i, "i7.imgs.letv.com/player/swfPlayer.swf?id=$1&autoplay=0")
            .replace(/www\.tudou\.com\/programs\/view\/([\w\-]+)\/?/i, "www.tudou.com/v/$1")
            .replace(/v\.qq\.com\/cover\/[\w]+\/[\w]+\/([\w]+)\.html/i, "static.video.qq.com/TPout.swf?vid=$1")
            .replace(/v\.qq\.com\/.+[\?\&]vid=([^&]+).*$/i, "static.video.qq.com/TPout.swf?vid=$1")
            .replace(/my\.tv\.sohu\.com\/[\w]+\/[\d]+\/([\d]+)\.shtml.*$/i, "share.vrs.sohu.com/my/v.swf&id=$1");

        return url;
    }

    /**
      * 检测传入的所有input框中输入的长宽是否是正数
      * @param nodes input框集合，
      */
     function checkNum( nodes ) {
         for ( var i = 0, ci; ci = nodes[i++]; ) {
             var value = ci.value;
             if ( !isNumber( value ) && value) {
                 alert( lang.numError );
                 ci.value = "";
                 ci.focus();
                 return false;
             }
         }
         return true;
     }

    /**
     * 数字判断
     * @param value
     */
    function isNumber( value ) {
        return /(0|^[1-9]\d*$)/.test( value );
    }

    /**
      * 创建图片浮动选择按钮
      * @param ids
      */
     function createAlignButton( ids ) {
         for ( var i = 0, ci; ci = ids[i++]; ) {
             var floatContainer = $G( ci ),
                     nameMaps = {"none":lang['default'], "left":lang.floatLeft, "right":lang.floatRight, "center":lang.block};
             for ( var j in nameMaps ) {
                 var div = document.createElement( "div" );
                 div.setAttribute( "name", j );
                 if ( j == "none" ) div.className="focus";
                 div.style.cssText = "background:url(images/" + j + "_focus.jpg);";
                 div.setAttribute( "title", nameMaps[j] );
                 floatContainer.appendChild( div );
             }
             switchSelect( ci );
         }
     }

    /**
     * 选择切换
     * @param selectParentId
     */
    function switchSelect( selectParentId ) {
        var selects = $G( selectParentId ).children;
        for ( var i = 0, ci; ci = selects[i++]; ) {
            domUtils.on( ci, "click", function () {
                for ( var j = 0, cj; cj = selects[j++]; ) {
                    cj.className = "";
                    cj.removeAttribute && cj.removeAttribute( "class" );
                }
                this.className = "focus";
            } )
        }
    }

    /**
     * 监听url改变事件
     * @param url
     */
    function addUrlChangeListener(url){
        if (browser.ie) {
            url.onpropertychange = function () {
                createPreviewMusic( this.value );
            }
        } else {
            url.addEventListener( "input", function () {
                createPreviewMusic( this.value );
            }, false );
        }
    }

    /**
     * 根据url生成视频预览
     * @param url
     */
    function createPreviewMusic(url){
        if ( !url )return;

        var str = '<audio controls="controls" preload="auto" width="420" height="280" ' +
                (url ? 'src="' + url + '" style="position:relative;display:block;outline:none;'
                : 'style="position:relative;display:block;outline:none;opacity:0.5;')
                + '></audio>';

        $G("preview").innerHTML = str;
    }


    /* 插入上传音频 */
    function insertUpload(){
        var musicObjs=[],
            uploadDir = editor.getOpt('videoUrlPrefix'),
            width = $G('upload_width').value || 258,
            height = $G('upload_height').value || 48,
            align = findFocus("upload_alignment","name") || 'none';
        if ( !checkNum( [width, height] ) ) return false;
        for(var key in uploadMusicList) {
            var file = uploadMusicList[key];
            var url = uploadDir + file.url;
            //雨课堂音频域名替换：
            //    http://st0.ykt.io/Fi_KzW-iVvJxno-3fQgBhjxd8Jds.mp3  
            //    https://qn-st0.yuketang.cn/Fi_KzW-iVvJxno-3fQgBhjxd8Jds.mp3
            url = url.replace(/^http:\/\/([a-z|A-Z|0-9]+)\.ykt\.io\/([a-z|A-Z|0-9]+)/g, "https://qn-$1.yuketang.cn/$2");
            musicObjs.push({
                url: url,
                name: file.name,
                width:width,
                height:height,
                align:align
            });
        }

        var count = uploadFile.getQueueCount();
        if (count) {
            $('.info', '#queueList').html('<span style="color:red;">' + '还有2个未上传文件'.replace(/[\d]/, count) + '</span>');
            return false;
        } else {
            editor.execCommand('insertmusic', musicObjs, 'upload');
        }
    }

    /*初始化上传标签*/
    function initUpload(){
        uploadFile = new UploadFile('queueList');
    }


    /* 上传附件 */
    function UploadFile(target) {
        this.$wrap = target.constructor == String ? $('#' + target) : $(target);
        this.init();
    }
    UploadFile.prototype = {
        init: function () {
            this.fileList = [];
            this.initContainer();
            this.initUploader();
        },
        initContainer: function () {
            this.$queue = this.$wrap.find('.filelist');
        },
        /* 初始化容器 */
        initUploader: function () {
            var _this = this,
                $ = jQuery,    // just in case. Make sure it's not an other libaray.
                $wrap = _this.$wrap,
            // 图片容器
                $queue = $wrap.find('.filelist'),
            // 状态栏，包括进度和控制按钮
                $statusBar = $wrap.find('.statusBar'),
            // 文件总体选择信息。
                $info = $statusBar.find('.info'),
            // 上传按钮
                $upload = $wrap.find('.uploadBtn'),
            // 上传按钮
                $filePickerBtn = $wrap.find('.filePickerBtn'),
            // 上传按钮
                $filePickerBlock = $wrap.find('.filePickerBlock'),
            // 没选择文件之前的内容。
                $placeHolder = $wrap.find('.placeholder'),
            // 总体进度条
                $progress = $statusBar.find('.progress').hide(),
            // 添加的文件数量
                fileCount = 0,
            // 添加的文件总大小
                fileSize = 0,
            // 优化retina, 在retina下这个值是2
                ratio = window.devicePixelRatio || 1,
            // 缩略图大小
                thumbnailWidth = 113 * ratio,
                thumbnailHeight = 113 * ratio,
            // 可能有pedding, ready, uploading, confirm, done.
                state = '',
            // 所有文件的进度信息，key为file id
                percentages = {},
                supportTransition = (function () {
                    var s = document.createElement('p').style,
                        r = 'transition' in s ||
                            'WebkitTransition' in s ||
                            'MozTransition' in s ||
                            'msTransition' in s ||
                            'OTransition' in s;
                    s = null;
                    return r;
                })(),
            // WebUploader实例
                uploader,
                actionUrl = editor.getActionUrl(editor.getOpt('musicActionName')),
                fileMaxSize = editor.getOpt('videoMaxSize'),
                acceptExtensions = ([".ogg", ".mp3", ".wav"]).join('').replace(/\./g, ',').replace(/^[,]/, '');
            if (!WebUploader.Uploader.support()) {
                $('#filePickerReady').after($('<div>').html(lang.errorNotSupport)).hide();
                return;
            } else if (!editor.getOpt('musicActionName')) {
                $('#filePickerReady').after($('<div>').html(lang.errorLoadConfig)).hide();
                return;
            }

            uploader = _this.uploader = WebUploader.create({
                pick: {
                    id: '#filePickerReady',
                    label: lang.uploadSelectFile
                },
                swf: '../../third-party/webuploader/Uploader.swf',
                server: actionUrl,
                fileVal: editor.getOpt('videoFieldName'),
                duplicate: true,
                fileSingleSizeLimit: fileMaxSize,
                compress: false
            });
            uploader.addButton({
                id: '#filePickerBlock'
            });
            uploader.addButton({
                id: '#filePickerBtn',
                label: lang.uploadAddFile
            });

            setState('pedding');

            // 当有文件添加进来时执行，负责view的创建
            function addFile(file) {
                var $li = $('<li id="' + file.id + '">' +
                        '<p class="title">' + file.name + '</p>' +
                        '<p class="imgWrap"></p>' +
                        '<p class="progress"><span></span></p>' +
                        '</li>'),

                    $btns = $('<div class="file-panel">' +
                        '<span class="cancel">' + lang.uploadDelete + '</span>' +
                        '<span class="rotateRight">' + lang.uploadTurnRight + '</span>' +
                        '<span class="rotateLeft">' + lang.uploadTurnLeft + '</span></div>').appendTo($li),
                    $prgress = $li.find('p.progress span'),
                    $wrap = $li.find('p.imgWrap'),
                    $info = $('<p class="error"></p>').hide().appendTo($li),

                    showError = function (code) {
                        switch (code) {
                            case 'exceed_size':
                                text = lang.errorExceedSize;
                                break;
                            case 'interrupt':
                                text = lang.errorInterrupt;
                                break;
                            case 'http':
                                text = lang.errorHttp;
                                break;
                            case 'not_allow_type':
                                text = lang.errorFileType;
                                break;
                            default:
                                text = lang.errorUploadRetry;
                                break;
                        }
                        $info.text(text).show();
                    };

                if (file.getStatus() === 'invalid') {
                    showError(file.statusText);
                } else {
                    $wrap.text(lang.uploadPreview);
                    if ('|png|jpg|jpeg|bmp|gif|'.indexOf('|'+file.ext.toLowerCase()+'|') == -1) {
                        $wrap.empty().addClass('notimage').append('<i class="file-preview file-type-' + file.ext.toLowerCase() + '"></i>' +
                            '<span class="file-title">' + file.name + '</span>');
                    } else {
                        if (browser.ie && browser.version <= 7) {
                            $wrap.text(lang.uploadNoPreview);
                        } else {
                            uploader.makeThumb(file, function (error, src) {
                                if (error || !src || (/^data:/.test(src) && browser.ie && browser.version <= 7)) {
                                    $wrap.text(lang.uploadNoPreview);
                                } else {
                                    var $img = $('<img src="' + src + '">');
                                    $wrap.empty().append($img);
                                    $img.on('error', function () {
                                        $wrap.text(lang.uploadNoPreview);
                                    });
                                }
                            }, thumbnailWidth, thumbnailHeight);
                        }
                    }
                    percentages[ file.id ] = [ file.size, 0 ];
                    file.rotation = 0;

                    /* 检查文件格式 */
                    if (!file.ext || acceptExtensions.indexOf(file.ext.toLowerCase()) == -1) {
                        showError('not_allow_type');
                        uploader.removeFile(file);
                    }
                }

                file.on('statuschange', function (cur, prev) {
                    if (prev === 'progress') {
                        $prgress.hide().width(0);
                    } else if (prev === 'queued') {
                        $li.off('mouseenter mouseleave');
                        $btns.remove();
                    }
                    // 成功
                    if (cur === 'error' || cur === 'invalid') {
                        showError(file.statusText);
                        percentages[ file.id ][ 1 ] = 1;
                    } else if (cur === 'interrupt') {
                        showError('interrupt');
                    } else if (cur === 'queued') {
                        percentages[ file.id ][ 1 ] = 0;
                    } else if (cur === 'progress') {
                        $info.hide();
                        $prgress.css('display', 'block');
                    } else if (cur === 'complete') {
                    }

                    $li.removeClass('state-' + prev).addClass('state-' + cur);
                });

                $li.on('mouseenter', function () {
                    $btns.stop().animate({height: 30});
                });
                $li.on('mouseleave', function () {
                    $btns.stop().animate({height: 0});
                });

                $btns.on('click', 'span', function () {
                    var index = $(this).index(),
                        deg;

                    switch (index) {
                        case 0:
                            uploader.removeFile(file);
                            return;
                        case 1:
                            file.rotation += 90;
                            break;
                        case 2:
                            file.rotation -= 90;
                            break;
                    }

                    if (supportTransition) {
                        deg = 'rotate(' + file.rotation + 'deg)';
                        $wrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    } else {
                        $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
                    }

                });

                $li.insertBefore($filePickerBlock);
            }

            // 负责view的销毁
            function removeFile(file) {
                var $li = $('#' + file.id);
                delete percentages[ file.id ];
                updateTotalProgress();
                $li.off().find('.file-panel').off().end().remove();
            }

            function updateTotalProgress() {
                var loaded = 0,
                    total = 0,
                    spans = $progress.children(),
                    percent;

                $.each(percentages, function (k, v) {
                    total += v[ 0 ];
                    loaded += v[ 0 ] * v[ 1 ];
                });

                percent = total ? loaded / total : 0;

                spans.eq(0).text(Math.round(percent * 100) + '%');
                spans.eq(1).css('width', Math.round(percent * 100) + '%');
                updateStatus();
            }

            function setState(val, files) {

                if (val != state) {

                    var stats = uploader.getStats();

                    $upload.removeClass('state-' + state);
                    $upload.addClass('state-' + val);

                    switch (val) {

                        /* 未选择文件 */
                        case 'pedding':
                            $queue.addClass('element-invisible');
                            $statusBar.addClass('element-invisible');
                            $placeHolder.removeClass('element-invisible');
                            $progress.hide(); $info.hide();
                            uploader.refresh();
                            break;

                        /* 可以开始上传 */
                        case 'ready':
                            $placeHolder.addClass('element-invisible');
                            $queue.removeClass('element-invisible');
                            $statusBar.removeClass('element-invisible');
                            $progress.hide(); $info.show();
                            $upload.text(lang.uploadStart);
                            uploader.refresh();
                            break;

                        /* 上传中 */
                        case 'uploading':
                            $progress.show(); $info.hide();
                            $upload.text(lang.uploadPause);
                            break;

                        /* 暂停上传 */
                        case 'paused':
                            $progress.show(); $info.hide();
                            $upload.text(lang.uploadContinue);
                            break;

                        case 'confirm':
                            $progress.show(); $info.hide();
                            $upload.text(lang.uploadStart);

                            stats = uploader.getStats();
                            if (stats.successNum && !stats.uploadFailNum) {
                                setState('finish');
                                return;
                            }
                            break;

                        case 'finish':
                            $progress.hide(); $info.show();
                            if (stats.uploadFailNum) {
                                $upload.text(lang.uploadRetry);
                            } else {
                                $upload.text(lang.uploadStart);
                            }
                            break;
                    }

                    state = val;
                    updateStatus();

                }

                if (!_this.getQueueCount()) {
                    $upload.addClass('disabled')
                } else {
                    $upload.removeClass('disabled')
                }

            }

            function updateStatus() {
                var text = '', stats;

                if (state === 'ready') {
                    text = lang.updateStatusReady.replace('_', fileCount <= 0 ? 0 : fileCount).replace('_KB', WebUploader.formatSize(fileSize <= 0 ? 0 : fileSize));
                } else if (state === 'confirm') {
                    stats = uploader.getStats();
                    if (stats.uploadFailNum) {
                        text = lang.updateStatusConfirm.replace('_', stats.successNum).replace('_', stats.successNum);
                    }
                } else {
                    stats = uploader.getStats();
                    text = lang.updateStatusFinish.replace('_', fileCount).
                        replace('_KB', WebUploader.formatSize(fileSize)).
                        replace('_', stats.successNum);

                    if (stats.uploadFailNum) {
                        text += lang.updateStatusError.replace('_', stats.uploadFailNum);
                    }
                }

                $info.html(text);
            }

            uploader.on('fileQueued', function (file) {
                fileCount++;
                fileSize += file.size;

                if (fileCount === 1) {
                    $placeHolder.addClass('element-invisible');
                    $statusBar.show();
                }

                addFile(file);
            });

            uploader.on('fileDequeued', function (file) {
                fileCount--;
                fileSize -= file.size;

                removeFile(file);
                updateTotalProgress();
            });

            uploader.on('filesQueued', function (file) {
                if (!uploader.isInProgress() && (state == 'pedding' || state == 'finish' || state == 'confirm' || state == 'ready')) {
                    setState('ready');
                }
                updateTotalProgress();
            });

            uploader.on('all', function (type, files) {
                switch (type) {
                    case 'uploadFinished':
                        setState('confirm', files);
                        break;
                    case 'startUpload':
                        /* 添加额外的GET参数 */
                        var params = utils.serializeParam(editor.queryCommandValue('serverparam')) || '',
                            url = utils.formatUrl(actionUrl + (actionUrl.indexOf('?') == -1 ? '?':'&') + 'encode=utf-8&' + params);
                        uploader.option('server', url);
                        setState('uploading', files);
                        break;
                    case 'stopUpload':
                        setState('paused', files);
                        break;
                }
            });

            uploader.on('uploadBeforeSend', function (file, data, header) {
                //这里可以通过data对象添加POST参数
                if (actionUrl.toLowerCase().indexOf('jsp') != -1) {
                    header['X_Requested_With'] = 'XMLHttpRequest';
                }
            });

            uploader.on('uploadProgress', function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress span');

                $percent.css('width', percentage * 100 + '%');
                percentages[ file.id ][ 1 ] = percentage;
                updateTotalProgress();
            });

            uploader.on('uploadSuccess', function (file, ret) {
                var $file = $('#' + file.id);
                try {
                    var responseText = (ret._raw || ret),
                        json = utils.str2json(responseText);
                    if (json.state == 'SUCCESS') {
                        uploadMusicList.push({
                            'url': json.url,
                            'type': json.type,
                            'name': file.name,
                            'original':json.original
                        });
                        $file.append('<span class="success"></span>');
                    } else {
                        $file.find('.error').text(json.state).show();
                    }
                } catch (e) {
                    $file.find('.error').text(lang.errorServerUpload).show();
                }
            });

            uploader.on('uploadError', function (file, code) {
            });
            uploader.on('error', function (code, file) {
                if (code == 'Q_TYPE_DENIED' || code == 'F_EXCEED_SIZE') {
                    addFile(file);
                }
            });
            uploader.on('uploadComplete', function (file, ret) {
            });

            $upload.on('click', function () {
                if ($(this).hasClass('disabled')) {
                    return false;
                }

                if (state === 'ready') {
                    uploader.upload();
                } else if (state === 'paused') {
                    uploader.upload();
                } else if (state === 'uploading') {
                    uploader.stop();
                }
            });

            $upload.addClass('state-' + state);
            updateTotalProgress();
        },
        getQueueCount: function () {
            var file, i, status, readyFile = 0, files = this.uploader.getFiles();
            for (i = 0; file = files[i++]; ) {
                status = file.getStatus();
                if (status == 'queued' || status == 'uploading' || status == 'progress') readyFile++;
            }
            return readyFile;
        },
        refresh: function(){
            this.uploader.refresh();
        }
    };

})();