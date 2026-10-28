console["log"]("%c 国内直连防墙版 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
// 这是国内极其稳定的免费壁纸 API，直连无需代理
var seting = { apiUrl: "https://uapis.cn/api/v1/random/image", ratio: 0.618, types: '风景' }; 
var jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 

window.onresize = function () { resizeHeight() }; 
window.onload = function () { loadData(seting.types, true); resizeHeight() }; 

$(function () { 
    $(window).scroll(function () { 
        if ($(this).scrollTop() + $(window).height() + 20 >= $(document).height() && $(this).scrollTop() > 20) { 
            loadData(seting.types, false) 
        } 
    }) 
}); 

function loadData(types, newload) { 
    if (types != seting.types || newload === true) { 
        seting.types = types; 
        jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 
        $("#walBox").html(''); 
    } 
    ajaxWal(seting.types, 12) 
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
    if (jigsaw.halfHtml !== '') { 
        imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg"></a></div></div>'; 
        contAdd(jigsaw.halfHtml + newHtml); jigsaw.halfHtml = ''; return true 
    } 
    if (((jigsaw.count - 1) % 5) === 0) { jigsaw.loadBig = false } 
    if ((jigsaw.loadBig === false) && ((Math.floor(Math.random() * 3) === 0) || ((jigsaw.count % 5) === 0))) { 
        imgWidth = parseInt(screen.width / 2); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="item half oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg"></a></div>'; 
        contAdd(newHtml); jigsaw.loadBig = true; return true 
    } 
    imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
    jigsaw.halfHtml = '<div class="item quater"><div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg"></a></div>'; 
    return true 
} 

function contAdd(html) { 
    var myBox = $("#walBox"); 
    var $newHtml = $(html); 
    myBox.append($newHtml); 
    $("img", $newHtml).lazyload({ effect: 'fadeIn', threshold: 200 }) 
} 

function ajaxWal(category, totalCount) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 
    
    var loaded = 0;
    
    // UApi 接口，支持分类和 302 重定向，国内极速响应
    var cat = "scenery"; // 默认风景
    if (category === "美女" || category === "人物") cat = "beauty";
    if (category === "动漫") cat = "anime";
    if (category === "游戏") cat = "game";
    if (category === "汽车") cat = "car";
    if (category === "动物") cat = "animal";

    function fetchNext() {
        if (loaded >= totalCount) {
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
            return;
        }
        
        // 直接请求国内接口，并拼上时间戳防止缓存
        var imgUrl = "https://uapis.cn/api/v1/random/image?category=" + cat + "&type=pc&t=" + Math.random();
        
        // 预加载判断是否可用
        var tempImg = new Image();
        tempImg.onload = function() {
            addJigsaw(imgUrl, category);
            loaded++;
            fetchNext(); 
        };
        tempImg.onerror = function() {
            setTimeout(fetchNext, 100); 
        };
        tempImg.src = imgUrl;
    }
    
    fetchNext();
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
