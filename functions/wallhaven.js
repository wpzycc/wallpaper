export async function onRequest(context) {
  // 获取前端传来的关键词，默认搜索 nature
  const url = new URL(context.request.url);
  const keyword = url.searchParams.get("q") || "nature";
  
  // 请求 Wallhaven 官方 API，只拿 SFW（安全级）的图
  const apiUrl = `https://wallhaven.cc/api/v1/search?q=${keyword}&categories=111&purity=100&sorting=random&page=${url.searchParams.get("page") || 1}`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  // 把数据返回给前端，并允许跨域
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
