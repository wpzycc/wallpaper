console["log"]("%c 极数本源限速版 %c", "color: #fadfa3; background: #030307; padding:5px", "background: #fadfa3; padding:5px");
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
    // 每次只拉 12 张，通过限速避免触发 QPS
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

    function fetchNext() {
        if (loaded >= totalCount) {
            jigsaw.ajaxing = false;
            $("#loadmore").hide();
            return;
        }
        $.ajax({
            type: "GET",
            url: seting.apiUrl,
            data: { category: category, resolution: "1920x1080", count: 1 },
            dataType: "json",
            success: function (jsonData) {
                if (jsonData && jsonData.data && jsonData.data.images && jsonData.data.images.length > 0) {
                    var img = jsonData.data.images[0];
                    addJigsaw(img.url, img.tag_text || category);
                }
                loaded++;
                // 每张图间隔 500ms，远低于 QPS 2 的限制
                setTimeout(fetchNext, 500);
            },
            error: function () {
                loaded++;
                setTimeout(fetchNext, 500);
            }
        });
    }
    fetchNext();
    return true
}

function changeTitle(obj) {
    $('title').html($(obj).html() + ' - 电脑壁纸')
}
