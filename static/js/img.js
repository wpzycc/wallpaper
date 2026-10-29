console["log"]("%c 纯国内 360 最终修正版 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
var seting = { apiUrl: "./wallhaven", ratio: 0.618, types: 36 }; 
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
    ajaxWal(seting.types, jigsaw.count) 
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
    
    // 将360缩略图替换为 1600x900 高清图，绝对国内 CDN 秒开
    var safeImg = img.replace("bdr/__85", "bdm/1600_900_85");

    // 提取纯粹的标签文字
    var cleanAlt = alt.replace(/_全部_|_category_/g, '').trim();

    if (jigsaw.halfHtml !== '') { 
        imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="Hhalf oneImg"><a href="' + safeImg + '" data-fancybox="images"><img src="' + safeImg + '" alt="' + cleanAlt + '" title="关键字：' + cleanAlt + '" class="pimg"></a></div></div>'; 
        contAdd(jigsaw.halfHtml + newHtml); jigsaw.halfHtml = ''; return true 
    } 
    if (((jigsaw.count - 1) % 5) === 0) { jigsaw.loadBig = false } 
    if ((jigsaw.loadBig === false) && ((Math.floor(Math.random() * 3) === 0) || ((jigsaw.count % 5) === 0))) { 
        imgWidth = parseInt(screen.width / 2); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="item half oneImg"><a href="' + safeImg + '" data-fancybox="images"><img src="' + safeImg + '" alt="' + cleanAlt + '" title="关键字：' + cleanAlt + '" class="pimg"></a></div>'; 
        contAdd(newHtml); jigsaw.loadBig = true; return true 
    } 
    imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
    jigsaw.halfHtml = '<div class="item quater"><div class="Hhalf oneImg"><a href="' + safeImg + '" data-fancybox="images"><img src="' + safeImg + '" alt="' + cleanAlt + '" title="关键字：' + cleanAlt + '" class="pimg"></a></div>'; 
    return true 
} 

function contAdd(html) { 
    var myBox = $("#walBox"); 
    var $newHtml = $(html); 
    myBox.append($newHtml); 
    $("img", $newHtml).lazyload({ effect: 'fadeIn', threshold: 200 }) 
} 

function ajaxWal(cid, start) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    // 请求 CF 代理
    $.ajax({
        type: "GET",
        url: seting.apiUrl,
        data: { cid: cid, start: start },
        dataType: "json",
        success: function (jsonData) {
            // 容错处理，确保拿到了 data 数组
            if (jsonData && jsonData.data && jsonData.data.length > 0) {
                var images = jsonData.data;
                for (var i = 0; i < images.length; i++) {
                    addJigsaw(images[i].url, images[i].tag);
                }
            } else if (jsonData && jsonData.error) {
                $("#loadmore").html('接口报错: ' + jsonData.error);
            }
            resizeHeight(); 
            jigsaw.ajaxing = false; 
            $("#loadmore").hide();
        }, 
        error: function(xhr, status, error) { 
            jigsaw.ajaxing = false; 
            $("#loadmore").html('CF 代理请求失败'); 
        } 
    }); 
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
