console["log"]("%c 终极稳定壁纸系统 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
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
        $(".onepage-pagination").remove(); 
        $("body").removeClass(); 
        $(".jigsaw").removeAttr("style") 
    } 
    // 每次加载 12 张图
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
    
    // 将中文分类映射为 Unsplash 的英文关键词
    var keyword = "nature";
    if (category === "美女" || category === "人物") keyword = "people";
    if (category === "动漫") keyword = "anime";
    if (category === "游戏") keyword = "gaming";
    if (category === "汽车") keyword = "car";
    if (category === "动物") keyword = "animal";
    if (category === "美食") keyword = "food";
    if (category === "建筑") keyword = "architecture";
    if (category === "简约") keyword = "minimalist";
    if (category === "影视") keyword = "movie";
    if (category === "星空") keyword = "space";

    function fetchNext() {
        if (loaded >= totalCount) {
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
            return;
        }
        
        // 使用 Unsplash 的随机图源，1920x1080 尺寸，并加上随机种子防止缓存
        var randomSeed = Math.floor(Math.random() * 999999);
        var imgUrl = "https://source.unsplash.com/1920x1080/?" + keyword + "&sig=" + randomSeed;
        
        // 预加载测试图片是否有效
        var tempImg = new Image();
        tempImg.onload = function() {
            addJigsaw(imgUrl, keyword);
            loaded++;
            fetchNext(); // 成功则立刻下一张
        };
        tempImg.onerror = function() {
            // 如果这张图挂了，跳过它，立刻重试下一张（不增加 loaded 计数，确保凑够 12 张）
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
