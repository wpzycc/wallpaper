console["log"]("%c 极简壁纸系统 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
// 换用一个稳定、支持跨域和HTTPS的公共图片接口
var seting = { apiUrl: "https://api.uomg.com/api/rand.img3", ratio: 0.618, types: '风景' }; 
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
    ajaxWal(seting.types, 1) 
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

    // 这里为了防封，一次性只拉取 10 张图（因为它其实还是基于随机图的逻辑）
    var loadedCount = 0;
    var targetCount = 10; // 每次加载10张，防封

    function fetchOne() {
        if (loadedCount >= targetCount) {
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
            return;
        }
        $.ajax({
            type: "GET",
            url: seting.apiUrl,
            data: { format: "json" },
            dataType: "json",
            success: function (jsonData) {
                if(jsonData && jsonData.code == 1 && jsonData.imgurl) {
                    // 这个接口返回的就是纯粹的图片直链
                    addJigsaw(jsonData.imgurl, '随机壁纸');
                }
                loadedCount++;
                // 加一个 200ms 的延迟，防止瞬间并发过高被封
                setTimeout(fetchOne, 200); 
            },
            error: function() {
                loadedCount++;
                setTimeout(fetchOne, 200); 
            }
        });
    }
    fetchOne();
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
