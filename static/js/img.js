var seting = { apiUrl: "./data.json", ratio: 0.618, types: 36 }; 
var jigsaw = { count: 0, halfHtml: '', loadBig: false, ajaxing: false }; 

window.onresize = function () { resizeHeight() }; 
window.onload = function () { loadData(seting.types, true); resizeHeight() }; 

// 【治疗白屏】彻底删掉了滑到底部清空重载的代码，防止页面直接变白
$(function () { 
    // 不再监听滚动清空
}); 

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

function addJigsaw(img, alt) { 
    var newHtml; var imgWidth, imgHeight; jigsaw.count++; 

    // 【治疗跳动】强制用 style 固定图片宽高，防止未加载时高度塌陷引起乱跳
    if (jigsaw.halfHtml !== '') { 
        imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div></div>'; 
        contAdd(jigsaw.halfHtml + newHtml); jigsaw.halfHtml = ''; return true 
    } 
    if (((jigsaw.count - 1) % 5) === 0) { jigsaw.loadBig = false } 
    if ((jigsaw.loadBig === false) && ((Math.floor(Math.random() * 3) === 0) || ((jigsaw.count % 5) === 0))) { 
        imgWidth = parseInt(screen.width / 2); imgHeight = parseInt(imgWidth * seting.ratio); 
        newHtml = '<div class="item half oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div>'; 
        contAdd(newHtml); jigsaw.loadBig = true; return true 
    } 
    imgWidth = parseInt(screen.width / 4); imgHeight = parseInt(imgWidth * seting.ratio); 
    jigsaw.halfHtml = '<div class="item quater"><div class="Hhalf oneImg"><a href="' + img + '" data-fancybox="images"><img src="' + img + '" alt="' + alt + '" title="关键字：' + alt + '" class="pimg" style="width:100%;height:100%;object-fit:cover;"></a></div>'; 
    return true 
} 

function contAdd(html) { 
    var myBox = $("#walBox"); 
    var $newHtml = $(html); 
    myBox.append($newHtml); 
    // 【治疗闪烁】把 effect: 'fadeIn' 删掉，不要淡入特效
    $("img", $newHtml).lazyload({ threshold: 200 }) 
} 

function ajaxWal(cid) { 
    if (jigsaw.ajaxing === true) return false; 
    $("#loadmore").html('努力加载中……'); 
    $("#loadmore").show(); 
    jigsaw.ajaxing = true; 

    $.ajax({
        type: "GET",
        url: seting.apiUrl, // 依然读你的 data.json
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
