var seting = { apiUrl: "./data.json", ratio: 0.618, types: 36 }; 
var jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 

window.onresize = function () { resizeHeight() }; 
window.onload = function () { loadData(seting.types, true); resizeHeight() }; 

$(function () { }); 

function loadData(types, newload) { 
    if (types != seting.types || newload === true) { 
        seting.types = types; 
        jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 
        $("#walBox").html(''); 
    } 
    ajaxWal(seting.types) 
} 

resizeHeight(); 
function resizeHeight() { 
    var newHeight = $("#walBox").width() * (seting.ratio / 2); 
    $(".jigsaw .item").css('height', newHeight); 
    $(".jigsaw .Hhalf").css('height', newHeight / 2);
    return true 
} 

// 【核心功能】把原图变成缩略图
function getThumbUrl(url) {
    if (url.includes('img.wpzy.cc/v2/')) {
        // 匹配末尾的 .jpeg .jpg .png，替换成 m.jpeg
        return url.replace(/\.(jpeg|jpg|png)$/i, 'm.$1');
    }
    return url;
}

function addJigsaw(img, alt) { 
    var newHtml; var imgWidth, imgHeight; jigsaw.count++; 

    // 生成缩略图链接
    var thumbImg = getThumbUrl(img);

    // 首页展示缩略图(thumbImg)，点击大图看原图(img)
    if (jigsaw.halfHtml !== '') { 
        imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + thumbImg + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div></div>'; 
        contAdd(jigsaw.halfHtml + newHtml); jigsaw.halfHtml = ''; return true 
    } 
    if (((jigsaw.count - 1) % 5) === 0) { jigsaw.loadBig = false } 
    if ((jigsaw.loadBig === false) && ((Math.floor(Math.random() * 3) === 0) || ((jigsaw.count % 5) === 0))) { 
        imgWidth = parseInt(screen.width / 2); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="item half oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + thumbImg + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div>'; 
        contAdd(newHtml); jigsaw.loadBig = true; return true 
    } 
    imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
    jigsaw.halfHtml = '<div class="item quater"><div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + thumbImg + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div>'; 
    return true 
} 

function contAdd(html) { 
    var myBox = $("#walBox"); 
    var $newHtml = $(html); 
    myBox.append($newHtml); 
    // 懒加载
    $("img", $newHtml).lazyload({ threshold: 200 }) 
} 

function ajaxWal(cid) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    $.ajax({
        type: "GET",
        url: seting.apiUrl, 
        dataType: "json",
        success: function (jsonData) {
            if (jsonData && jsonData[cid] && jsonData[cid].length > 0) {
                var images = jsonData[cid];
                images.sort(function() { return 0.5 - Math.random() }); 
                
                for (var i = 0; i < images.length; i++) {
                    addJigsaw(images[i].url, "壁纸");
                }
            } else {
                $("#loadmore").html('该分类暂无数据');
            }
            resizeHeight(); 
            jigsaw.ajaxing = false; 
            $("#loadmore").hide();
        }, 
        error: function() { 
            jigsaw.ajaxing = false; 
            $("#loadmore").html('data.json 加载失败'); 
        } 
    }); 
    return true 
} 

function changeTitle(obj) { 
    $('title').html($(obj).html() + ' - 电脑壁纸') 
}
