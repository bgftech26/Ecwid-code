<script>
(function(){
function x(){
if(!document.body)return setTimeout(x,100);
if(document.getElementById("bgc"))return;

var s=document.createElement("style");
s.textContent="#bgc{position:fixed;top:14px;right:16px;z-index:99999;width:52px;height:52px;border:1px solid #e5e5e5;border-radius:50%;background:#fff;color:#111;box-shadow:0 6px 20px #0003;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(-60px);pointer-events:none;transition:.3s}#bgc.on{opacity:1;transform:none;pointer-events:auto}#bgb{position:relative;width:29px;height:31px}#bgn{position:absolute;left:50%;top:18px;transform:translate(-50%,-50%);color:#fff;font:700 12px Arial}";
document.head.appendChild(s);

var b=document.createElement("button");
b.id="bgc";
b.setAttribute("aria-label","Open cart");
b.innerHTML='<span id="bgb"><svg viewBox="0 0 30 32" width="29" height="31"><path d="M6 10.5h18L22.5 29h-15z" fill="currentColor"/><path d="M10.5 11V7.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span id="bgn">0</span></span>';
document.body.appendChild(b);

b.onclick=function(){if(window.Ecwid)Ecwid.openPage("cart")};

function u(c){
var q=c&&c.productsQuantity?c.productsQuantity:0;
document.getElementById("bgn").textContent=q>99?"99+":q;
}

addEventListener("scroll",function(){
b.classList.toggle("on",scrollY>180);
},{passive:true});

var t=setInterval(function(){
if(window.Ecwid&&Ecwid.Cart&&Ecwid.OnCartChanged){
Ecwid.Cart.get(u);
Ecwid.OnCartChanged.add(u);
clearInterval(t);
}
},250);
}
x();
})();
</script>
