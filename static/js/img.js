var seting = { ratio: 0.618, types: 36 }; 
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
    
    // 使用图片中转，确保能加载出来
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

function ajaxWal(category, totalCount) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    var loaded = 0;
    // 直接写死 Wallhaven 的官方直链规则，用随机种子防缓存
    function fetchNext() {
        if (loaded >= totalCount) {
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
            return;
        }
        
        // 随机图片地址 (Wallhaven 官方 CDN 直链)
        var randomId = Math.random().toString(36).substring(2, 8);
        var imgUrl = "https://w.wallhaven.cc/full/" + randomId.substring(0, 2) + "/wallhaven-" + randomId + ".jpg";
        
        // 尝试加载，如果加载成功就塞进去
        var tempImg = new Image();
        tempImg.onload = function() {
            addJigsaw(imgUrl, category);
            loaded++;
            fetchNext(); 
        };
        tempImg.onerror = function() {
            // 如果这个随机地址没图（404），重新随机拉下一个，不增加成功计数
            fetchNext(); 
        };
        tempImg.src = "https://images.weserv.nl/?url=" + encodeURIComponent(imgUrl);
    }
    
    fetchNext();
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
