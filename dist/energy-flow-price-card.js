/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),w=x(2),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

const DEFAULT_PRICE_STOPS = [
  { value: 0.0, color: "#3b82f6" },  // blauw
  { value: 0.2, color: "#3b82f6" },  // blauw tot 0,20
  { value: 0.25, color: "#22c55e" }, // groen
  { value: 0.35, color: "#eab308" }, // geel
  { value: 0.7, color: "#ef4444" },  // rood
];

// Layout profiles: bootstrap the price chart to look like a known provider app.
// "bars"           -> classic bar chart, colored per price via a stop gradient (like today).
// "line"           -> smooth single-color line, no per-price coloring (Frank Energie style).
// "line-threshold" -> smooth line/area colored by whether a value is above or below the
//                      average of the shown prices (Tibber style).
const PRICE_PROFILES = {
  default: {
    chart_style: "bars",
    price_stops: DEFAULT_PRICE_STOPS,
  },
  zonneplan: {
    chart_style: "bars",
    price_stops: [
      { value: 0.0, color: "#bbf7d0" },
      { value: 0.15, color: "#4ade80" },
      { value: 0.25, color: "#16a34a" },
      { value: 0.35, color: "#15803d" },
      { value: 0.6, color: "#052e16" },
    ],
    grey_past: true,          // hours that have already passed render grey instead of price-colored
    grey_unknown_value: 0.20, // slots without a known price yet render as a grey bar at this reference height
  },
  frank: {
    chart_style: "line",
    line_color: "#F2994A",
  },
  tibber: {
    chart_style: "line-threshold",
    color_below: "#00C9A7",
    color_above: "#FF7A29",
  },
  anwb: {
    chart_style: "bars",
    highlight_now: true, // color is not price-based: flat bar_color, except the current hour
    bar_color: "#1c4e80",
    bar_color_now: "#29b6f6",
  },
  eneco: {
    chart_style: "bars",
    bar_radius: "6px 6px 0 0",
    price_stops: [
      { value: 0.0, color: "#43a047" },
      { value: 0.299, color: "#43a047" },
      { value: 0.30, color: "#e53935" },
      { value: 1.0, color: "#e53935" },
    ],
  },
};

const DEFAULTS = {
  show_flow: true,
  show_price: true,
  display_zero: false,
  price_hours: 24,
  price_start: "midnight", // "now" | "midnight"
  price_lookback_hours: 2, // 1-12: how far back the axis starts when price_start is "now"
  car_mode: "scroll",       // "scroll" | "merged"
  car_scroll_interval: 5,   // seconds
  language: "auto",         // "auto" | "nl" | "en" | "de"
  flow_speed: 1.0,          // overall speed multiplier for the flowing dashes
  flow_max_power: 5000,     // W at which flow runs at full speed (and above)
  flow_off_delay: 20,       // seconds at ~0 W before a line fades out
  price_unit: "€/kWh",
  color_solar: "#f5c518",
  color_battery: "#4caf50",
  color_grid: "#ff6b5e",
  color_car: "#a78bfa",
  color_home: "#7dd3fc",
  include_car_in_home: false,
  battery_ring: true, // false = plain square icon like the other nodes, instead of the SoC ring
  car_ring: true,     // false = plain square icon; ring tracks whichever car is currently shown
  use_visual_layout: false, // true = show a house photo behind the flow diagram instead of abstract wires
  price_stops: DEFAULT_PRICE_STOPS,
  price_profile: "default", // "default" | "zonneplan" | "frank" | "tibber" | "anwb" | "eneco"
  price_relative_hours: false, // extra x-axis row: hours counted from now ("nu", 1, 2, 3…)
  price_show_day_marker: false, // thin line + "tomorrow" label where the axis crosses midnight
  gas_price_entity: "", // optional: shown next to the electricity price in the chart header
  chart_auto_scroll: false, // cycle price -> solar -> battery tabs automatically
  chart_scroll_interval: 8, // seconds between automatic tab switches
};

