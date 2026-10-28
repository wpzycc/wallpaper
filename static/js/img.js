console["log"]("%c 极数本源壁纸系统重构 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
var seting = { apiUrl: "https://v1.apizero.cn/api/wallpaper", ratio: 0.618, types: '风景' }; 
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
        $(".onepage-pagination").remove(); 
        $("body").removeClass(); 
        $(".jigsaw").removeAttr("style") 
    } 
    ajaxWal(seting.types, 20) 
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

function ajaxWal(cid, count) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    $.ajax({
        type: "GET",
        url: seting.apiUrl,
        data: { category: cid, count: count },
        dataType: "json",
        success: function (jsonData) {
            if (jsonData && jsonData.data && jsonData.data.images) {
                var images = jsonData.data.images;
                for (var i = 0; i < images.length; i++) {
                    addJigsaw(images[i].url, images[i].tag_text || '壁纸');
                }
            }
            resizeHeight(); 
            jigsaw.ajaxing = false; 
            if (!jsonData || !jsonData.data || jsonData.data.images.length === 0) { 
                $("#loadmore").html('所有的壁纸都已经加载完啦！') 
            } else { 
                $("#loadmore").hide() 
            } 
        }, 
        error: function() { 
            jigsaw.ajaxing = false; 
            $("#loadmore").html('加载失败，请检查网络或稍后重试'); 
        } 
    }); 
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
