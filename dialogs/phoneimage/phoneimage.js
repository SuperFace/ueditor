/**
 * User: Jinqn
 * Date: 14-04-08
 * Time: 下午16:34
 * 上传图片对话框逻辑代码,包括tab: 远程图片/上传图片/在线图片/搜索图片
 */

(function () {

    var uploadImage, 
        hostName,
        guideImgs = {
            "yuketang": "//storagecdn.xuetangx.com/public_assets/xuetangx/images/12ec0f4ace133aeb81571c3bc84d2524.yuketang-3x.png",//雨课堂
            "huanghe": "//storagecdn.xuetangx.com/public_assets/xuetangx/images/058534418bdef25506bb20825b3d600c.huanghe-3x.png",//黄河
            "hetang": "//storagecdn.xuetangx.com/public_assets/xuetangx/images/be40595f74dd8005d732d09bd65b00b4.hetang-3x.png",//荷塘
            "changjiang": "//storagecdn.xuetangx.com/public_assets/xuetangx/images/237ec3c31f6ff3a135ad956717cca57c.changjiang-3x.png"//长江
        };

    window.onload = function () {
        init();
        initButtons();
    };

    /* 初始化tab标签 */
    function init() {
        hostName = window.location.hostname;

        uploadImage = uploadImage || new UploadImage('tabbody');
    }

    /* 初始化onok事件 */
    function initButtons() {

        dialog.onok = function () {
            var list = uploadImage.getInsertList();

            if(list) {
                editor.execCommand('insertimage', list);
            }
        };
    }


    /* 获取图片的原始尺寸 */
    function getImgNaturalStyle(imgUrl, callback) { 
        var nWidth, nHeight;
        // if (img.naturalWidth) { // 现代浏览器
        //     nWidth = img.naturalWidth;
        //     nHeight = img.naturalHeight;
        // } else { // 传统方式
            var image = new Image();
            image.src = imgUrl;
            if(image.complete){
                callback(image.width, image.height);
                image = null;
            }else{
                image.onload = function () {
                    callback(image.width, image.height);
                    image = null;
                };
            }
        //}
    }
    
    /* 上传图片 */
    function UploadImage(target) {
        this.$wrap = target.constructor == String ? $('#' + target) : $(target);
        this.init();
    }
    UploadImage.prototype = {
        init: function () {
            var guideImgSrc = guideImgs.yuketang;
            if(/www\.yuketang\.cn/ig.test(hostName)){
                guideImgSrc = guideImgs.yuketang;
            }else if(/pro\.yuketang\.cn/ig.test(hostName)){
                guideImgSrc = guideImgs.huanghe;
            }else if(/changjiang\.yuketang\.cn/ig.test(hostName)){
                guideImgSrc = guideImgs.changjiang;
            }else if(/huanghe\.yuketang\.cn/ig.test(hostName)){
                guideImgSrc = guideImgs.huanghe;
            }
            this.$wrap.find(".guide-img").attr("src", guideImgSrc);
            this.$wrap.find(".guide-img").addClass("show");

            this.isRefreshList = false;
            this.isLoading = false;
            this.loopHandler = null;
            this.examId = editor.getOpt('examId') || '';//当前考试id
            this.mobileUploadImgQrApi = editor.getOpt('mobileUploadImgQrApi') || '';//获取二维码接口
            this.mobileUploadedImaListApi = editor.getOpt('mobileUploadedImaListApi') || '';//获取手机上传图片列表接口
            this.qrSrc = '';
            this.imageList = [];//从手机中上传的图片列表
            this.selectedImageList = [];//已经选择的图片列表
            this.initContainer();
        },
        initContainer: function () {
            var _this = this;
            _this.fetchQrcode();
            _this.fetchMobileUploadedImgListLoop();
            _this.clickRefreshImgList();
        },
        /* 获取考试+学生对应的二维码 */
        fetchQrcode: function () {
            var _this = this;
            $.ajax({
                url: this.mobileUploadImgQrApi + "?exam_id=" + this.examId,
                type: "GET",
                dataType: "json",
                success: function(data){
                    if(data.errcode == 0){
                        data = data.data;
                        _this.qrSrc = "qr_code" in data ? data.qr_code : '';
                        if(_this.qrSrc){
                            _this.$wrap.find(".qr").attr("src", _this.qrSrc).addClass("show");
                        }
                    }
                },
                error: function(xhr, err, e){
                    
                }
            });
        },
        clickRefreshImgList: function () {
            var _this = this;
            this.$wrap.find('.refrech-mobile-uploadlist').on("click", function(e){
                _this.fetchMobileUploadedImgListLoop();
            });
        },
        fetchMobileUploadedImgList: function (noloading) {
            var _this = this;
            if(!noloading){
                _this.isLoading = true; 
                _this.$wrap.find(".queueList-box").hide();
                _this.$wrap.find(".queuelist-none").hide();
                _this.$wrap.find(".loading-wrapper").show();
            }else{
                _this.isLoading = false; 
                _this.$wrap.find(".loading-wrapper").hide();
            }
            $.ajax({
                url: this.mobileUploadedImaListApi + "?exam_id=" + this.examId,
                type: "GET",
                dataType: "json",
                success: function(data){
                    _this.isLoading = false;
                    _this.$wrap.find(".loading-wrapper").hide();
                    if(data.errcode == 0){
                        data = data.data;
                        _this.imageList = "img_list" in data ? data.img_list : [];
                        if(_this.imageList.length){
                            _this.$wrap.find(".queuelist-none").hide();
                            _this.$wrap.find(".queueList-box").show();
                        }else{
                            _this.$wrap.find(".queuelist-none").show();
                            _this.$wrap.find(".queueList-box").hide();
                        }
                        _this.initList();
                    }else{
                        _this.$wrap.find(".queuelist-none").show();
                        _this.$wrap.find(".queueList-box").hide();
                    }
                },
                error: function(xhr, err, e){
                    _this.isLoading = false;
                    _this.$wrap.find(".loading-wrapper").hide();
                    _this.$wrap.find(".queuelist-none").show();
                    _this.$wrap.find(".queueList-box").hide();
                }
            });
        },
        fetchMobileUploadedImgListLoop: function(){
            var _this = this;
            _this.fetchMobileUploadedImgList();
            if(_this.loopHandler) clearInterval(_this.loopHandler);
            _this.loopHandler = setInterval(function(){
                _this.fetchMobileUploadedImgList(true);
            }, 3000);
        },
        changeInfo(){
            var _this = this;
            var text = '';
            if(_this.imageList.length){
                text = lang.updateImgStatusList.replace('_n', _this.selectedImageList.length).replace('_', _this.imageList.length);
            }
            _this.$wrap.find(".info").html(text);
        },
        initList(){
            var _this = this;
            _this.changeInfo();
            _this.$wrap.find("li.img-item").off("click");
            if(_this.imageList.length){
                if(_this.$wrap.find("li.img-item").length){
                    var imgListDOM = _this.$wrap.find("li.img-item");
                    var orderError = false;
                    var selectedImageList = [];
                    for(var m=0; m<imgListDOM.length;m++){
                        var img_url = $(imgListDOM[m]).attr("_url");
                        if($(imgListDOM[m]).hasClass('selected')) selectedImageList.push(img_url);
                        if(_this.imageList[m] != img_url){
                            orderError = true;
                        }
                    }
                    if(selectedImageList.length) selectedImageList = selectedImageList.join(",") + ",";
                    if(orderError){
                        var _html = '<ul>';
                        for(var j=0; j<_this.imageList.length;j++){
                            var _imgUrl = _this.imageList[j];
                            var isSelected = selectedImageList.indexOf(_imgUrl + ",") != -1 ? true : false;
                            _html += (isSelected ? '<li class="img-item selected" _url="'+_imgUrl+'" order='+j+'>' : '<li class="img-item" _url="'+_imgUrl+'" order='+j+'>')
                                    + '<img src="'+_imgUrl+'" />'
                                    + '<div class="select-box"><i class="icon-select"></i></div>'
                                    + '</li>';
                        }
                        _html += '</ul>';
                        _this.$wrap.find(".queueList-box").html(_html);
                    }else{
                        for(var j=0; j<_this.imageList.length;j++){
                            var _imgUrl = _this.imageList[j];
                            if(!_this.$wrap.find("li.img-item[_url='"+_imgUrl+"']").length){
                                if(j==0){
                                    _this.$wrap.find(".queueList-box ul").prepend('<li class="img-item" _url="'+_imgUrl+'" order='+j+'>'
                                    + '<img src="'+_imgUrl+'" />'
                                    + '<div class="select-box"><i class="icon-select"></i></div>'
                                    + '</li>');
                                }else{
                                    _this.$wrap.find("li.img-item[order="+(j-1)+"]").after('<li class="img-item" _url="'+_imgUrl+'" order='+j+'>'
                                    + '<img src="'+_imgUrl+'" />'
                                    + '<div class="select-box"><i class="icon-select"></i></div>'
                                    + '</li>');
                                }
                                (function(url){
                                    getImgNaturalStyle(url, function(w, h){
                                        _this.$wrap.find("li.img-item[_url='"+url+"']").attr("_width", w).attr("_height", h);
                                    });
                                })(_imgUrl);
                            }else{
                                _this.$wrap.find("li.img-item[_url='"+_imgUrl+"']").attr("order", j);
                            }
                        }
                    }
                }else{
                    var _html = '<ul>';
                    for(var j=0; j<_this.imageList.length;j++){
                        var _imgUrl = _this.imageList[j];
                        _html += '<li class="img-item" _url="'+_imgUrl+'" order='+j+'>'
                                + '<img src="'+_imgUrl+'" />'
                                + '<div class="select-box"><i class="icon-select"></i></div>'
                                + '</li>';
                    }
                    _html += '</ul>';
                    _this.$wrap.find(".queueList-box").html(_html);
                }
                for(var ii=0; ii<_this.imageList.length;ii++){
                    var _imgUrl = _this.imageList[ii];
                    (function(url){
                        getImgNaturalStyle(url, function(w, h){
                            _this.$wrap.find("li.img-item[_url='"+url+"']").attr("_width", w).attr("_height", h);
                        });
                    })(_imgUrl);
                }
            }else{
                _this.$wrap.find(".queueList-box").html('')
            }
            _this.$wrap.find(".img-item").off("click").on("click", function(e){
                if($(this).hasClass("selected")){
                    $(this).removeClass("selected");
                }else{
                    $(this).addClass("selected")
                }
                var selectedDOM = _this.$wrap.find("li.img-item.selected");
                _this.selectedImageList = [];
                for(var m=0; m<selectedDOM.length;m++){
                    _this.selectedImageList.push({
                        url: $(selectedDOM[m]).attr("_url"),
                        width: $(selectedDOM[m]).attr("_width"),
                        height: $(selectedDOM[m]).attr("_height")
                    });
                }
                _this.changeInfo();
            });
        },
        getToken: function () {
            let cookies = document.cookie.split(';');
            let cookiesObj = {};
            for(var i in cookies){
                var item = cookies[i];
                var s = item.split('=');
                cookiesObj[s[0].replace(/\s/g, '')] = s[1].replace(/\s/g, '');
            }
            return cookiesObj["csrftoken"] || "";
        },
        getInsertList: function () {
            var _this = this;
            var data;
            var list = [];
            for (i = 0; i < this.selectedImageList.length; i++) {
                data = this.selectedImageList[i];
                list.push({
                    src: data.url,
                    _src: data.url,
                    width: (data['width'] >= $(editor.container).width()-16) ? '80%' : data['width'] || '',
                    height: 'auto'
                });
            }
            if(_this.loopHandler) clearInterval(_this.loopHandler);
            return list;
        }
    };
})();
