console["log"]("%c 韩小韩二次美化 https://www.vvhan.com %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
var seting = { apiUrl: "http://api.xcvts.cn/api/img/bizhi", ratio: 0.618, types: 1 }; 
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
    // 每次调用拉取 20 张图片
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

// 针对小尘接口的并发请求逻辑
function ajaxWal(cid, targetCount) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    var loadedCount = 0;

    function fetchOne() {
        if (loadedCount >= targetCount) {
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
            return;
        }
        $.ajax({
            type: "GET",
            url: seting.apiUrl,
            data: { msg: cid },
            dataType: "json",
            success: function (jsonData) {
                // 小尘接口返回结构 {"code":200,"data":{"imgurl":"..."}}
                if(jsonData && jsonData.data && jsonData.data.imgurl) {
                    addJigsaw(jsonData.data.imgurl, '壁纸');
                }
                loadedCount++;
                fetchOne(); 
            },
            error: function() {
                loadedCount++;
                fetchOne();
            }
        });
    }
    fetchOne();
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
