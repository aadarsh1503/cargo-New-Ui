import{R as w,r as d}from"./vendor-CNksxvG0.js";var M={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},I=w.createContext&&w.createContext(M),U=["attr","size","title"];function V(e,t){if(e==null)return{};var r=q(e,t),i,n;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)i=a[n],!(t.indexOf(i)>=0)&&Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}function q(e,t){if(e==null)return{};var r={};for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){if(t.indexOf(i)>=0)continue;r[i]=e[i]}return r}function D(){return D=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&(e[i]=r[i])}return e},D.apply(this,arguments)}function A(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter(function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable})),r.push.apply(r,i)}return r}function C(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?A(Object(r),!0).forEach(function(i){B(e,i,r[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):A(Object(r)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(r,i))})}return e}function B(e,t,r){return t=G(t),t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function G(e){var t=K(e,"string");return typeof t=="symbol"?t:t+""}function K(e,t){if(typeof e!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var i=r.call(e,t||"default");if(typeof i!="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function F(e){return e&&e.map((t,r)=>w.createElement(t.tag,C({key:r},t.attr),F(t.child)))}function Le(e){return t=>w.createElement(Y,D({attr:C({},e.attr)},t),F(e.child))}function Y(e){var t=r=>{var{attr:i,size:n,title:a}=e,s=V(e,U),o=n||r.size||"1em",l;return r.className&&(l=r.className),e.className&&(l=(l?l+" ":"")+e.className),w.createElement("svg",D({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},r.attr,i,s,{className:l,style:C(C({color:e.color||r.color},r.style),e.style),height:o,width:o,xmlns:"http://www.w3.org/2000/svg"}),a&&w.createElement("title",null,a),e.children)};return I!==void 0?w.createElement(I.Consumer,null,r=>t(r)):t(M)}let Z={data:""},J=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||Z,X=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Q=/\/\*[^]*?\*\/|  +/g,T=/\n+/g,h=(e,t)=>{let r="",i="",n="";for(let a in e){let s=e[a];a[0]=="@"?a[1]=="i"?r=a+" "+s+";":i+=a[1]=="f"?h(s,a):a+"{"+h(s,a[1]=="k"?"":t)+"}":typeof s=="object"?i+=h(s,t?t.replace(/([^,])+/g,o=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,o):o?o+" "+l:l)):a):s!=null&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),n+=h.p?h.p(a,s):a+":"+s+";")}return r+(t&&n?t+"{"+n+"}":n)+i},y={},H=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+H(e[r]);return t}return e},ee=(e,t,r,i,n)=>{let a=H(e),s=y[a]||(y[a]=(l=>{let c=0,u=11;for(;c<l.length;)u=101*u+l.charCodeAt(c++)>>>0;return"go"+u})(a));if(!y[s]){let l=a!==e?e:(c=>{let u,m,f=[{}];for(;u=X.exec(c.replace(Q,""));)u[4]?f.shift():u[3]?(m=u[3].replace(T," ").trim(),f.unshift(f[0][m]=f[0][m]||{})):f[0][u[1]]=u[2].replace(T," ").trim();return f[0]})(e);y[s]=h(n?{["@keyframes "+s]:l}:l,r?"":"."+s)}let o=r&&y.g?y.g:null;return r&&(y.g=y[s]),((l,c,u,m)=>{m?c.data=c.data.replace(m,l):c.data.indexOf(l)===-1&&(c.data=u?l+c.data:c.data+l)})(y[s],t,i,o),s},te=(e,t,r)=>e.reduce((i,n,a)=>{let s=t[a];if(s&&s.call){let o=s(r),l=o&&o.props&&o.props.className||/^go/.test(o)&&o;s=l?"."+l:o&&typeof o=="object"?o.props?"":h(o,""):o===!1?"":o}return i+n+(s??"")},"");function z(e){let t=this||{},r=e.call?e(t.p):e;return ee(r.unshift?r.raw?te(r,[].slice.call(arguments,1),t.p):r.reduce((i,n)=>Object.assign(i,n&&n.call?n(t.p):n),{}):r,J(t.target),t.g,t.o,t.k)}let L,_,k;z.bind({g:1});let b=z.bind({k:1});function re(e,t,r,i){h.p=t,L=e,_=r,k=i}function v(e,t){let r=this||{};return function(){let i=arguments;function n(a,s){let o=Object.assign({},a),l=o.className||n.className;r.p=Object.assign({theme:_&&_()},o),r.o=/ *go\d+/.test(l),o.className=z.apply(r,i)+(l?" "+l:"");let c=e;return e[0]&&(c=o.as||e,delete o.as),k&&c[0]&&k(o),L(c,o)}return n}}var ae=e=>typeof e=="function",N=(e,t)=>ae(e)?e(t):e,ie=(()=>{let e=0;return()=>(++e).toString()})(),R=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),oe=20,W=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,oe)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:r}=t;return W(e,{type:e.toasts.find(a=>a.id===r.id)?1:0,toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(a=>a.id===i||i===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+n}))}}},$=[],x={toasts:[],pausedAt:void 0},O=e=>{x=W(x,e),$.forEach(t=>{t(x)})},ne={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},se=(e={})=>{let[t,r]=d.useState(x),i=d.useRef(x);d.useEffect(()=>(i.current!==x&&r(x),$.push(r),()=>{let a=$.indexOf(r);a>-1&&$.splice(a,1)}),[]);let n=t.toasts.map(a=>{var s,o,l;return{...e,...e[a.type],...a,removeDelay:a.removeDelay||((s=e[a.type])==null?void 0:s.removeDelay)||(e==null?void 0:e.removeDelay),duration:a.duration||((o=e[a.type])==null?void 0:o.duration)||(e==null?void 0:e.duration)||ne[a.type],style:{...e.style,...(l=e[a.type])==null?void 0:l.style,...a.style}}});return{...t,toasts:n}},le=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||ie()}),j=e=>(t,r)=>{let i=le(t,e,r);return O({type:2,toast:i}),i.id},p=(e,t)=>j("blank")(e,t);p.error=j("error");p.success=j("success");p.loading=j("loading");p.custom=j("custom");p.dismiss=e=>{O({type:3,toastId:e})};p.remove=e=>O({type:4,toastId:e});p.promise=(e,t,r)=>{let i=p.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(n=>{let a=t.success?N(t.success,n):void 0;return a?p.success(a,{id:i,...r,...r==null?void 0:r.success}):p.dismiss(i),n}).catch(n=>{let a=t.error?N(t.error,n):void 0;a?p.error(a,{id:i,...r,...r==null?void 0:r.error}):p.dismiss(i)}),e};var ce=(e,t)=>{O({type:1,toast:{id:e,height:t}})},de=()=>{O({type:5,time:Date.now()})},E=new Map,ue=1e3,pe=(e,t=ue)=>{if(E.has(e))return;let r=setTimeout(()=>{E.delete(e),O({type:4,toastId:e})},t);E.set(e,r)},fe=e=>{let{toasts:t,pausedAt:r}=se(e);d.useEffect(()=>{if(r)return;let a=Date.now(),s=t.map(o=>{if(o.duration===1/0)return;let l=(o.duration||0)+o.pauseDuration-(a-o.createdAt);if(l<0){o.visible&&p.dismiss(o.id);return}return setTimeout(()=>p.dismiss(o.id),l)});return()=>{s.forEach(o=>o&&clearTimeout(o))}},[t,r]);let i=d.useCallback(()=>{r&&O({type:6,time:Date.now()})},[r]),n=d.useCallback((a,s)=>{let{reverseOrder:o=!1,gutter:l=8,defaultPosition:c}=s||{},u=t.filter(g=>(g.position||c)===(a.position||c)&&g.height),m=u.findIndex(g=>g.id===a.id),f=u.filter((g,S)=>S<m&&g.visible).length;return u.filter(g=>g.visible).slice(...o?[f+1]:[0,f]).reduce((g,S)=>g+(S.height||0)+l,0)},[t]);return d.useEffect(()=>{t.forEach(a=>{if(a.dismissed)pe(a.id,a.removeDelay);else{let s=E.get(a.id);s&&(clearTimeout(s),E.delete(a.id))}})},[t]),{toasts:t,handlers:{updateHeight:ce,startPause:de,endPause:i,calculateOffset:n}}},me=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ge=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ye=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,be=v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${me} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ge} 0.15s ease-out forwards;
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
`,he=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ve=v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${he} 1s linear infinite;
`,xe=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,we=b`
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
}`,Oe=v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${xe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${we} 0.2s ease-out forwards;
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
`,Ee=v("div")`
  position: absolute;
`,je=v("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Pe=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,$e=v("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Pe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,De=({toast:e})=>{let{icon:t,type:r,iconTheme:i}=e;return t!==void 0?typeof t=="string"?d.createElement($e,null,t):t:r==="blank"?null:d.createElement(je,null,d.createElement(ve,{...i}),r!=="loading"&&d.createElement(Ee,null,r==="error"?d.createElement(be,{...i}):d.createElement(Oe,{...i})))},Ce=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ne=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,ze="0%{opacity:0;} 100%{opacity:1;}",Se="0%{opacity:1;} 100%{opacity:0;}",_e=v("div")`
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
`,ke=v("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ie=(e,t)=>{let r=e.includes("top")?1:-1,[i,n]=R()?[ze,Se]:[Ce(r),Ne(r)];return{animation:t?`${b(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(n)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Ae=d.memo(({toast:e,position:t,style:r,children:i})=>{let n=e.height?Ie(e.position||t||"top-center",e.visible):{opacity:0},a=d.createElement(De,{toast:e}),s=d.createElement(ke,{...e.ariaProps},N(e.message,e));return d.createElement(_e,{className:e.className,style:{...n,...r,...e.style}},typeof i=="function"?i({icon:a,message:s}):d.createElement(d.Fragment,null,a,s))});re(d.createElement);var Te=({id:e,className:t,style:r,onHeightUpdate:i,children:n})=>{let a=d.useCallback(s=>{if(s){let o=()=>{let l=s.getBoundingClientRect().height;i(e,l)};o(),new MutationObserver(o).observe(s,{subtree:!0,childList:!0,characterData:!0})}},[e,i]);return d.createElement("div",{ref:a,className:t,style:r},n)},Me=(e,t)=>{let r=e.includes("top"),i=r?{top:0}:{bottom:0},n=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:R()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...i,...n}},Fe=z`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,P=16,Re=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:i,children:n,containerStyle:a,containerClassName:s})=>{let{toasts:o,handlers:l}=fe(r);return d.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:P,left:P,right:P,bottom:P,pointerEvents:"none",...a},className:s,onMouseEnter:l.startPause,onMouseLeave:l.endPause},o.map(c=>{let u=c.position||t,m=l.calculateOffset(c,{reverseOrder:e,gutter:i,defaultPosition:t}),f=Me(u,m);return d.createElement(Te,{id:c.id,key:c.id,onHeightUpdate:l.updateHeight,className:c.visible?Fe:"",style:f},c.type==="custom"?N(c.message,c):n?n(c):d.createElement(Ae,{toast:c,position:u}))}))},We=p;export{Le as G,Re as O,We as V};
