(function(){

function initTopButton(){

if(document.getElementById("bgTopBtn")) return;

var style=document.createElement("style");

style.textContent=`
#bgTopBtn{
position:fixed;
left:18px;
bottom:22px;
z-index:99998;

width:46px;
height:46px;
padding:0;

border:1px solid #e5e5e5;
border-radius:50%;

background:#fff;
color:#111;

box-shadow:0 5px 18px rgba(0,0,0,.16);

display:flex;
align-items:center;
justify-content:center;

cursor:pointer;

opacity:0;
visibility:hidden;
pointer-events:none;

transform:translateY(14px) scale(.92);

transition:
opacity .22s ease,
transform .3s cubic-bezier(.22,1,.36,1),
visibility .22s ease,
box-shadow .2s ease;
}

#bgTopBtn.show{
opacity:1;
visibility:visible;
pointer-events:auto;
transform:translateY(0) scale(1);
}

#bgTopBtn:hover{
transform:scale(1.07);
box-shadow:0 7px 24px rgba(0,0,0,.22);
}

#bgTopBtn svg{
width:20px;
height:20px;
display:block;
}

@media(max-width:600px){
#bgTopBtn{
left:12px;
bottom:18px;
width:44px;
height:44px;
}
}
`;

document.head.appendChild(style);

var btn=document.createElement("button");

btn.id="bgTopBtn";
btn.type="button";
btn.setAttribute("aria-label","Back to top");

btn.innerHTML=`
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
<path
d="M6 15l6-6 6 6"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"/>
</svg>
`;

document.body.appendChild(btn);

var lastY=window.scrollY;

window.addEventListener("scroll",function(){

var currentY=window.scrollY;
var difference=currentY-lastY;

if(Math.abs(difference)<3) return;

if(difference>0 && currentY>450){
btn.classList.add("show");
}

if(difference<0){
btn.classList.remove("show");
}

if(currentY<450){
btn.classList.remove("show");
}

lastY=currentY;

},{passive:true});

btn.addEventListener("click",function(){

btn.classList.remove("show");

window.scrollTo({
top:0,
behavior:"smooth"
});

});

}

if(document.body){
initTopButton();
}else{
document.addEventListener("DOMContentLoaded",initTopButton);
}

})();
