import{c as K,r as d,h as Y,u as Z,s as k,j as o,i as Q,k as J}from"./index-BkcfWfV6.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],ee=K("users",X);let te={data:""},re=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||te},ae=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,oe=/\/\*[^]*?\*\/|  +/g,z=/\n+/g,_=(e,t)=>{let r="",s="",n="";for(let i in e){let a=e[i];i[0]=="@"?i[1]=="i"?r=i+" "+a+";":s+=i[1]=="f"?_(a,i):i+"{"+_(a,i[1]=="k"?"":t)+"}":typeof a=="object"?s+=_(a,t?t.replace(/([^,])+/g,l=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,l):l?l+" "+c:c)):i):a!=null&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),n+=_.p?_.p(i,a):i+":"+a+";")}return r+(t&&n?t+"{"+n+"}":n)+s},w={},U=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+U(e[r]);return t}return e},se=(e,t,r,s,n)=>{let i=U(e),a=w[i]||(w[i]=(c=>{let u=0,g=11;for(;u<c.length;)g=101*g+c.charCodeAt(u++)>>>0;return"go"+g})(i));if(!w[a]){let c=i!==e?e:(u=>{let g,p,m=[{}];for(;g=ae.exec(u.replace(oe,""));)g[4]?m.shift():g[3]?(p=g[3].replace(z," ").trim(),m.unshift(m[0][p]=m[0][p]||{})):m[0][g[1]]=g[2].replace(z," ").trim();return m[0]})(e);w[a]=_(n?{["@keyframes "+a]:c}:c,r?"":"."+a)}let l=r&&w.g?w.g:null;return r&&(w.g=w[a]),((c,u,g,p)=>{p?u.data=u.data.replace(p,c):u.data.indexOf(c)===-1&&(u.data=g?c+u.data:u.data+c)})(w[a],t,s,l),a},ie=(e,t,r)=>e.reduce((s,n,i)=>{let a=t[i];if(a&&a.call){let l=a(r),c=l&&l.props&&l.props.className||/^go/.test(l)&&l;a=c?"."+c:l&&typeof l=="object"?l.props?"":_(l,""):l===!1?"":l}return s+n+(a??"")},"");function D(e){let t=this||{},r=e.call?e(t.p):e;return se(r.unshift?r.raw?ie(r,[].slice.call(arguments,1),t.p):r.reduce((s,n)=>Object.assign(s,n&&n.call?n(t.p):n),{}):r,re(t.target),t.g,t.o,t.k)}let H,S,A;D.bind({g:1});let j=D.bind({k:1});function ne(e,t,r,s){_.p=t,H=e,S=r,A=s}function C(e,t){let r=this||{};return function(){let s=arguments;function n(i,a){let l=Object.assign({},i),c=l.className||n.className;r.p=Object.assign({theme:S&&S()},l),r.o=/ *go\d+/.test(c),l.className=D.apply(r,s)+(c?" "+c:"");let u=e;return e[0]&&(u=l.as||e,delete l.as),A&&u[0]&&A(l),H(u,l)}return t?t(n):n}}var le=e=>typeof e=="function",P=(e,t)=>le(e)?e(t):e,de=(()=>{let e=0;return()=>(++e).toString()})(),F=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),ce=20,L="default",V=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:s}=t;return V(e,{type:e.toasts.find(a=>a.id===s.id)?1:0,toast:s});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(a=>a.id===n||n===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+i}))}}},O=[],q={toasts:[],pausedAt:void 0,settings:{toastLimit:ce}},v={},B=(e,t=L)=>{v[t]=V(v[t]||q,e),O.forEach(([r,s])=>{r===t&&s(v[t])})},W=e=>Object.keys(v).forEach(t=>B(e,t)),pe=e=>Object.keys(v).find(t=>v[t].toasts.some(r=>r.id===e)),I=(e=L)=>t=>{B(t,e)},ue={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ge=(e={},t=L)=>{let[r,s]=d.useState(v[t]||q),n=d.useRef(v[t]);d.useEffect(()=>(n.current!==v[t]&&s(v[t]),O.push([t,s]),()=>{let a=O.findIndex(([l])=>l===t);a>-1&&O.splice(a,1)}),[t]);let i=r.toasts.map(a=>{var l,c,u;return{...e,...e[a.type],...a,removeDelay:a.removeDelay||((l=e[a.type])==null?void 0:l.removeDelay)||(e==null?void 0:e.removeDelay),duration:a.duration||((c=e[a.type])==null?void 0:c.duration)||(e==null?void 0:e.duration)||ue[a.type],style:{...e.style,...(u=e[a.type])==null?void 0:u.style,...a.style}}});return{...r,toasts:i}},he=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||de()}),E=e=>(t,r)=>{let s=he(t,e,r);return I(s.toasterId||pe(s.id))({type:2,toast:s}),s.id},b=(e,t)=>E("blank")(e,t);b.error=E("error");b.success=E("success");b.loading=E("loading");b.custom=E("custom");b.dismiss=(e,t)=>{let r={type:3,toastId:e};t?I(t)(r):W(r)};b.dismissAll=e=>b.dismiss(void 0,e);b.remove=(e,t)=>{let r={type:4,toastId:e};t?I(t)(r):W(r)};b.removeAll=e=>b.remove(void 0,e);b.promise=(e,t,r)=>{let s=b.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(n=>{let i=t.success?P(t.success,n):void 0;return i?b.success(i,{id:s,...r,...r==null?void 0:r.success}):b.dismiss(s),n}).catch(n=>{let i=t.error?P(t.error,n):void 0;i?b.error(i,{id:s,...r,...r==null?void 0:r.error}):b.dismiss(s)}),e};var me=1e3,be=(e,t="default")=>{let{toasts:r,pausedAt:s}=ge(e,t),n=d.useRef(new Map).current,i=d.useCallback((p,m=me)=>{if(n.has(p))return;let x=setTimeout(()=>{n.delete(p),a({type:4,toastId:p})},m);n.set(p,x)},[]);d.useEffect(()=>{if(s)return;let p=Date.now(),m=r.map(x=>{if(x.duration===1/0)return;let h=(x.duration||0)+x.pauseDuration-(p-x.createdAt);if(h<0){x.visible&&b.dismiss(x.id);return}return setTimeout(()=>b.dismiss(x.id,t),h)});return()=>{m.forEach(x=>x&&clearTimeout(x))}},[r,s,t]);let a=d.useCallback(I(t),[t]),l=d.useCallback(()=>{a({type:5,time:Date.now()})},[a]),c=d.useCallback((p,m)=>{a({type:1,toast:{id:p,height:m}})},[a]),u=d.useCallback(()=>{s&&a({type:6,time:Date.now()})},[s,a]),g=d.useCallback((p,m)=>{let{reverseOrder:x=!1,gutter:h=8,defaultPosition:f}=m||{},N=r.filter(y=>(y.position||f)===(p.position||f)&&y.height),G=N.findIndex(y=>y.id===p.id),T=N.filter((y,M)=>M<G&&y.visible).length;return N.filter(y=>y.visible).slice(...x?[T+1]:[0,T]).reduce((y,M)=>y+(M.height||0)+h,0)},[r]);return d.useEffect(()=>{r.forEach(p=>{if(p.dismissed)i(p.id,p.removeDelay);else{let m=n.get(p.id);m&&(clearTimeout(m),n.delete(p.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:u,calculateOffset:g}}},xe=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,fe=j`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ye=j`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ve=C("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${xe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${fe} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${ye} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,we=j`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,je=C("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${we} 1s linear infinite;
`,Ne=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,ke=j`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,_e=C("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ne} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${ke} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ce=C("div")`
  position: absolute;
`,Ee=C("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,$e=j`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Oe=C("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${$e} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Pe=({toast:e})=>{let{icon:t,type:r,iconTheme:s}=e;return t!==void 0?typeof t=="string"?d.createElement(Oe,null,t):t:r==="blank"?null:d.createElement(Ee,null,d.createElement(je,{...s}),r!=="loading"&&d.createElement(Ce,null,r==="error"?d.createElement(ve,{...s}):d.createElement(_e,{...s})))},De=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ie=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Me="0%{opacity:0;} 100%{opacity:1;}",Se="0%{opacity:1;} 100%{opacity:0;}",Ae=C("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Le=C("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Te=(e,t)=>{let r=e.includes("top")?1:-1,[s,n]=F()?[Me,Se]:[De(r),Ie(r)];return{animation:t?`${j(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${j(n)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ze=d.memo(({toast:e,position:t,style:r,children:s})=>{let n=e.height?Te(e.position||t||"top-center",e.visible):{opacity:0},i=d.createElement(Pe,{toast:e}),a=d.createElement(Le,{...e.ariaProps},P(e.message,e));return d.createElement(Ae,{className:e.className,style:{...n,...r,...e.style}},typeof s=="function"?s({icon:i,message:a}):d.createElement(d.Fragment,null,i,a))});ne(d.createElement);var Re=({id:e,className:t,style:r,onHeightUpdate:s,children:n})=>{let i=d.useCallback(a=>{if(a){let l=()=>{let c=a.getBoundingClientRect().height;s(e,c)};l(),new MutationObserver(l).observe(a,{subtree:!0,childList:!0,characterData:!0})}},[e,s]);return d.createElement("div",{ref:i,className:t,style:r},n)},Ue=(e,t)=>{let r=e.includes("top"),s=r?{top:0}:{bottom:0},n=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:F()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...s,...n}},He=D`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,$=16,Fe=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:s,children:n,toasterId:i,containerStyle:a,containerClassName:l})=>{let{toasts:c,handlers:u}=be(r,i);return d.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:$,left:$,right:$,bottom:$,pointerEvents:"none",...a},className:l,onMouseEnter:u.startPause,onMouseLeave:u.endPause},c.map(g=>{let p=g.position||t,m=u.calculateOffset(g,{reverseOrder:e,gutter:s,defaultPosition:t}),x=Ue(p,m);return d.createElement(Re,{id:g.id,key:g.id,onHeightUpdate:u.updateHeight,className:g.visible?He:"",style:x},g.type==="custom"?P(g.message,g):n?n(g):d.createElement(ze,{toast:g,position:p}))}))},R=b;const qe=()=>{const e=Y(),{t}=Z(),[r,s]=d.useState(""),[n,i]=d.useState(!1),[a,l]=d.useState(""),[c,u]=d.useState(0);d.useEffect(()=>{p(),g();const h=k.channel("schema-db-changes").on("postgres_changes",{event:"INSERT",schema:"public",table:"orders"},f=>{console.log("Realtime Order Received!",f),R.success(N=>o.jsxs("div",{className:"flex flex-col gap-1",children:[o.jsx("strong",{className:"text-sm",children:"🔔 New Order Arrived!"}),o.jsxs("span",{className:"text-xs text-gray-600",children:["From: ",f.new.customer_name]}),o.jsxs("span",{className:"text-xs text-gray-500 font-mono mt-1",children:["Invoice: ",f.new.invoice_number]}),o.jsx("button",{onClick:()=>{R.dismiss(N.id),e("/dashboard/orders")},className:"mt-2 text-xs bg-cyan-500 text-white px-2 py-1 rounded",children:"View Order"})]}),{duration:8e3,position:"top-right"})}).subscribe(f=>{f==="SUBSCRIBED"&&console.log("Listening for realtime orders...")});return()=>{k.removeChannel(h)}},[]);const g=async()=>{try{const{data:h,error:f}=await k.from("site_stats").select("visitor_count").single();if(f)throw f;h&&u(h.visitor_count)}catch(h){console.error("Error fetching visitor count:",h)}},p=async()=>{try{const{data:{user:h}}=await k.auth.getUser();if(h){const{data:f,error:N}=await k.from("profiles").select("phone").eq("id",h.id).single();if(N)throw N;f&&(s(f.phone||""),l(f.phone||""))}}catch(h){console.error("Error fetching profile:",h)}},m=async()=>{try{i(!0);const{data:{user:h}}=await k.auth.getUser();if(h){const{error:f}=await k.from("profiles").update({phone:r,updated_at:new Date}).eq("id",h.id);if(f)throw f;l(r),alert("Contact number updated successfully!")}}catch(h){alert("Error updating contact number: "+h.message)}finally{i(!1)}},x=async()=>{await k.auth.signOut(),e("/login")};return o.jsxs("div",{className:"p-8",children:[o.jsx(Fe,{}),o.jsxs("div",{className:"flex items-center justify-between mb-8",children:[o.jsx("h1",{className:"text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider",children:t("dashboard")}),o.jsxs("div",{className:"flex items-center space-x-4",children:[o.jsxs("button",{onClick:()=>e("/"),className:"flex items-center px-4 py-2 text-sm font-bold bg-gray-800/80 hover:bg-gray-700/80 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",children:[o.jsx(Q,{className:"w-4 h-4 mr-2"}),"Go to Website"]}),o.jsxs("button",{onClick:x,className:"flex items-center px-4 py-2 text-sm font-bold bg-pink-900/20 hover:bg-pink-900/40 text-pink-500 border border-pink-500/30 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]",children:[o.jsx(J,{className:"w-4 h-4 mr-2"}),t("logout")]})]})]}),o.jsx("div",{className:"mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.1)]",children:o.jsxs("div",{className:"flex items-center space-x-4",children:[o.jsx("div",{className:"p-3 bg-cyan-500/20 rounded-full",children:o.jsx(ee,{className:"w-8 h-8 text-cyan-400"})}),o.jsxs("div",{children:[o.jsx("h2",{className:"text-sm font-medium text-gray-400 uppercase tracking-wider",children:"Total Visitors"}),o.jsx("p",{className:"text-3xl font-bold text-white",children:c.toLocaleString()})]})]})}),o.jsxs("div",{className:"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",children:[o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-cyan-400 group-hover:text-white transition-colors",children:"Contact Number"}),o.jsx("p",{className:"mb-4 text-gray-400 text-sm leading-relaxed",children:'Update the WhatsApp number used for the "Contact Me" button.'}),o.jsx("div",{className:"mb-4",children:o.jsx("input",{type:"tel",value:r,onChange:h=>s(h.target.value),placeholder:"e.g. 628123456789",className:"w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"})}),o.jsx("button",{onClick:m,disabled:n||r===a,className:`w-full px-4 py-2 font-bold transition-colors clip-path-polygon ${n||r===a?"bg-gray-700 text-gray-400 cursor-not-allowed":"bg-cyan-500 hover:bg-cyan-400 text-black"}`,style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:n?"Updating...":"Update Number"})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-cyan-400 group-hover:text-white transition-colors",children:t("profile")}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:t("profile_desc")}),o.jsx("button",{onClick:()=>e("/profile"),className:"w-full px-4 py-2 text-black font-bold bg-cyan-500 hover:bg-cyan-400 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:t("edit_profile")})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-pink-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-pink-500 group-hover:text-white transition-colors",children:t("project")}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:t("portfolio_desc")}),o.jsx("button",{onClick:()=>e("/portfolio"),className:"w-full px-4 py-2 text-white font-bold bg-pink-600 hover:bg-pink-500 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:t("manage_portfolio")})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-purple-500 group-hover:text-white transition-colors",children:t("activities")}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:t("activities_desc")}),o.jsx("button",{onClick:()=>e("/dashboard/activities"),className:"w-full px-4 py-2 text-white font-bold bg-purple-600 hover:bg-purple-500 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:t("manage_activities")})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-yellow-500 group-hover:text-white transition-colors",children:t("manage_apps")}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:"Manage your application releases and APKs."}),o.jsx("button",{onClick:()=>e("/dashboard/apps"),className:"w-full px-4 py-2 text-black font-bold bg-yellow-500 hover:bg-yellow-400 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:t("manage_apps")})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-green-500 group-hover:text-white transition-colors",children:"Manage Services"}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:"Manage your service packages and pricing."}),o.jsx("button",{onClick:()=>e("/dashboard/services"),className:"w-full px-4 py-2 text-white font-bold bg-green-600 hover:bg-green-500 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:"Manage Services"})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-orange-500 group-hover:text-white transition-colors",children:"Manage Orders"}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:"Manage orders and print invoices for your clients."}),o.jsx("button",{onClick:()=>e("/dashboard/orders"),className:"w-full px-4 py-2 text-black font-bold bg-orange-500 hover:bg-orange-400 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:"Manage Orders"})]}),o.jsxs("div",{className:"group p-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]",children:[o.jsx("h2",{className:"mb-4 text-xl font-bold text-blue-500 group-hover:text-white transition-colors",children:"Live Web Chat"}),o.jsx("p",{className:"mb-6 text-gray-400 text-sm leading-relaxed",children:"Handle AI Chat Handoffs and communicate with visitors in real-time."}),o.jsx("button",{onClick:()=>e("/dashboard/chats"),className:"w-full px-4 py-2 text-white font-bold bg-blue-600 hover:bg-blue-500 transition-colors clip-path-polygon",style:{clipPath:"polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)"},children:"Open Live Chat"})]})]})]})};export{qe as default};