const TRANSLATIONS = {
  en: {
    // flow
    solar: "Solar",
    home: "Home",
    grid: "Grid",
    battery: "Battery",
    car: "Car",
    import: "import",
    export: "export",
    charging: "charging",
    discharging: "discharging",
    // charts
    price_title: "Rates",
    solar_today: "Solar today",
    battery_today: "Battery SoC today",
    now: "Now",
    tomorrow: "tomorrow",
    tab_price: "Price",
    tab_solar: "Solar",
    tab_battery: "Battery",
    history_loading: "Loading history…",
    history_none: "No history available.",
    // editor
    ed_display: "Display",
    ed_show_flow: "Show flow",
    ed_show_price: "Show charts",
    ed_display_zero: "Show empty branches (display zero)",
    ed_battery_ring: "Battery icon as a ring (off = square, like the other icons)",
    ed_car_ring: "Car icon as a ring (off = square, like the other icons)",
    ed_visual_layout: "Use visual layout (house photo instead of abstract wires)",
    ed_entities: "Entities",
    ed_home_note: "Home usage is calculated automatically: solar + grid + battery-discharge − battery-charge.",
    ed_solar_power: "Solar power (W)",
    ed_grid_power: "Grid / P1 power (W, + = import, − = export)",
    ed_battery_charge: "Battery charge (W)",
    ed_battery_discharge: "Battery discharge (W)",
    ed_battery_soc: "Battery SoC (%)",
    ed_price_entity: "Price provider entity (€/kWh or your currency)",
    ed_gas_price_entity: "Gas price entity (€/m³) — optional",
    ed_cars: "Cars",
    ed_add_car: "+ Add car",
    ed_car_note: "Each car gets its own name. The node appears when charging (or always with display zero on).",
    ed_no_cars: "No cars added yet.",
    ed_car_display: "Display with multiple cars",
    ed_car_scroll: "Auto-scroll (cycles automatically)",
    ed_car_merged: "Static (1 icon, info of all)",
    ed_car_interval: "Cycle interval",
    ed_car_name: "Name",
    ed_car_power: "Charge power (W)",
    ed_car_soc: "Car SoC (%) — optional",
    ed_remove_car: "Remove car",
    ed_price_window: "Price window",
    ed_hours_shown: "Hours shown",
    ed_start_point: "Chart start point",
    ed_start_midnight: "From midnight (days)",
    ed_start_now: "From now",
    ed_lookback_hours: "Hours to look back",
    ed_relative_hours: "Show hours-from-now row below the axis (now, 1, 2, 3…)",
    ed_day_marker: "Show new-day marker (\"tomorrow\") where the axis crosses midnight",
    ed_layout: "Layout",
    ed_layout_profile: "Price chart style",
    ed_layout_note: "A profile fixes the chart style and colors to match that provider's app. The manual price color scale below is only available for \"Default\".",
    ed_profile_default: "Default (bars, custom colors)",
    ed_profile_zonneplan: "Zonneplan (green bars)",
    ed_profile_tibber: "Tibber (smooth line, teal/orange)",
    ed_profile_frank: "Frank Energie (smooth orange line)",
    ed_profile_anwb: "ANWB (blue bars, current hour highlighted)",
    ed_profile_eneco: "Eneco (green/red at €0.30, rounded bars)",
    ed_chart_tabs: "Chart tabs",
    ed_chart_tabs_note: "When multiple chart tabs are available (price / solar / battery), automatically cycle through them.",
    ed_chart_auto_scroll: "Auto-scroll through tabs",
    ed_chart_scroll_interval: "Switch every",
    ed_colors: "Colors",
    ed_reset_colors: "Restore default colors",
    ed_color_solar: "Solar color",
    ed_color_battery: "Battery color",
    ed_color_grid: "Grid color",
    ed_color_car: "Car color",
    ed_color_home: "Home color",
    ed_price_scale: "Price color scale (price → color)",
    ed_price_scale_note: "Colors blend smoothly between points. Add points for a finer gradient.",
    ed_add_point: "+ Add point",
    ed_remove: "Remove",
    ed_language: "Language",
    ed_lang_auto: "Automatic (follow Home Assistant)",
    ed_flow: "Flow animation",
    ed_flow_speed: "Flow speed",
    ed_flow_max_power: "Full-speed power (W)",
    ed_flow_off_delay: "Turn off after (s)",
  },
  nl: {
    solar: "Solar",
    home: "Huis",
    grid: "Net",
    battery: "Accu",
    car: "Auto",
    import: "import",
    export: "export",
    charging: "laden",
    discharging: "ontladen",
    price_title: "Tarieven",
    solar_today: "Solar vandaag",
    battery_today: "Accu SoC vandaag",
    now: "Nu",
    tomorrow: "morgen",
    tab_price: "Prijs",
    tab_solar: "Solar",
    tab_battery: "Accu",
    history_loading: "Historie laden…",
    history_none: "Geen historie beschikbaar.",
    ed_display: "Weergave",
    ed_show_flow: "Flow tonen",
    ed_show_price: "Grafieken tonen",
    ed_display_zero: "Lege takken tonen (display zero)",
    ed_battery_ring: "Accu-icoon als cirkel (uit = vierkant, zoals de andere iconen)",
    ed_car_ring: "Auto-icoon als cirkel (uit = vierkant, zoals de andere iconen)",
    ed_visual_layout: "Gebruik visuele weergave (huisfoto in plaats van abstracte lijnen)",
    ed_entities: "Entiteiten",
    ed_home_note: "Huisverbruik wordt automatisch berekend: solar + net + accu-ontladen − accu-laden.",
    ed_solar_power: "Solar vermogen (W)",
    ed_grid_power: "Net / P1 vermogen (W, + = import, − = export)",
    ed_battery_charge: "Accu laden (W)",
    ed_battery_discharge: "Accu ontladen (W)",
    ed_battery_soc: "Accu SoC (%)",
    ed_price_entity: "Prijs energieleverancier (€/kWh)",
    ed_gas_price_entity: "Gasprijs entiteit (€/m³) — optioneel",
    ed_cars: "Auto's",
    ed_add_car: "+ Auto toevoegen",
    ed_car_note: "Elke auto krijgt een eigen naam. De node verschijnt bij laden (of altijd met display zero aan).",
    ed_no_cars: "Nog geen auto's toegevoegd.",
    ed_car_display: "Weergave bij meerdere auto's",
    ed_car_scroll: "Auto-scroll (wisselt vanzelf)",
    ed_car_merged: "Statisch (1 icoon, beide info)",
    ed_car_interval: "Wisselinterval",
    ed_car_name: "Naam",
    ed_car_power: "Laadvermogen (W)",
    ed_car_soc: "Auto SoC (%) — optioneel",
    ed_remove_car: "Verwijder auto",
    ed_price_window: "Prijsvenster",
    ed_hours_shown: "Uren tonen",
    ed_start_point: "Startpunt grafiek",
    ed_start_midnight: "Vanaf middernacht (dagen)",
    ed_start_now: "Vanaf nu",
    ed_lookback_hours: "Uren terugkijken",
    ed_relative_hours: "Toon uren-vanaf-nu rij onder de as (nu, 1, 2, 3…)",
    ed_day_marker: "Toon nieuwe-dag-lijntje (\"morgen\") waar de as middernacht kruist",
    ed_layout: "Layout",
    ed_layout_profile: "Stijl prijsgrafiek",
    ed_layout_note: "Een profiel zet de grafiekstijl en kleuren vast, passend bij de app van die leverancier. De handmatige prijs-kleurschaal hieronder is alleen beschikbaar bij \"Standaard\".",
    ed_profile_default: "Standaard (staven, eigen kleuren)",
    ed_profile_zonneplan: "Zonneplan (groene staven)",
    ed_profile_tibber: "Tibber (vloeiende lijn, teal/oranje)",
    ed_profile_frank: "Frank Energie (vloeiende oranje lijn)",
    ed_profile_anwb: "ANWB (blauwe staven, huidig uur licht)",
    ed_profile_eneco: "Eneco (groen/rood bij €0,30, afgeronde staven)",
    ed_chart_tabs: "Grafiektabs",
    ed_chart_tabs_note: "Wissel automatisch tussen de beschikbare tabbladen (prijs / solar / accu) als er meerdere zijn.",
    ed_chart_auto_scroll: "Automatisch wisselen tussen tabs",
    ed_chart_scroll_interval: "Wissel elke",
    ed_colors: "Kleuren",
    ed_reset_colors: "Standaardkleuren herstellen",
    ed_color_solar: "Kleur solar",
    ed_color_battery: "Kleur accu",
    ed_color_grid: "Kleur net",
    ed_color_car: "Kleur auto",
    ed_color_home: "Kleur huis",
    ed_price_scale: "Prijs-kleurschaal (€/kWh → kleur)",
    ed_price_scale_note: "Kleuren lopen vloeiend over tussen de punten. Voeg punten toe voor een fijnere overgang.",
    ed_add_point: "+ Punt toevoegen",
    ed_remove: "Verwijder",
    ed_language: "Taal",
    ed_lang_auto: "Automatisch (volg Home Assistant)",
    ed_flow: "Flow-animatie",
    ed_flow_speed: "Flow-snelheid",
    ed_flow_max_power: "Vermogen voor topsnelheid (W)",
    ed_flow_off_delay: "Uitschakelen na (s)",
  },
  de: {
    solar: "Solar",
    home: "Haus",
    grid: "Netz",
    battery: "Akku",
    car: "Auto",
    import: "Import",
    export: "Export",
    charging: "laden",
    discharging: "entladen",
    price_title: "Tarife",
    solar_today: "Solar heute",
    battery_today: "Akku SoC heute",
    now: "Jetzt",
    tomorrow: "morgen",
    tab_price: "Preis",
    tab_solar: "Solar",
    tab_battery: "Akku",
    history_loading: "Verlauf wird geladen…",
    history_none: "Kein Verlauf verfügbar.",
    ed_display: "Anzeige",
    ed_show_flow: "Fluss anzeigen",
    ed_show_price: "Diagramme anzeigen",
    ed_display_zero: "Leere Zweige anzeigen (display zero)",
    ed_battery_ring: "Akku-Symbol als Ring (aus = quadratisch, wie die anderen Symbole)",
    ed_car_ring: "Auto-Symbol als Ring (aus = quadratisch, wie die anderen Symbole)",
    ed_visual_layout: "Visuelle Ansicht verwenden (Hausfoto statt abstrakter Linien)",
    ed_entities: "Entitäten",
    ed_home_note: "Hausverbrauch wird automatisch berechnet: Solar + Netz + Akku-Entladung − Akku-Ladung.",
    ed_solar_power: "Solar-Leistung (W)",
    ed_grid_power: "Netz / P1 Leistung (W, + = Import, − = Export)",
    ed_battery_charge: "Akku laden (W)",
    ed_battery_discharge: "Akku entladen (W)",
    ed_battery_soc: "Akku SoC (%)",
    ed_price_entity: "Preis-Anbieter Entität (€/kWh)",
    ed_gas_price_entity: "Gaspreis-Entität (€/m³) — optional",
    ed_cars: "Autos",
    ed_add_car: "+ Auto hinzufügen",
    ed_car_note: "Jedes Auto erhält einen eigenen Namen. Der Knoten erscheint beim Laden (oder immer mit display zero).",
    ed_no_cars: "Noch keine Autos hinzugefügt.",
    ed_car_display: "Anzeige bei mehreren Autos",
    ed_car_scroll: "Auto-Scroll (wechselt automatisch)",
    ed_car_merged: "Statisch (1 Icon, alle Infos)",
    ed_car_interval: "Wechselintervall",
    ed_car_name: "Name",
    ed_car_power: "Ladeleistung (W)",
    ed_car_soc: "Auto SoC (%) — optional",
    ed_remove_car: "Auto entfernen",
    ed_price_window: "Preisfenster",
    ed_hours_shown: "Stunden anzeigen",
    ed_start_point: "Startpunkt Diagramm",
    ed_start_midnight: "Ab Mitternacht (Tage)",
    ed_start_now: "Ab jetzt",
    ed_lookback_hours: "Stunden zurückblicken",
    ed_relative_hours: "Zeile „Stunden ab jetzt“ unter der Achse anzeigen (jetzt, 1, 2, 3…)",
    ed_day_marker: "Neuer-Tag-Markierung (\"morgen\") anzeigen, wo die Achse Mitternacht kreuzt",
    ed_layout: "Layout",
    ed_layout_profile: "Preisdiagramm-Stil",
    ed_layout_note: "Ein Profil legt den Diagrammstil und die Farben fest, passend zur App dieses Anbieters. Die manuelle Preis-Farbskala unten ist nur bei \"Standard\" verfügbar.",
    ed_profile_default: "Standard (Balken, eigene Farben)",
    ed_profile_zonneplan: "Zonneplan (grüne Balken)",
    ed_profile_tibber: "Tibber (weiche Linie, Türkis/Orange)",
    ed_profile_frank: "Frank Energie (weiche orange Linie)",
    ed_profile_anwb: "ANWB (blaue Balken, aktuelle Stunde hervorgehoben)",
    ed_profile_eneco: "Eneco (Grün/Rot bei 0,30 €, abgerundete Balken)",
    ed_chart_tabs: "Diagramm-Tabs",
    ed_chart_tabs_note: "Automatisch zwischen den verfügbaren Tabs wechseln (Preis / Solar / Akku), wenn mehrere vorhanden sind.",
    ed_chart_auto_scroll: "Automatisch durch Tabs wechseln",
    ed_chart_scroll_interval: "Wechseln alle",
    ed_colors: "Farben",
    ed_reset_colors: "Standardfarben wiederherstellen",
    ed_color_solar: "Farbe Solar",
    ed_color_battery: "Farbe Akku",
    ed_color_grid: "Farbe Netz",
    ed_color_car: "Farbe Auto",
    ed_color_home: "Farbe Haus",
    ed_price_scale: "Preis-Farbskala (Preis → Farbe)",
    ed_price_scale_note: "Farben gehen fließend zwischen den Punkten über. Punkte hinzufügen für einen feineren Verlauf.",
    ed_add_point: "+ Punkt hinzufügen",
    ed_remove: "Entfernen",
    ed_language: "Sprache",
    ed_lang_auto: "Automatisch (Home Assistant folgen)",
    ed_flow: "Fluss-Animation",
    ed_flow_speed: "Fluss-Geschwindigkeit",
    ed_flow_max_power: "Leistung für Höchstgeschwindigkeit (W)",
    ed_flow_off_delay: "Ausschalten nach (s)",
  },
};

// Resolve language: explicit config override > HA language > 'en'
function resolveLang(configLang, hass) {
  const supported = ["nl", "en", "de"];
  if (configLang && configLang !== "auto" && supported.includes(configLang)) return configLang;
  const haLang = (hass?.language || hass?.locale?.language || "en").slice(0, 2).toLowerCase();
  return supported.includes(haLang) ? haLang : "en";
}

function t(lang, key) {
  const table = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return table[key] ?? TRANSLATIONS.en[key] ?? key;
}

const VISUAL_HOUSE_IMAGE = "data:image/png;base64,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bXv/vS8tlmWlf0dE9L9xP/3CkwffLWs5WrN56FLX7vq4zba89D1ERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERI+0vwDJlhz2w7LPmQAAAABJRU5ErkJggg==";

