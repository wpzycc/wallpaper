// 纯前端直连国内镜像接口，无需任何代理
var seting = { apiUrl: "https://api.wallhaven.cc/api/v1/search", ratio: 0.618, types: 36 }; 
var jigsaw = { count: 0, page: 1, halfHtml: '', loadBig: false, ajaxing: false }; 

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
        jigsaw = { count: 0, page: 1, halfHtml: '', loadBig: false, ajaxing: false }; 
        $("#walBox").html(''); 
    } else {
        jigsaw.page++; 
    }
    ajaxWal(seting.types, jigsaw.page) 
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
    
    // 因为这是国内镜像接口，直接返回的就是能访问的图片链接
    var safeImg = img;

    if (jigsaw.halfHtml !== '') { 
        imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="Hhalf oneImg"><a href="' + safeImg + '" data-fancybox="images"><img src="' + safeImg + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg"></a></div></div>'; 
        contAdd(jigsaw.halfHtml + newHtml); jigsaw.halfHtml = ''; return true 
    } 
    if (((jigsaw.count - 1) % 5) === 0) { jigsaw.loadBig = false } 
    if ((jigsaw.loadBig === false) && ((Math.floor(Math.random() * 3) === 0) || ((jigsaw.count % 5) === 0))) { 
        imgWidth = parseInt(screen.width / 2); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="item half oneImg"><a href="' + safeImg + '" data-fancybox="images"><img src="' + safeImg + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg"></a></div>'; 
        contAdd(newHtml); jigsaw.loadBig = true; return true 
    } 
    imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
    jigsaw.halfHtml = '<div class="item quater"><div class="Hhalf oneImg"><a href="' + safeImg + '" data-fancybox="images"><img src="' + safeImg + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg"></a></div>'; 
    return true 
} 

function contAdd(html) { 
    var myBox = $("#walBox"); 
    var $newHtml = $(html); 
    myBox.append($newHtml); 
    $("img", $newHtml).lazyload({ effect: 'fadeIn', threshold: 200 }) 
} 

function ajaxWal(cid, page) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    // 把你 HTML 里的数字分类，翻译成英文
    var keyword = "nature";
    if (cid == 6 || cid == 30) keyword = "people";
    if (cid == 26) keyword = "anime";
    if (cid == 5) keyword = "games";
    if (cid == 12) keyword = "cars";
    if (cid == 14) keyword = "animals";
    if (cid == 29) keyword = "calendar";
    if (cid == 36) keyword = "4k";
    if (cid == 9) keyword = "nature";
    if (cid == 15) keyword = "minimalist";
    if (cid == 11) keyword = "fashion";
    if (cid == 10) keyword = "fashion";

    $.ajax({
        type: "GET",
        url: seting.apiUrl,
        data: { q: keyword, page: page }, 
        dataType: "json",
        success: function (jsonData) {
            if (jsonData && jsonData.data && jsonData.data.length > 0) {
                var images = jsonData.data;
                for (var i = 0; i < images.length; i++) {
                    // Wallhaven 的图片字段叫 path
                    addJigsaw(images[i].path, "壁纸");
                }
            }
            resizeHeight(); 
            jigsaw.ajaxing = false; 
            $("#loadmore").hide();
        }, 
        error: function() { 
            jigsaw.ajaxing = false; 
            $("#loadmore").html('加载失败，请稍后重试'); 
        } 
    }); 
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
