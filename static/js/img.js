// 使用国内极速壁纸接口，直接前端请求，稳定不卡
var seting = { apiUrl: "https://api.vvhan.com/api/wallpaper/360", ratio: 0.618, types: 36 }; 
var jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 

window.onresize = function () { resizeHeight() }; 
window.onload = function () { loadData(seting.types, true); resizeHeight() }; 

// 彻底移除滚动到底部重新洗牌的逻辑，避免白屏闪烁
$(function () { 
    // 保持静默
}); 

function loadData(types, newload) { 
    if (types != seting.types || newload === true) { 
        seting.types = types; 
        jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 
        $("#walBox").html(''); 
    } 
    ajaxWal(seting.types) 
} 

resizeHeight(); 
function resizeHeight() { 
    var newHeight = $("#walBox").width() * (seting.ratio / 2); 
    $(".jigsaw .item").css('height', newHeight); 
    $(".jigsaw .Hhalf").css('height', newHeight / 2);
    return true 
} 

function addJigsaw(img, alt) { 
    var newHtml; var imgWidth, imgHeight; jigsaw.count++; 

    // 强制固定宽高比例，防止滚动时页面跳动闪烁
    if (jigsaw.halfHtml !== '') { 
        imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div></div>'; 
        contAdd(jigsaw.halfHtml + newHtml); jigsaw.halfHtml = ''; return true 
    } 
    if (((jigsaw.count - 1) % 5) === 0) { jigsaw.loadBig = false } 
    if ((jigsaw.loadBig === false) && ((Math.floor(Math.random() * 3) === 0) || ((jigsaw.count % 5) === 0))) { 
        imgWidth = parseInt(screen.width / 2); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="item half oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div>'; 
        contAdd(newHtml); jigsaw.loadBig = true; return true 
    } 
    imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
    jigsaw.halfHtml = '<div class="item quater"><div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div>'; 
    return true 
} 

function contAdd(html) { 
    var myBox = $("#walBox"); 
    var $newHtml = $(html); 
    myBox.append($newHtml); 
    // 去掉动画，直接加载
    $("img", $newHtml).lazyload({ threshold: 200 }) 
} 

function ajaxWal(cid) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    $.ajax({
        type: "GET",
        url: seting.apiUrl,
        // 这个接口直接用 cid 和 type 拉取
        data: { type: 'pc', cid: cid },
        dataType: "json",
        success: function (jsonData) {
            if (jsonData && jsonData.data && jsonData.data.length > 0) {
                var images = jsonData.data;
                for (var i = 0; i < images.length; i++) {
                    // 韩小韩接口返回的是 url 字段
                    addJigsaw(images[i].url, "壁纸");
                }
            } else {
                $("#loadmore").html('该分类暂无数据');
            }
            resizeHeight(); 
            jigsaw.ajaxing = false; 
            $("#loadmore").hide();
        }, 
        error: function() { 
            jigsaw.ajaxing = false; 
            $("#loadmore").html('加载失败，请刷新重试'); 
        } 
    }); 
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