class EnergyFlowPriceCardEditor extends i {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { ...config };
    if (!Array.isArray(this._config.cars)) this._config.cars = [];
  }

  _t(key) {
    return t(resolveLang(this._config?.language, this.hass), key);
  }

  _get(key, fallback) { return this._config?.[key] ?? fallback ?? ""; }

  _emit(next) {
    this._config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true })
    );
  }

  _toggle(key, ev) { this._emit({ ...this._config, [key]: ev.target.checked }); }

  _pickEntity(key, ev) {
    const v = ev.detail?.value ?? ev.target.value;
    const next = { ...this._config };
    if (v) next[key] = v; else delete next[key];
    this._emit(next);
  }

  _color(key, ev) { this._emit({ ...this._config, [key]: ev.target.value }); }
  _hours(ev) { this._emit({ ...this._config, price_hours: parseInt(ev.target.value, 10) }); }

  _resetColors() {
    const next = { ...this._config };
    ["color_solar", "color_battery", "color_grid", "color_car", "color_home"].forEach((k) => { next[k] = DEFAULTS[k]; });
    next.price_stops = DEFAULT_PRICE_STOPS.map((s) => ({ ...s }));
    this._emit(next);
  }

  _cars() { return Array.isArray(this._config?.cars) ? this._config.cars : []; }

  _carChange(i, field, ev) {
    const cars = this._cars().map((c) => ({ ...c }));
    const val = ev.detail?.value ?? ev.target.value;
    if (val === "" || val == null) delete cars[i][field]; else cars[i][field] = val;
    this._emit({ ...this._config, cars });
  }

  _addCar() {
    const cars = this._cars().map((c) => ({ ...c }));
    cars.push({ name: `${this._t("car")} ${cars.length + 1}`, power: "", soc: "" });
    this._emit({ ...this._config, cars });
  }

  _removeCar(i) {
    const cars = this._cars().map((c) => ({ ...c }));
    cars.splice(i, 1);
    this._emit({ ...this._config, cars });
  }

  _stops() {
    const s = this._config?.price_stops;
    return Array.isArray(s) && s.length ? s : DEFAULT_PRICE_STOPS;
  }
  _stopChange(i, field, ev) {
    const stops = this._stops().map((s) => ({ ...s }));
    stops[i][field] = field === "value" ? parseFloat(ev.target.value) : ev.target.value;
    this._emit({ ...this._config, price_stops: stops });
  }
  _addStop() {
    const stops = this._stops().map((s) => ({ ...s }));
    const last = stops[stops.length - 1];
    stops.push({ value: +(last.value + 0.1).toFixed(2), color: last.color });
    this._emit({ ...this._config, price_stops: stops });
  }
  _removeStop(i) {
    const stops = this._stops().map((s) => ({ ...s }));
    if (stops.length <= 2) return;
    stops.splice(i, 1);
    this._emit({ ...this._config, price_stops: stops });
  }

  render() {
    if (!this.hass || !this._config) return A;
    const T = (k) => this._t(k);
    const showFlow = this._config.show_flow !== false;
    const showPrice = this._config.show_price !== false;
    const displayZero = this._config.display_zero === true;
    const hours = this._config.price_hours ?? 24;
    const lookbackHours = this._config.price_lookback_hours ?? 2;
    const lang = this._config.language ?? "auto";
    const priceProfile = PRICE_PROFILES[this._config.price_profile] ? this._config.price_profile : "default";

    const entityFields = [
      { key: "solar_power", label: T("ed_solar_power") },
      { key: "grid_power", label: T("ed_grid_power") },
      { key: "battery_charge_power", label: T("ed_battery_charge") },
      { key: "battery_discharge_power", label: T("ed_battery_discharge") },
      { key: "battery_soc", label: T("ed_battery_soc") },
      { key: "price_entity", label: T("ed_price_entity") },
      { key: "gas_price_entity", label: T("ed_gas_price_entity") },
    ];
    const colorFields = [
      { key: "color_solar", label: T("ed_color_solar") },
      { key: "color_battery", label: T("ed_color_battery") },
      { key: "color_grid", label: T("ed_color_grid") },
      { key: "color_car", label: T("ed_color_car") },
      { key: "color_home", label: T("ed_color_home") },
    ];

    return b`
      <div class="root">
        <div class="section">
          <div class="head">${T("ed_display")}</div>
          <ha-formfield label=${T("ed_show_flow")}>
            <ha-switch .checked=${showFlow} @change=${(e) => this._toggle("show_flow", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_show_price")}>
            <ha-switch .checked=${showPrice} @change=${(e) => this._toggle("show_price", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_display_zero")}>
            <ha-switch .checked=${displayZero} @change=${(e) => this._toggle("display_zero", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_battery_ring")}>
            <ha-switch .checked=${this._config.battery_ring !== false} @change=${(e) => this._toggle("battery_ring", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_car_ring")}>
            <ha-switch .checked=${this._config.car_ring !== false} @change=${(e) => this._toggle("car_ring", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_visual_layout")}>
            <ha-switch .checked=${this._config.use_visual_layout === true} @change=${(e) => this._toggle("use_visual_layout", e)}></ha-switch>
          </ha-formfield>
          <label class="sel-row">
            <span>${T("ed_language")}</span>
            <select @change=${(e) => this._emit({ ...this._config, language: e.target.value })}>
              <option value="auto" ?selected=${lang === "auto"}>${T("ed_lang_auto")}</option>
              <option value="nl" ?selected=${lang === "nl"}>Nederlands</option>
              <option value="en" ?selected=${lang === "en"}>English</option>
              <option value="de" ?selected=${lang === "de"}>Deutsch</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="head">${T("ed_entities")}</div>
          <div class="note">${T("ed_home_note")}</div>
          ${entityFields.map(
            (f) => b`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._get(f.key)}
                .label=${f.label}
                allow-custom-entity
                @value-changed=${(e) => this._pickEntity(f.key, e)}
              ></ha-entity-picker>`
          )}
        </div>

        <div class="section">
          <div class="head">
            ${T("ed_cars")}
            <button class="add" @click=${() => this._addCar()}>${T("ed_add_car")}</button>
          </div>
          <div class="note">${T("ed_car_note")}</div>
          <label class="sel-row">
            <span>${T("ed_car_display")}</span>
            <select @change=${(e) => this._emit({ ...this._config, car_mode: e.target.value })}>
              <option value="scroll" ?selected=${(this._config.car_mode ?? "scroll") === "scroll"}>${T("ed_car_scroll")}</option>
              <option value="merged" ?selected=${this._config.car_mode === "merged"}>${T("ed_car_merged")}</option>
            </select>
          </label>
          ${(this._config.car_mode ?? "scroll") === "scroll" ? b`
            <div class="slider-row">
              <span>${T("ed_car_interval")}: <b>${this._config.car_scroll_interval ?? 5}s</b></span>
              <input type="range" min="2" max="15" step="1" .value=${this._config.car_scroll_interval ?? 5}
                @input=${(e) => this._emit({ ...this._config, car_scroll_interval: parseInt(e.target.value, 10) })} />
            </div>` : A}
          ${this._cars().length === 0 ? b`<div class="note">${T("ed_no_cars")}</div>` : A}
          ${this._cars().map(
            (car, i) => b`
              <div class="carblock">
                <div class="carhead">
                  <input
                    type="text"
                    class="carname-input"
                    placeholder=${T("ed_car_name")}
                    .value=${car.name ?? ""}
                    @change=${(e) => this._carChange(i, "name", e)}
                  />
                  <button class="mini" @click=${() => this._removeCar(i)} title=${T("ed_remove_car")}>✕</button>
                </div>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${car.power ?? ""}
                  .label=${T("ed_car_power")}
                  allow-custom-entity
                  @value-changed=${(e) => this._carChange(i, "power", e)}
                ></ha-entity-picker>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${car.soc ?? ""}
                  .label=${T("ed_car_soc")}
                  allow-custom-entity
                  @value-changed=${(e) => this._carChange(i, "soc", e)}
                ></ha-entity-picker>
              </div>`
          )}
        </div>

        <div class="section">
          <div class="head">${T("ed_price_window")}</div>
          <div class="slider-row">
            <span>${T("ed_hours_shown")}: <b>${hours}u</b></span>
            <input type="range" min="8" max="48" step="1" .value=${hours} @input=${(e) => this._hours(e)} />
          </div>
          <label class="sel-row">
            <span>${T("ed_start_point")}</span>
            <select @change=${(e) => this._emit({ ...this._config, price_start: e.target.value })}>
              <option value="midnight" ?selected=${(this._config.price_start ?? "midnight") === "midnight"}>${T("ed_start_midnight")}</option>
              <option value="now" ?selected=${this._config.price_start === "now"}>${T("ed_start_now")}</option>
            </select>
          </label>
          ${this._config.price_start === "now" ? b`
            <div class="slider-row">
              <span>${T("ed_lookback_hours")}: <b>${lookbackHours}u</b></span>
              <input type="range" min="1" max="12" step="1" .value=${lookbackHours}
                @input=${(e) => this._emit({ ...this._config, price_lookback_hours: parseInt(e.target.value, 10) })} />
            </div>` : A}
          <ha-formfield label=${T("ed_relative_hours")}>
            <ha-switch .checked=${this._config.price_relative_hours === true} @change=${(e) => this._toggle("price_relative_hours", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_day_marker")}>
            <ha-switch .checked=${this._config.price_show_day_marker === true} @change=${(e) => this._toggle("price_show_day_marker", e)}></ha-switch>
          </ha-formfield>
        </div>

        <div class="section">
          <div class="head">${T("ed_layout")}</div>
          <div class="note">${T("ed_layout_note")}</div>
          <label class="sel-row">
            <span>${T("ed_layout_profile")}</span>
            <select @change=${(e) => this._emit({ ...this._config, price_profile: e.target.value })}>
              <option value="default" ?selected=${priceProfile === "default"}>${T("ed_profile_default")}</option>
              <option value="zonneplan" ?selected=${priceProfile === "zonneplan"}>${T("ed_profile_zonneplan")}</option>
              <option value="tibber" ?selected=${priceProfile === "tibber"}>${T("ed_profile_tibber")}</option>
              <option value="frank" ?selected=${priceProfile === "frank"}>${T("ed_profile_frank")}</option>
              <option value="anwb" ?selected=${priceProfile === "anwb"}>${T("ed_profile_anwb")}</option>
              <option value="eneco" ?selected=${priceProfile === "eneco"}>${T("ed_profile_eneco")}</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="head">${T("ed_chart_tabs")}</div>
          <div class="note">${T("ed_chart_tabs_note")}</div>
          <ha-formfield label=${T("ed_chart_auto_scroll")}>
            <ha-switch .checked=${this._config.chart_auto_scroll === true} @change=${(e) => this._toggle("chart_auto_scroll", e)}></ha-switch>
          </ha-formfield>
          ${this._config.chart_auto_scroll === true ? b`
            <div class="slider-row">
              <span>${T("ed_chart_scroll_interval")}: <b>${this._config.chart_scroll_interval ?? 8}s</b></span>
              <input type="range" min="3" max="30" step="1" .value=${this._config.chart_scroll_interval ?? 8}
                @input=${(e) => this._emit({ ...this._config, chart_scroll_interval: parseInt(e.target.value, 10) })} />
            </div>` : A}
        </div>

        <div class="section">
          <div class="head">${T("ed_flow")}</div>
          <div class="slider-row">
            <span>${T("ed_flow_speed")}: <b>${(this._config.flow_speed ?? 1).toFixed(1)}×</b></span>
            <input type="range" min="0.2" max="3" step="0.1" .value=${this._config.flow_speed ?? 1}
              @input=${(e) => this._emit({ ...this._config, flow_speed: parseFloat(e.target.value) })} />
          </div>
          <div class="slider-row">
            <span>${T("ed_flow_max_power")}: <b>${this._config.flow_max_power ?? 5000} W</b></span>
            <input type="range" min="500" max="15000" step="500" .value=${this._config.flow_max_power ?? 5000}
              @input=${(e) => this._emit({ ...this._config, flow_max_power: parseInt(e.target.value, 10) })} />
          </div>
          <div class="slider-row">
            <span>${T("ed_flow_off_delay")}: <b>${this._config.flow_off_delay ?? 20}s</b></span>
            <input type="range" min="0" max="120" step="5" .value=${this._config.flow_off_delay ?? 20}
              @input=${(e) => this._emit({ ...this._config, flow_off_delay: parseInt(e.target.value, 10) })} />
          </div>
        </div>

        <div class="section">
          <div class="head">
            ${T("ed_colors")}
            <button class="reset" @click=${() => this._resetColors()}>${T("ed_reset_colors")}</button>
          </div>
          <div class="grid">
            ${colorFields.map(
              (f) => b`
                <label class="color">
                  <span>${f.label}</span>
                  <input type="color" .value=${this._get(f.key, DEFAULTS[f.key])}
                    @input=${(e) => this._color(f.key, e)} />
                </label>`
            )}
          </div>
        </div>

        ${priceProfile === "default" ? b`
          <div class="section">
            <div class="head">${T("ed_price_scale")}</div>
            <div class="note">${T("ed_price_scale_note")}</div>
            ${this._stops().map(
              (s, i) => b`
                <div class="stop-row">
                  <input type="number" step="0.01" .value=${s.value}
                    @input=${(e) => this._stopChange(i, "value", e)} />
                  <span class="unit">€/kWh</span>
                  <input type="color" .value=${s.color}
                    @input=${(e) => this._stopChange(i, "color", e)} />
                  <button class="mini" @click=${() => this._removeStop(i)} title=${T("ed_remove")}>✕</button>
                </div>`
            )}
            <button class="add" @click=${() => this._addStop()}>${T("ed_add_point")}</button>
          </div>
        ` : A}
      </div>
    `;
  }

  static get styles() {
    return i$3`
      .root { display: flex; flex-direction: column; gap: 18px; padding: 4px; }
      .section { display: flex; flex-direction: column; gap: 8px; }
      .head { font-weight: 600; font-size: 14px; margin-bottom: 2px; color: var(--primary-text-color); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .note { font-size: 11.5px; color: var(--secondary-text-color); line-height: 1.4; }
      ha-entity-picker { display: block; width: 100%; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .carname-input { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color, #1c1c2e); color: var(--primary-text-color); font-size: 14px; }
      .carname-input::placeholder { color: var(--secondary-text-color); }
      .color { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
      .color input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
      .slider-row { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
      .slider-row input[type="range"] { width: 100%; }
      .sel-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
      .sel-row select { padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .carblock { border: 1px solid var(--divider-color); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
      .carhead { display: flex; align-items: center; gap: 8px; }
      .stop-row { display: flex; align-items: center; gap: 8px; }
      .stop-row input[type="number"] { width: 80px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .stop-row input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
      .stop-row .unit { font-size: 12px; color: var(--secondary-text-color); }
      .reset, .add, .mini { cursor: pointer; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color); border-radius: 8px; padding: 5px 10px; font-size: 12px; }
      .mini { border-color: var(--error-color, #ef4444); color: var(--error-color, #ef4444); padding: 2px 8px; }
      .add { align-self: flex-start; }
    `;
  }
}

