console["log"]("%c Wallhaven 无损代理版 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
var seting = { apiUrl: "./wallhaven", ratio: 0.618, types: '风景' }; 
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
    
    // 【核心修改点】套上国内能直连的图片代理 CDN
    var safeImg = "https://images.weserv.nl/?url=" + encodeURIComponent(img);

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

function ajaxWal(category, page) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    var keyword = "nature";
    if (category === "美女" || category === "人物") keyword = "people";
    if (category === "动漫") keyword = "anime";
    if (category === "游戏") keyword = "games";
    if (category === "汽车") keyword = "cars";
    if (category === "动物") keyword = "animals";
    if (category === "美食") keyword = "food";
    if (category === "建筑") keyword = "buildings";
    if (category === "简约") keyword = "minimalist";
    if (category === "影视") keyword = "movies";
    if (category === "星空") keyword = "space";

    $.ajax({
        type: "GET",
        url: seting.apiUrl,
        data: { q: keyword, page: page },
        dataType: "json",
        success: function (jsonData) {
            if (jsonData && jsonData.data && jsonData.data.length > 0) {
                var images = jsonData.data;
                for (var i = 0; i < images.length; i++) {
                    addJigsaw(images[i].path, category);
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
