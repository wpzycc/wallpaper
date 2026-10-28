console["log"]("%c 必应国内直连终版 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
var seting = { ratio: 0.618, types: '风景' }; 
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
    ajaxWal(seting.types, 10) 
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
    $("#loadmore").html('正在为您拉取高清壁纸...'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    // 这里去掉了一切复杂的 ajax 和循环。直接拼接国内必应镜像的 img src
    // 这个接口国内直接返回 302 重定向到真实的必应图片，不需要 JS 请求 JSON
    var loopCount = 0;
    var timer = setInterval(function() {
        // 直接生成图片 URL，浏览器自动加载
        var imgUrl = "https://bing.imgb.xyz/api/wallpaper?t=" + Date.now() + Math.random();
        
        // 直接插入 DOM
        addJigsaw(imgUrl, category);
        
        loopCount++;
        if (loopCount >= totalCount) {
            clearInterval(timer);
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
        }
    }, 150); // 每 150 毫秒插入一张，防止浏览器卡顿
    
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