customElements.define("energy-flow-price-card-editor", EnergyFlowPriceCardEditor);

let _efpUidCounter = 0;

// Bring a provider price value into a sane EUR/kWh range.
// Some integrations report scaled integers (e.g. Zonneplan uses value x1e7,
// where 0.30 EUR/kWh arrives as 3000000). We divide by the power-of-ten scale
// that lands the value closest to a typical tariff (~0.05..1.00 EUR/kWh).
function normalizePrice(v) {
  if (v == null || isNaN(v)) return v;
  const a = Math.abs(v);
  if (a === 0) return 0;
  // Already a plausible EUR/kWh value.
  if (a >= 0.005 && a <= 5) return v;
  // Try each power of ten; choose the scaling that lands in the typical band.
  const scales = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];
  let best = v, bestScore = Infinity;
  for (const s of scales) {
    const scaled = a / s;
    if (scaled < 0.02 || scaled > 2) continue;          // outside typical tariff band
    const score = Math.abs(Math.log(scaled / 0.25));     // closeness to ~0.25 EUR/kWh
    if (score < bestScore) { bestScore = score; best = v / s; }
  }
  return best;
}

function num(hass, entity) {
  if (!entity || !hass || !hass.states[entity]) return null;
  const v = parseFloat(hass.states[entity].state);
  return isNaN(v) ? null : v;
}

function fmtPower(w) {
  if (w === null) return "–";
  const a = Math.abs(w);
  if (a >= 1000) return (w / 1000).toFixed(2).replace(".", ",") + " kW";
  return Math.round(w) + " W";
}

function hex2rgb(h) {
  const m = h.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function rgb2hex(r, g, b) {
  const c = (x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function colorForValue(value, stops) {
  if (!stops || !stops.length) return "#888";
  const s = [...stops].sort((a, b) => a.value - b.value);
  if (value <= s[0].value) return s[0].color;
  if (value >= s[s.length - 1].value) return s[s.length - 1].color;
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1];
    if (value >= a.value && value <= b.value) {
      const t = (value - a.value) / (b.value - a.value || 1);
      const ca = hex2rgb(a.color), cb = hex2rgb(b.color);
      return rgb2hex(ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t);
    }
  }
  return s[s.length - 1].color;
}

// Catmull-Rom-style smoothing converted to cubic beziers, for the "line" layout profiles.
function catmullRomToBezierPath(pts) {
  if (!pts.length) return "";
  if (pts.length === 1) return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  if (pts.length === 2) {
    return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)} L${pts[1].x.toFixed(2)},${pts[1].y.toFixed(2)}`;
  }
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

class EnergyFlowPriceCard extends i {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  constructor() {
    super();
    this._uid = ++_efpUidCounter;
  }

  static getConfigElement() {
    return document.createElement("energy-flow-price-card-editor");
  }

  static getStubConfig() {
    return {
      show_flow: true,
      show_price: true,
      solar_power: "",
      grid_power: "",
      battery_charge_power: "",
      battery_discharge_power: "",
      battery_soc: "",
      cars: [],
      price_entity: "",
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...DEFAULTS, ...config };
    if (!Array.isArray(this._config.price_stops) || !this._config.price_stops.length) {
      this._config.price_stops = DEFAULT_PRICE_STOPS;
    }
    if (!PRICE_PROFILES[this._config.price_profile]) {
      this._config.price_profile = "default";
    }
    if (!Array.isArray(this._config.cars)) this._config.cars = [];
    if (this._carScrollIdx == null) this._carScrollIdx = 0;
    this._startCarScroll();
    this._startChartScroll();
  }

  getCardSize() {
    return (this._config.show_flow ? 3 : 0) + (this._config.show_price ? 3 : 0) || 1;
  }

  _homePower(v) {
    if (v.solar === null && v.grid === null && v.charge === null && v.discharge === null) return null;
    let h = 0;
    if (v.solar !== null) h += v.solar;
    if (v.grid !== null) h += v.grid;
    if (v.discharge !== null) h += v.discharge;
    if (v.charge !== null) h -= v.charge;
    if (this._config.include_car_in_home) {
      for (const car of this._cars()) {
        const p = num(this.hass, car.power);
        if (p !== null) h -= p;
      }
    }
    return h;
  }

  _cars() {
    return Array.isArray(this._config.cars) ? this._config.cars : [];
  }

  _t(key) {
    return t(resolveLang(this._config?.language, this.hass), key);
  }

  _activeProfile() {
    return PRICE_PROFILES[this._config?.price_profile] || PRICE_PROFILES.default;
  }

  // Per-wire animation state: tracks last time a wire had meaningful power,
  // so lines can fade in when active and fade out after flow_off_delay seconds.
  // Returns { show, moving, duration (s), fade ('in'|'out'|null) }.
  _wireState(key, power) {
    this._wires = this._wires || {};
    const now = Date.now();
    const c = this._config;
    const p = power === null ? 0 : Math.abs(power);
    const active = p > 5;
    let w = this._wires[key];
    if (!w) w = this._wires[key] = { lastActive: active ? now : 0, shownSince: active ? now : 0, wasShown: active };

    if (active) {
      w.lastActive = now;
      if (!w.wasShown) { w.wasShown = true; w.shownSince = now; }
    }
    const offDelay = Math.max(0, (c.flow_off_delay ?? 20)) * 1000;
    const sinceActive = now - w.lastActive;
    const show = active || (w.wasShown && sinceActive < offDelay);
    if (!show) w.wasShown = false;

    // speed: linear from 0..flow_max_power, scaled by flow_speed multiplier.
    const maxP = Math.max(100, c.flow_max_power ?? 5000);
    const frac = Math.max(0, Math.min(1, p / maxP));
    const speedMul = Math.max(0.1, c.flow_speed ?? 1.0);
    // duration: fast (small number) at high power, slow (large) near zero.
    // frac 1 -> ~0.5s, frac ~0 -> ~6s. Divided by the user multiplier.
    const duration = active ? (6 - 5.5 * frac) / speedMul : 0;

    // fade direction
    let fade = null;
    if (active && now - w.shownSince < 800) fade = "in";
    else if (!active && show) fade = "out";

    return { show, moving: active, duration, fade };
  }

  // Ensure the card keeps repainting while any wire is counting down to fade-out,
  // even if Home Assistant sends no new state updates.
  _scheduleFlowTick() {
    if (this._flowTimer) return;
    this._flowTimer = setInterval(() => {
      const wires = this._wires || {};
      const now = Date.now();
      const offDelay = Math.max(0, (this._config?.flow_off_delay ?? 20)) * 1000;
      const pending = Object.values(wires).some((w) => w.wasShown && now - w.lastActive < offDelay + 1000);
      this.requestUpdate();
      if (!pending) { clearInterval(this._flowTimer); this._flowTimer = null; }
    }, 1000);
  }

  _priceData() {
    const cfg = this._config;
    const ent = this.hass?.states?.[cfg.price_entity];
    if (!ent) return { points: [], current: null };
    const attrs = ent.attributes || {};
    const candidates = [
      attrs.prices, attrs.prices_today, attrs.today, attrs.raw_today,
      attrs.data, attrs.forecast, attrs.raw_tomorrow, attrs.prices_tomorrow, attrs.tomorrow,
    ].filter(Boolean);
    let merged = [];
    const seen = new Set();
    for (const arr of candidates) {
      if (!Array.isArray(arr)) continue;
      for (const p of arr) {
        const from = p.from ?? p.start ?? p.start_date ?? p.time ?? p.datetime ?? p.date;
        // Zonneplan nests price under objects; also uses electricity_price (x1e7).
        let price = p.price ?? p.value ?? p.total ?? p.marketPrice ?? p.market_price ??
          p.electricity ?? p.electricity_price ??
          p.price_tax_included?.amount ?? p.price_tax_excluded?.amount;
        const t = from ? new Date(from).getTime() : null;
        let val = typeof price === "number" ? price : parseFloat(price);
        if (t && !isNaN(val)) {
          // Auto-scale providers that report scaled integers (e.g. Zonneplan x1e7).
          val = normalizePrice(val);
          if (!seen.has(t)) { seen.add(t); merged.push({ t, v: val }); }
        }
      }
    }
    merged.sort((a, b) => a.t - b.t);
    let current = num(this.hass, cfg.price_entity);
    if (current !== null) current = normalizePrice(current);
    return { points: merged, current };
  }

  render() {
    if (!this._config || !this.hass) return A;
    return b`
      <ha-card>
        <div class="stack">
          ${this._config.show_flow ? this._renderFlow() : A}
          ${this._config.show_price ? this._renderPrice() : A}
        </div>
      </ha-card>
    `;
  }

  _renderFlow() {
    const c = this._config;
    const v = {
      solar: num(this.hass, c.solar_power),
      grid: num(this.hass, c.grid_power),
      charge: num(this.hass, c.battery_charge_power),
      discharge: num(this.hass, c.battery_discharge_power),
      soc: num(this.hass, c.battery_soc),
    };
    const home = this._homePower(v);

    const battValue = (v.charge && v.charge > 5) ? v.charge : (v.discharge && v.discharge > 5) ? v.discharge : (v.charge ?? v.discharge);
    const battLabel = v.charge && v.charge > 5 ? this._t("charging") : v.discharge && v.discharge > 5 ? this._t("discharging") : "";

    const gridLabel = v.grid === null ? "" : v.grid < 0 ? this._t("export") : this._t("import");

    c.display_zero;
    const act = (val) => val !== null && Math.abs(val) > 5;

    act(v.solar);
    act(v.grid);
    act(v.charge) || act(v.discharge);

    // Which entities are configured at all
    const solarHasEnt = !!c.solar_power;
    const gridHasEnt = !!c.grid_power;
    const battHasEnt = !!(c.battery_charge_power || c.battery_discharge_power);

    // All four nodes are always shown. A node is "muted" (grey) when its
    // entity is not configured. Colored when configured.
    const GREY = "#6b7280";
    const solarCol = solarHasEnt ? c.color_solar : GREY;
    const gridCol = gridHasEnt ? c.color_grid : GREY;
    const battCol = battHasEnt ? c.color_battery : GREY;
    c.color_car;

    // Cars
    const cars = this._cars().map((car, i) => {
      const p = num(this.hass, car.power);
      const soc = num(this.hass, car.soc);
      return { name: car.name || `${this._t("car")} ${i + 1}`, power: p, soc, active: act(p), hasEnt: !!car.power };
    });
    cars.some((c2) => c2.active);
    const carHasEnt = cars.some((c2) => c2.hasEnt);
    // Always show at least one car node; if none added, show a single placeholder.
    const carsShown = cars.length ? cars : [{ name: this._t("car"), power: null, soc: null, active: false, hasEnt: false }];

    const bs = (() => {
      const r = 23, circ = 2 * Math.PI * r;
      const pct = v.soc === null ? 0 : Math.max(0, Math.min(100, v.soc)) / 100;
      return { circ, offset: circ * (1 - pct) };
    })();

    // House square center in the 720x190 viewBox. Lowered a bit.
    // Icon ~58px; horizontal half-width in viewBox units ≈ 34.
    const HX = 360, HY = 104;          // vertical center of the house square (lowered)
    const HL = HX - 34, HR = HX + 34;  // left / right edge of the square

    // Visual layout: an actual house photo replaces the abstract square. It's drawn as a
    // centered 190x190 sub-region of this same 720x190 viewBox (matching HX), so each wire
    // can aim at a specific spot on the picture (solar panels / battery box / car) instead
    // of the shared square edge used by the abstract layout.
    const visual = !!c.use_visual_layout;
    const VX = HX - 95, VY = 0, VS = 190;
    const visPt = (px, py) => ({ x: VX + (px / 100) * VS, y: VY + (py / 100) * VS });
    const EP = {
      solar: visual ? visPt(46, 31) : { x: HL, y: HY },
      grid: visual ? visPt(80, 40) : { x: HR, y: HY },
      battery: visual ? visPt(58, 63) : { x: HL, y: HY },
      car: visual ? visPt(76, 81) : { x: HR, y: HY },
    };

    // Per-wire animation states
    const solarPow = v.solar;
    const gridPow = v.grid;
    const battPow = v.charge && v.charge > 5 ? v.charge : (v.discharge && v.discharge > 5 ? v.discharge : 0);
    const carPow = (() => { let m = 0; for (const c2 of cars) { if (c2.active && Math.abs(c2.power) > m) m = Math.abs(c2.power); } return m; })();

    const wSolar = this._wireState("solar", solarPow);
    const wGrid = this._wireState("grid", gridPow);
    const wBatt = this._wireState("batt", battPow);
    const wCar = this._wireState("car", carPow);
    if (wSolar.show || wGrid.show || wBatt.show || wCar.show) this._scheduleFlowTick();

    const liveStyle = (st, color) =>
      `stroke:${color};animation-duration:${st.duration}s;${st.moving ? "" : "animation-play-state:paused;"}`;
    const liveClass = (st) => `live${st.fade === "in" ? " fade-in" : ""}${st.fade === "out" ? " fade-out" : ""}${st.moving ? "" : " still"}`;

    return b`
      <div class="flow">
        <svg class="wires" viewBox="0 0 720 190" preserveAspectRatio="none">
          ${visual ? w`<image href="${VISUAL_HOUSE_IMAGE}" x="${VX}" y="${VY}" width="${VS}" height="${VS}" preserveAspectRatio="xMidYMid meet"></image>` : A}

          <path class="wire" d="M70,52 Q220,${HY} ${EP.solar.x},${EP.solar.y}"></path>
          ${wSolar.show ? w`<path class="${liveClass(wSolar)}" style="${liveStyle(wSolar, c.color_solar)}" d="M70,52 Q220,${HY} ${EP.solar.x},${EP.solar.y}"></path>` : A}

          <path class="wire" d="M650,52 Q500,${HY} ${EP.grid.x},${EP.grid.y}"></path>
          ${wGrid.show ? w`<path class="${liveClass(wGrid)}" style="${liveStyle(wGrid, c.color_grid)}" d="${gridPow < 0 ? `M${EP.grid.x},${EP.grid.y} Q500,${HY} 650,52` : `M650,52 Q500,${HY} ${EP.grid.x},${EP.grid.y}`}"></path>` : A}

          <path class="wire" d="M70,138 Q220,${HY} ${EP.battery.x},${EP.battery.y}"></path>
          ${wBatt.show ? w`<path class="${liveClass(wBatt)}" style="${liveStyle(wBatt, c.color_battery)}" d="${v.charge && v.charge > 5 ? `M${EP.battery.x},${EP.battery.y} Q220,${HY} 70,138` : `M70,138 Q220,${HY} ${EP.battery.x},${EP.battery.y}`}"></path>` : A}

          <path class="wire" d="M650,138 Q500,${HY} ${EP.car.x},${EP.car.y}"></path>
          ${wCar.show ? w`<path class="${liveClass(wCar)}" style="${liveStyle(wCar, c.color_car)}" d="M${EP.car.x},${EP.car.y} Q500,${HY} 650,138"></path>` : A}
        </svg>

        <div class="node tl ${solarHasEnt ? "" : "muted"}">
          <div class="ic" style="color:${solarCol};border-color:${solarCol}66;background:${solarCol}22">
            <ha-icon icon="mdi:solar-power-variant"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">${this._t("solar")}</span><span class="val" style="color:${solarCol}">${fmtPower(v.solar)}</span></div>
        </div>

        <div class="node tr ${gridHasEnt ? "" : "muted"}">
          <div class="ic" style="color:${gridCol};border-color:${gridCol}66;background:${gridCol}22">
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">${this._t("grid")}</span><span class="val" style="color:${gridCol}">${fmtPower(v.grid)}</span>${gridLabel ? b`<span class="sub" style="color:${gridCol}">${gridLabel}</span>` : A}</div>
        </div>

        <div class="node bl ${battHasEnt ? "" : "muted"}">
          ${c.battery_ring !== false
            ? b`<div class="socwrap">
                <svg class="socring" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
                  ${battHasEnt && v.soc !== null ? w`<circle cx="26" cy="26" r="23" fill="none" stroke="${battCol}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${bs.circ}" stroke-dashoffset="${bs.offset}" transform="rotate(-90 26 26)"></circle>` : A}
                </svg>
                <div class="ic round" style="color:${battCol}">
                  <ha-icon icon="mdi:battery-charging"></ha-icon>
                </div>
              </div>`
            : b`<div class="ic" style="color:${battCol};border-color:${battCol}66;background:${battCol}22">
                <ha-icon icon="mdi:battery-charging"></ha-icon>
              </div>`}
          <div class="txt"><span class="lbl">${this._t("battery")}${battHasEnt && v.soc !== null ? b` · <b style="color:${battCol}">${Math.round(v.soc)}%</b>` : A}</span><span class="val" style="color:${battCol}">${fmtPower(battValue)}</span>${battLabel ? b`<span class="sub" style="color:${battCol}">${battLabel}</span>` : A}</div>
        </div>

        ${this._renderCars(carsShown, c, carHasEnt)}

        <div class="huis">
          <div class="ic" style="color:${c.color_home};border-color:${c.color_home}66;background:${c.color_home}1f">
            <ha-icon icon="mdi:home"></ha-icon>
          </div>
          <span class="lbl">${this._t("home")}</span>
          <span class="val" style="color:${c.color_home}">${fmtPower(home)}</span>
        </div>
      </div>
    `;
  }

  _renderCars(cars, c, carHasEnt = true) {
    const GREY = "#6b7280";
    const cc = carHasEnt ? c.color_car : GREY;
    const mode = c.car_mode === "merged" ? "merged" : "scroll";
    const showRing = c.car_ring !== false;
    const carInfo = (car) => b`
      <span class="lbl">${car.name}${car.soc !== null ? b` · <b style="color:${cc}">${Math.round(car.soc)}%</b>` : A}</span>
      <span class="val" style="color:${cc}">${fmtPower(car.power)}</span>
      ${car.active ? b`<span class="sub" style="color:${cc}">${this._t("charging")}</span>` : A}
    `;
    const squareIcon = b`
      <div class="ic" style="color:${cc};border-color:${cc}66;background:${cc}22">
        <ha-icon icon="mdi:car-electric"></ha-icon>
      </div>`;
    // Ring reflects one specific car's SoC, so it only makes sense when there's a single
    // clear "current" car — the lone car, or whichever one is currently cycled into view.
    const ringIcon = (car) => {
      const r = 23, circ = 2 * Math.PI * r;
      const pct = car?.soc == null ? 0 : Math.max(0, Math.min(100, car.soc)) / 100;
      const offset = circ * (1 - pct);
      return b`
        <div class="socwrap">
          <svg class="socring" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
            ${carHasEnt && car?.soc != null ? w`<circle cx="26" cy="26" r="23" fill="none" stroke="${cc}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 26 26)"></circle>` : A}
          </svg>
          <div class="ic round" style="color:${cc}">
            <ha-icon icon="mdi:car-electric"></ha-icon>
          </div>
        </div>`;
    };

    if (mode === "merged" || cars.length === 1) {
      // icon in corner, info to the left (mirror of accu)
      const single = cars.length === 1 ? cars[0] : null;
      const icon = showRing && single ? ringIcon(single) : squareIcon;
      return b`
        <div class="node br car ${carHasEnt ? "" : "muted"}">
          <div class="txt carinfos">
            ${cars.map((car) => b`<div class="cartxt">${carInfo(car)}</div>`)}
          </div>
          ${icon}
        </div>`;
    }

    // scroll mode: icon (and ring, if enabled) cycles together with the shown car
    const idx = this._carScrollIdx % cars.length;
    const car = cars[idx];
    const icon = showRing ? ringIcon(car) : squareIcon;
    return b`
      <div class="node br car ${carHasEnt ? "" : "muted"}">
        <div class="txt">
          <div class="cartxt caranim" data-k=${idx}>${carInfo(car)}</div>
          <div class="cardots">
            ${cars.map((_, i) => b`<span class="dot ${i === idx ? "on" : ""}" style="background:${i === idx ? cc : "rgba(255,255,255,.25)"}"></span>`)}
          </div>
        </div>
        ${icon}
      </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startCarScroll();
    this._startChartScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._carTimer) { clearInterval(this._carTimer); this._carTimer = null; }
    if (this._flowTimer) { clearInterval(this._flowTimer); this._flowTimer = null; }
    if (this._chartTimer) { clearInterval(this._chartTimer); this._chartTimer = null; }
  }

  _startCarScroll() {
    if (this._carTimer) clearInterval(this._carTimer);
    const secs = Math.max(2, this._config?.car_scroll_interval || 5);
    this._carTimer = setInterval(() => {
      this._carScrollIdx = (this._carScrollIdx || 0) + 1;
      this.requestUpdate();
    }, secs * 1000);
  }

  updated() {
    // Restart the fade+slide animation whenever the shown car changes.
    const el = this.renderRoot?.querySelector?.(".caranim");
    if (el && el.dataset.k !== this._lastCarK) {
      this._lastCarK = el.dataset.k;
      el.classList.remove("run");
      // force reflow to restart the CSS animation
      void el.offsetWidth;
      el.classList.add("run");
    }

    // Same trick for the chart tab body, so switching tabs (manual or auto-scroll) fades in.
    const cb = this.renderRoot?.querySelector?.(".chartbody");
    if (cb && cb.dataset.k !== this._lastChartK) {
      this._lastChartK = cb.dataset.k;
      cb.classList.remove("run");
      void cb.offsetWidth;
      cb.classList.add("run");
    }
  }

  _chartTabs() {
    const c = this._config;
    return [
      { id: "price", label: this._t("tab_price"), show: !!c.price_entity },
      { id: "solar", label: this._t("tab_solar"), show: !!c.solar_power },
      { id: "accu", label: this._t("tab_battery"), show: !!c.battery_soc },
    ].filter((t) => t.show);
  }

  _renderPrice() {
    const c = this._config;
    const mode = this._chartMode || "price";
    const tabs = this._chartTabs();
    // if selected tab is unavailable, fall back to first
    const activeMode = tabs.some((t) => t.id === mode) ? mode : (tabs[0]?.id || "price");

    const tabBar = tabs.length > 1 ? b`
      <div class="tabs">
        ${tabs.map((t) => b`
          <button class="tab ${t.id === activeMode ? "on" : ""}" @click=${() => this._setChartMode(t.id, true)}>${t.label}</button>`)}
      </div>` : A;

    let body;
    if (activeMode === "price") body = this._priceChart(c);
    else body = this._historyChart(c, activeMode);

    return b`<div class="price">${tabBar}<div class="chartbody" data-k=${activeMode}>${body}</div></div>`;
  }

  _setChartMode(m, manual = false) {
    this._chartMode = m;
    if (m !== "price") this._ensureHistory(m);
    // A manual click overrides auto-scroll for a while so the user's choice sticks.
    if (manual && this._config?.chart_auto_scroll) this._startChartScroll();
    this.requestUpdate();
  }

  _startChartScroll() {
    if (this._chartTimer) { clearInterval(this._chartTimer); this._chartTimer = null; }
    if (!this._config?.chart_auto_scroll) return;
    const secs = Math.max(3, this._config.chart_scroll_interval || 8);
    this._chartTimer = setInterval(() => {
      const tabs = this._chartTabs();
      if (tabs.length < 2) return;
      const mode = this._chartMode || "price";
      const idx = tabs.findIndex((t) => t.id === mode);
      const next = tabs[(idx + 1) % tabs.length];
      this._setChartMode(next.id, false);
    }, secs * 1000);
  }

  // Fetch today's history for solar/accu once, cache it.
  async _ensureHistory(mode) {
    const c = this._config;
    const entity = mode === "solar" ? c.solar_power : c.battery_soc;
    if (!entity || !this.hass) return;
    this._history = this._history || {};
    const cacheKey = mode + "|" + entity;
    // refresh at most every 5 min
    const cached = this._history[cacheKey];
    if (cached && Date.now() - cached.fetched < 300000) return;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    try {
      const url = `history/period/${start.toISOString()}?filter_entity_id=${entity}&minimal_response`;
      const res = await this.hass.callApi("GET", url);
      const arr = Array.isArray(res) && res[0] ? res[0] : [];
      const points = arr.map((s) => ({
        t: new Date(s.last_changed || s.last_updated).getTime(),
        v: parseFloat(s.state),
      })).filter((p) => !isNaN(p.v));
      this._history[cacheKey] = { fetched: Date.now(), points };
      this.requestUpdate();
    } catch (e) {
      this._history[cacheKey] = { fetched: Date.now(), points: [], error: true };
      this.requestUpdate();
    }
  }

  _historyChart(c, mode) {
    const entity = mode === "solar" ? c.solar_power : c.battery_soc;
    const color = mode === "solar" ? c.color_solar : c.color_battery;
    const title = mode === "solar" ? this._t("solar_today") : this._t("battery_today");

    const cacheKey = mode + "|" + entity;
    const cached = this._history?.[cacheKey];
    if (!cached) { this._ensureHistory(mode); }
    const points = cached?.points || [];

    // build a smooth area/line over today 00:00 -> now (axis ends at NOW)
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
    const now = Date.now();
    const span = Math.max(1, now - startMs);

    let maxV = mode === "accu" ? 100 : Math.max(10, ...points.map((p) => p.v)) * 1.1;
    const path = points.length
      ? points.map((p, i) => {
          const x = Math.max(0, Math.min(1, (p.t - startMs) / span)) * 100;
          const y = 100 - Math.max(0, Math.min(1, p.v / maxV)) * 100;
          return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(" ")
      : "";
    const areaPath = path ? `${path} L100,100 L0,100 Z` : "";

    // labels only up to the current hour; axis runs 00:00 -> now
    const nowHour = now / 3600000 - startMs / 3600000; // hours since midnight (fractional)
    const labelEvery = nowHour <= 8 ? 2 : 3;
    const labels = [];
    for (let h = 0; h <= Math.floor(nowHour); h += labelEvery) {
      labels.push({ frac: (h * 3600000) / span, text: h + ":00" });
    }
    // always show the current time at the far right
    const curD = new Date(now);
    labels.push({ frac: 1, text: curD.getHours() + ":" + String(curD.getMinutes()).padStart(2, "0") });
    const nowFrac = 1; // now is the right edge

    const cur = num(this.hass, entity);
    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(maxV * f) + (mode === "accu" ? "" : ""));

    return b`
      <div class="chdr">
        <span class="t">${title}</span>
        ${cur !== null ? b`<span class="now">${this._t("now")}: <b>${mode === "accu" ? Math.round(cur) + "%" : fmtPower(cur)}</b></span>` : A}
      </div>
      <div class="chart">
        <div class="yaxis">${yTicks.map((t) => b`<span>${t}</span>`)}</div>
        <div class="plot">
          ${points.length
            ? b`<svg class="hist" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="${areaPath}" fill="${color}22"></path>
                <path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" vector-effect="non-scaling-stroke"></path>
              </svg>`
            : b`<div class="empty">${cached?.error ? this._t("history_none") : this._t("history_loading")}</div>`}
          <div class="nowline right" data-now="${this._t("now")}" style="left:${Math.min(100, nowFrac * 100)}%"></div>
        </div>
        <div class="xaxis">
          ${labels.map((l) => b`<span class="tick" style="left:${Math.min(100, l.frac * 100)}%">${l.text}</span>`)}
        </div>
      </div>
    `;
  }

  _priceChart(c) {
    const { points: allPoints, current } = this._priceData();
    const now = Date.now();
    const hours = Math.max(8, Math.min(48, c.price_hours || 24));

    // Fixed axis: from start of current hour to +hours.
    const axisStart = new Date();
    if (c.price_start === "midnight") {
      axisStart.setHours(0, 0, 0, 0); // today 00:00
    } else {
      axisStart.setMinutes(0, 0, 0);  // start of current hour
      const lookback = Math.max(1, Math.min(12, c.price_lookback_hours ?? 2));
      axisStart.setTime(axisStart.getTime() - lookback * 3600000);
    }
    const startMs = axisStart.getTime();
    const endMs = startMs + hours * 3600000;

    // slot length from data (default hourly)
    const stepMs = allPoints.length > 1 ? (allPoints[1].t - allPoints[0].t) : 3600000;
    const slotCount = Math.max(1, Math.round((endMs - startMs) / stepMs));

    // Build fixed slots; fill with data where available
    const byTime = new Map(allPoints.map((p) => [Math.floor(p.t / stepMs) * stepMs, p.v]));
    const slots = [];
    for (let i = 0; i < slotCount; i++) {
      const t = startMs + i * stepMs;
      const key = Math.floor(t / stepMs) * stepMs;
      const v = byTime.has(key) ? byTime.get(key) : null;
      slots.push({ t, v, past: (t + stepMs) <= now, cur: t <= now && (t + stepMs) > now });
    }

    const withData = slots.filter((s) => s.v !== null);
    const maxV = withData.length ? Math.max(...withData.map((s) => s.v), 0.1) * 1.1 : 0.4;

    const nowFrac = Math.max(0, Math.min(1, (now - startMs) / (endMs - startMs)));

    // Hour labels: choose interval by width (more hours -> sparser labels)
    const labelEvery = hours <= 12 ? 2 : hours <= 24 ? 3 : 6;
    const labels = [];
    for (let h = 0; h <= hours; h += labelEvery) {
      const d = new Date(startMs + h * 3600000);
      labels.push({ frac: h / hours, text: d.getHours() + ":00" });
    }

    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => (maxV * f).toFixed(2).replace(".", ","));

    const sel = this._selectedSlot;
    const profile = this._activeProfile();
    const stops = this._config.price_profile !== "default" ? (profile.price_stops || c.price_stops) : c.price_stops;

    // Optional second x-axis row counting hours from now ("nu", 1, 2, 3…), off by default.
    const showRel = !!c.price_relative_hours;
    const relLabels = [];
    if (showRel) {
      const maxH = Math.max(0, Math.floor((endMs - now) / 3600000));
      let h = 0;
      while (h <= maxH) {
        const frac = (now + h * 3600000 - startMs) / (endMs - startMs);
        if (frac >= 0 && frac <= 1) {
          relLabels.push({ frac, text: h === 0 ? this._t("now").toLowerCase() : String(h) });
        }
        h += h < 10 ? 1 : h < 16 ? 2 : 3;
      }
    }

    // Optional thin marker(s) where the axis crosses local midnight ("tomorrow"), off by default.
    const dayMarkers = [];
    if (c.price_show_day_marker) {
      let d = new Date(startMs);
      d.setHours(24, 0, 0, 0); // next local midnight strictly after axis start
      while (d.getTime() < endMs) {
        const frac = (d.getTime() - startMs) / (endMs - startMs);
        if (frac > 0.01 && frac < 0.99) {
          dayMarkers.push({ frac, text: this._t("tomorrow") });
        }
        d = new Date(d.getTime());
        d.setDate(d.getDate() + 1);
      }
    }

    const gasPrice = num(this.hass, c.gas_price_entity);

    return b`
      <div class="chdr">
        <span class="t">${this._t("price_title")} (${hours}u)</span>
        <div class="chdr-right">
          ${sel
            ? b`<span class="now sel"><ha-icon icon="mdi:flash"></ha-icon>${new Date(sel.t).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}: <b>${sel.v.toFixed(3).replace(".", ",")}</b></span>`
            : current !== null
              ? b`<span class="now"><ha-icon icon="mdi:flash"></ha-icon>${this._t("now")}: <b>${current.toFixed(3).replace(".", ",")}</b></span>`
              : A}
          ${gasPrice !== null ? b`<span class="now gas"><ha-icon icon="mdi:fire"></ha-icon><b>${gasPrice.toFixed(3).replace(".", ",")}</b></span>` : A}
        </div>
      </div>
      <div class="chart ${showRel ? "has-rel" : ""}">
        <div class="yaxis">${yTicks.map((t) => b`<span>${t}</span>`)}</div>
        <div class="plot">
          ${profile.chart_style === "bars"
            ? this._priceBarsBody(slots, maxV, stops, sel, profile)
            : this._priceLineBody(slots, maxV, profile, sel)}
          ${dayMarkers.map((d) => b`<div class="daymarker" data-label="${d.text}" style="left:${d.frac * 100}%"></div>`)}
          <div class="nowline" data-now="${this._t("now")}" style="left:${nowFrac * 100}%"></div>
        </div>
        <div class="xaxis ${showRel ? "abs" : ""}">
          ${labels.map((l) => b`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
        </div>
        ${showRel ? b`
          <div class="xaxis rel">
            ${relLabels.map((l) => b`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
          </div>` : A}
      </div>
    `;
  }

  _priceBarsBody(slots, maxV, stops, sel, profile) {
    const GREY = "#6b7280";
    const radiusStyle = profile?.bar_radius ? `;border-radius:${profile.bar_radius}` : "";
    return b`
      <div class="bars">
        ${slots.map((s) => {
          if (s.v === null) {
            if (profile?.grey_unknown_value != null) {
              const h = Math.max(2, Math.min(100, (profile.grey_unknown_value / maxV) * 100));
              return b`<div class="bar unknown" style="height:${h}%;background:${GREY}${radiusStyle}"></div>`;
            }
            return b`<div class="bar empty-slot"></div>`;
          }
          const h = Math.max(2, (s.v / maxV) * 100);
          let col;
          if (profile?.highlight_now) {
            // Not price-based: a flat bar color, except the bar for the current hour.
            col = s.cur ? (profile.bar_color_now || profile.bar_color || GREY) : (profile.bar_color || GREY);
          } else if (profile?.grey_past && s.past) {
            col = GREY;
          } else {
            col = colorForValue(s.v, stops);
          }
          const isSel = sel && sel.t === s.t;
          const timeTxt = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return b`<div
            class="bar ${isSel ? "sel" : ""}"
            style="height:${h}%;background:${col}${radiusStyle}"
            title="${timeTxt} — ${s.v.toFixed(3).replace(".", ",")} €/kWh"
            @mouseenter=${() => this._hoverSlot(s)}
            @mouseleave=${() => this._hoverSlot(null)}
            @click=${() => this._tapSlot(s)}
          ></div>`;
        })}
      </div>
    `;
  }

  // Smooth-line layout profiles ("line" / "line-threshold"): only the leading
  // contiguous run of known values is drawn as a curve; a trailing gap (e.g.
  // tomorrow's prices not published yet) keeps the familiar hatched placeholder.
  _priceLineBody(slots, maxV, profile, sel) {
    let runEnd = 0;
    while (runEnd < slots.length && slots[runEnd].v !== null) runEnd++;
    const run = slots.slice(0, runEnd);

    const n = Math.max(1, slots.length - 1);
    const pts = run.map((s, i) => ({
      x: (i / n) * 100,
      y: 100 - Math.max(0, Math.min(100, (s.v / maxV) * 100)),
    }));

    const pathD = pts.length ? catmullRomToBezierPath(pts) : "";
    const areaD = pathD && pts.length > 1
      ? `${pathD} L${pts[pts.length - 1].x.toFixed(2)},100 L${pts[0].x.toFixed(2)},100 Z`
      : "";

    let stroke = profile.line_color || "#7dd3fc";
    let fill = "none";
    let defs = A;

    if (profile.chart_style === "line-threshold" && run.length) {
      const avg = run.reduce((a, s) => a + s.v, 0) / run.length;
      const avgFrac = Math.max(0, Math.min(1, 1 - Math.min(1, avg / maxV)));
      // Soft band around the average instead of a hard cut, for a smooth orange->teal blend.
      const band = 0.14;
      const topOff = Math.max(0, avgFrac - band / 2);
      const botOff = Math.min(1, avgFrac + band / 2);
      const gradId = `efp-grad-${this._uid}`;
      defs = w`<defs>
        <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
          <stop offset="0" stop-color="${profile.color_above}"></stop>
          <stop offset="${topOff.toFixed(4)}" stop-color="${profile.color_above}"></stop>
          <stop offset="${botOff.toFixed(4)}" stop-color="${profile.color_below}"></stop>
          <stop offset="1" stop-color="${profile.color_below}"></stop>
        </linearGradient>
      </defs>`;
      stroke = `url(#${gradId})`;
      fill = `url(#${gradId})`;
    }

    return b`
      <svg class="priceline" viewBox="0 0 100 100" preserveAspectRatio="none">
        ${defs}
        ${areaD && fill !== "none" ? w`<path d="${areaD}" fill="${fill}" fill-opacity="0.32" stroke="none"></path>` : A}
        ${pathD ? w`<path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"></path>` : A}
      </svg>
      <div class="hits">
        ${slots.map((s) => {
          if (s.v === null) return b`<div class="hit empty-slot"></div>`;
          const isSel = sel && sel.t === s.t;
          const timeTxt = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return b`<div
            class="hit ${isSel ? "sel" : ""}"
            title="${timeTxt} — ${s.v.toFixed(3).replace(".", ",")} €/kWh"
            @mouseenter=${() => this._hoverSlot(s)}
            @mouseleave=${() => this._hoverSlot(null)}
            @click=${() => this._tapSlot(s)}
          ></div>`;
        })}
      </div>
    `;
  }

  _hoverSlot(s) {
    if (this._tapLock) return; // don't override a tapped selection with hover-out
    this._selectedSlot = s;
    this.requestUpdate();
  }

  _tapSlot(s) {
    if (this._selectedSlot && this._selectedSlot.t === s.t && this._tapLock) {
      this._selectedSlot = null;
      this._tapLock = false;
    } else {
      this._selectedSlot = s;
      this._tapLock = true;
    }
    this.requestUpdate();
  }

  static get styles() {
    return i$3`
      ha-card { padding: 12px; }
      .stack { display: flex; flex-direction: column; gap: 12px; }
      .flow { position: relative; height: 190px; }
      .wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .wire { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 2.5; }
      .live { stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-dasharray: 5 9; animation-name: flow; animation-timing-function: linear; animation-iteration-count: infinite; opacity: 1; transition: opacity 1s ease; }
      .live.still { stroke-dashoffset: 0; }
      .live.fade-in { opacity: 1; }
      .live.fade-out { opacity: 0; }
      @keyframes flow { to { stroke-dashoffset: -14; } }
      .node { position: absolute; display: flex; align-items: center; gap: 8px; z-index: 2; }
      .node.tl { left: 6px; top: 8px; }
      .node.tr { right: 6px; top: 8px; flex-direction: row-reverse; text-align: right; }
      .node.bl { left: 6px; bottom: 8px; }
      .node.muted { opacity: .55; }
      .node.muted .val, .node.muted .sub { opacity: .8; }
      .node.br { right: 6px; bottom: 8px; flex-direction: row; justify-content: flex-end; text-align: right; }
      .node.br .txt { align-items: flex-end; }
      .node .ic, .node-car .ic { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; }
      .node .ic ha-icon, .node-car .ic ha-icon { --mdc-icon-size: 24px; }
      .txt { display: flex; flex-direction: column; gap: 1px; }
      .node.tr .txt { align-items: flex-end; }
      .txt .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .txt .val { font-size: 15px; font-weight: 700; line-height: 1.1; }
      .txt .sub { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; opacity: .85; }
      .socwrap { position: relative; width: 44px; height: 44px; flex: 0 0 auto; }
      .socwrap .ic { position: absolute; inset: 0; }
      .socwrap .ic.round { border: none; background: none; border-radius: 50%; }
      .socring { position: absolute; inset: 0; }

      /* car node bottom-right: mirror of accu (icon in corner, text left) */
      .cartxt { display: flex; flex-direction: column; gap: 1px; align-items: flex-end; }
      .carinfos { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
      .caranim.run { animation: carfade .45s ease; }
      @keyframes carfade { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: translateX(0); } }
      .cardots { display: flex; gap: 4px; margin-top: 3px; justify-content: flex-end; }
      .cardots .dot { width: 6px; height: 6px; border-radius: 50%; transition: background .3s; }

      .huis { position: absolute; left: 50%; top: 54.7%; transform: translate(-50%, -29px); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
      .huis .ic { width: 58px; height: 58px; border-radius: 16px; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; }
      .huis .ic ha-icon { --mdc-icon-size: 30px; }
      .huis .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .huis .val { font-size: 16px; font-weight: 700; }

      .chdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .chdr .t { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
      .chdr-right { display: flex; align-items: baseline; gap: 12px; }
      .chdr .now { display: inline-flex; align-items: center; gap: 4px; }
      .chdr .now ha-icon { --mdc-icon-size: 13px; color: var(--info-color, #7dd3fc); }
      .chdr .now.gas ha-icon { color: var(--warning-color, #f5a623); }
      .chdr .now.gas b { color: var(--warning-color, #f5a623); }
      .tabs { display: flex; gap: 6px; margin-bottom: 10px; }
      .tab { cursor: pointer; border: 1px solid var(--divider-color); background: transparent; color: var(--secondary-text-color); border-radius: 999px; padding: 3px 12px; font-size: 12px; transition: all .2s; }
      .tab.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      .chartbody.run { animation: chartfade .4s ease; }
      @keyframes chartfade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .hist { position: absolute; inset: 0; width: 100%; height: 100%; }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 168px; padding-left: 34px; }
      .chart.has-rel { height: 182px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 34px; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .chart.has-rel .yaxis { bottom: 48px; }
      .plot { position: absolute; left: 34px; right: 0; top: 0; bottom: 34px; }
      .chart.has-rel .plot { bottom: 48px; }
      .bars { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 1px; }
      .bar { flex: 1; border-radius: 0; cursor: pointer; transition: opacity .15s; }
      .bar:hover { opacity: .8; }
      .bar.sel { outline: 1.5px solid var(--primary-text-color); outline-offset: -1px; }
      .chdr .now.sel b { color: var(--primary-color); }
      .bar.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); height: 100%; border-radius: 0; align-self: stretch; }
      .bar.unknown { cursor: default; opacity: .55; }
      .bar.unknown:hover { opacity: .55; }
      .priceline { position: absolute; inset: 0; width: 100%; height: 100%; }
      .hits { position: absolute; inset: 0; display: flex; align-items: stretch; gap: 1px; }
      .hit { flex: 1; cursor: pointer; background: transparent; border-radius: 2px; }
      .hit:hover { background: rgba(255,255,255,.06); }
      .hit.sel { background: rgba(255,255,255,.12); }
      .hit.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); cursor: default; }
      .nowline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: attr(data-now); position: absolute; top: -2px; left: 3px; font-size: 9px; background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
      .nowline.right::before { left: auto; right: 3px; }
      .daymarker { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dashed rgba(255,255,255,.28); }
      .daymarker::before { content: attr(data-label); position: absolute; top: -2px; left: 4px; font-size: 9px; color: var(--secondary-text-color); white-space: nowrap; }
      .xaxis { position: absolute; left: 34px; right: 0; bottom: 12px; height: 14px; }
      .xaxis.abs { bottom: 26px; }
      .xaxis.rel { bottom: 10px; }
      .xaxis.rel .tick { opacity: .75; }
      .xaxis.rel .tick::before { display: none; }
      .xaxis .tick { position: absolute; transform: translateX(-50%); font-size: 9px; color: var(--secondary-text-color); white-space: nowrap; }
      .xaxis .tick:last-child { transform: translateX(-100%); }
      .xaxis .tick::before { content: ""; position: absolute; top: -6px; left: 50%; width: 1px; height: 4px; background: var(--divider-color, rgba(255,255,255,.2)); }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

console.info("%c energy-flow-price-card %c v1.7.0 ", "background:#7dd3fc;color:#0a1420;font-weight:700", "background:#333;color:#fff");

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "Energy Flow & Price Card",
  description: "Compact energy flow (solar/battery/home/grid/cars) plus dynamic electricity & gas prices.",
  preview: true,
  documentationURL: "https://github.com/dennisbest85/energy-flow-price-card",
});
