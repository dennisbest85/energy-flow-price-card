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

const DEFAULTS = {
  show_flow: true,
  show_price: true,
  display_zero: false,
  price_hours: 24,
  price_start: "midnight", // "now" | "midnight"
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
  price_stops: DEFAULT_PRICE_STOPS,
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
    price_title: "Electricity price",
    solar_today: "Solar today",
    battery_today: "Battery SoC today",
    now: "Now",
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
    ed_entities: "Entities",
    ed_home_note: "Home usage is calculated automatically: solar + grid + battery-discharge − battery-charge.",
    ed_solar_power: "Solar power (W)",
    ed_grid_power: "Grid / P1 power (W, + = import, − = export)",
    ed_battery_charge: "Battery charge (W)",
    ed_battery_discharge: "Battery discharge (W)",
    ed_battery_soc: "Battery SoC (%)",
    ed_price_entity: "Price provider entity (€/kWh or your currency)",
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
    price_title: "Stroomprijs",
    solar_today: "Solar vandaag",
    battery_today: "Accu SoC vandaag",
    now: "Nu",
    tab_price: "Prijs",
    tab_solar: "Solar",
    tab_battery: "Accu",
    history_loading: "Historie laden…",
    history_none: "Geen historie beschikbaar.",
    ed_display: "Weergave",
    ed_show_flow: "Flow tonen",
    ed_show_price: "Grafieken tonen",
    ed_display_zero: "Lege takken tonen (display zero)",
    ed_entities: "Entiteiten",
    ed_home_note: "Huisverbruik wordt automatisch berekend: solar + net + accu-ontladen − accu-laden.",
    ed_solar_power: "Solar vermogen (W)",
    ed_grid_power: "Net / P1 vermogen (W, + = import, − = export)",
    ed_battery_charge: "Accu laden (W)",
    ed_battery_discharge: "Accu ontladen (W)",
    ed_battery_soc: "Accu SoC (%)",
    ed_price_entity: "Prijs energieleverancier (€/kWh)",
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
    price_title: "Strompreis",
    solar_today: "Solar heute",
    battery_today: "Akku SoC heute",
    now: "Jetzt",
    tab_price: "Preis",
    tab_solar: "Solar",
    tab_battery: "Akku",
    history_loading: "Verlauf wird geladen…",
    history_none: "Kein Verlauf verfügbar.",
    ed_display: "Anzeige",
    ed_show_flow: "Fluss anzeigen",
    ed_show_price: "Diagramme anzeigen",
    ed_display_zero: "Leere Zweige anzeigen (display zero)",
    ed_entities: "Entitäten",
    ed_home_note: "Hausverbrauch wird automatisch berechnet: Solar + Netz + Akku-Entladung − Akku-Ladung.",
    ed_solar_power: "Solar-Leistung (W)",
    ed_grid_power: "Netz / P1 Leistung (W, + = Import, − = Export)",
    ed_battery_charge: "Akku laden (W)",
    ed_battery_discharge: "Akku entladen (W)",
    ed_battery_soc: "Akku SoC (%)",
    ed_price_entity: "Preis-Anbieter Entität (€/kWh)",
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
    const lang = this._config.language ?? "auto";

    const entityFields = [
      { key: "solar_power", label: T("ed_solar_power") },
      { key: "grid_power", label: T("ed_grid_power") },
      { key: "battery_charge_power", label: T("ed_battery_charge") },
      { key: "battery_discharge_power", label: T("ed_battery_discharge") },
      { key: "battery_soc", label: T("ed_battery_soc") },
      { key: "price_entity", label: T("ed_price_entity") },
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

class EnergyFlowPriceCard extends i {
  static get properties() {
    return { hass: {}, _config: {} };
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
    if (!Array.isArray(this._config.cars)) this._config.cars = [];
    if (this._carScrollIdx == null) this._carScrollIdx = 0;
    this._startCarScroll();
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
          <path class="wire" d="M70,52 Q220,${HY} ${HL},${HY}"></path>
          ${wSolar.show ? w`<path class="${liveClass(wSolar)}" style="${liveStyle(wSolar, c.color_solar)}" d="M70,52 Q220,${HY} ${HL},${HY}"></path>` : A}

          <path class="wire" d="M650,52 Q500,${HY} ${HR},${HY}"></path>
          ${wGrid.show ? w`<path class="${liveClass(wGrid)}" style="${liveStyle(wGrid, c.color_grid)}" d="${gridPow < 0 ? `M${HR},${HY} Q500,${HY} 650,52` : `M650,52 Q500,${HY} ${HR},${HY}`}"></path>` : A}

          <path class="wire" d="M70,138 Q220,${HY} ${HL},${HY}"></path>
          ${wBatt.show ? w`<path class="${liveClass(wBatt)}" style="${liveStyle(wBatt, c.color_battery)}" d="${v.charge && v.charge > 5 ? `M${HL},${HY} Q220,${HY} 70,138` : `M70,138 Q220,${HY} ${HL},${HY}`}"></path>` : A}

          <path class="wire" d="M650,138 Q500,${HY} ${HR},${HY}"></path>
          ${wCar.show ? w`<path class="${liveClass(wCar)}" style="${liveStyle(wCar, c.color_car)}" d="M${HR},${HY} Q500,${HY} 650,138"></path>` : A}
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
          <div class="socwrap">
            <svg class="socring" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
              ${battHasEnt && v.soc !== null ? w`<circle cx="26" cy="26" r="23" fill="none" stroke="${battCol}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${bs.circ}" stroke-dashoffset="${bs.offset}" transform="rotate(-90 26 26)"></circle>` : A}
            </svg>
            <div class="ic round" style="color:${battCol}">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
            </div>
          </div>
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
    const carInfo = (car) => b`
      <span class="lbl">${car.name}${car.soc !== null ? b` · <b style="color:${cc}">${Math.round(car.soc)}%</b>` : A}</span>
      <span class="val" style="color:${cc}">${fmtPower(car.power)}</span>
      ${car.active ? b`<span class="sub" style="color:${cc}">${this._t("charging")}</span>` : A}
    `;
    const icon = b`
      <div class="ic" style="color:${cc};border-color:${cc}66;background:${cc}22">
        <ha-icon icon="mdi:car-electric"></ha-icon>
      </div>`;

    if (mode === "merged" || cars.length === 1) {
      // icon in corner, info to the left (mirror of accu)
      return b`
        <div class="node br car ${carHasEnt ? "" : "muted"}">
          <div class="txt carinfos">
            ${cars.map((car) => b`<div class="cartxt">${carInfo(car)}</div>`)}
          </div>
          ${icon}
        </div>`;
    }

    // scroll mode: icon fixed in corner, cycling info to the left
    const idx = this._carScrollIdx % cars.length;
    const car = cars[idx];
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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._carTimer) { clearInterval(this._carTimer); this._carTimer = null; }
    if (this._flowTimer) { clearInterval(this._flowTimer); this._flowTimer = null; }
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
  }

  _renderPrice() {
    const c = this._config;
    const mode = this._chartMode || "price";
    const tabs = [
      { id: "price", label: this._t("tab_price"), show: !!c.price_entity },
      { id: "solar", label: this._t("tab_solar"), show: !!c.solar_power },
      { id: "accu", label: this._t("tab_battery"), show: !!c.battery_soc },
    ].filter((t) => t.show);
    // if selected tab is unavailable, fall back to first
    const activeMode = tabs.some((t) => t.id === mode) ? mode : (tabs[0]?.id || "price");

    const tabBar = tabs.length > 1 ? b`
      <div class="tabs">
        ${tabs.map((t) => b`
          <button class="tab ${t.id === activeMode ? "on" : ""}" @click=${() => this._setChartMode(t.id)}>${t.label}</button>`)}
      </div>` : A;

    let body;
    if (activeMode === "price") body = this._priceChart(c);
    else body = this._historyChart(c, activeMode);

    return b`<div class="price">${tabBar}${body}</div>`;
  }

  _setChartMode(m) {
    this._chartMode = m;
    if (m !== "price") this._ensureHistory(m);
    this.requestUpdate();
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
      slots.push({ t, v });
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

    return b`
      <div class="chdr">
        <span class="t">${this._t("price_title")} (${hours}u)</span>
        ${sel
          ? b`<span class="now sel">${new Date(sel.t).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}: <b>${sel.v.toFixed(3).replace(".", ",")}</b></span>`
          : current !== null
            ? b`<span class="now">${this._t("now")}: <b>${current.toFixed(3).replace(".", ",")}</b></span>`
            : A}
      </div>
      <div class="chart">
        <div class="yaxis">${yTicks.map((t) => b`<span>${t}</span>`)}</div>
        <div class="plot">
          <div class="bars">
            ${slots.map((s) => {
              if (s.v === null) return b`<div class="bar empty-slot"></div>`;
              const h = Math.max(2, (s.v / maxV) * 100);
              const col = colorForValue(s.v, c.price_stops);
              const isSel = sel && sel.t === s.t;
              const timeTxt = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return b`<div
                class="bar ${isSel ? "sel" : ""}"
                style="height:${h}%;background:${col}"
                title="${timeTxt} — ${s.v.toFixed(3).replace(".", ",")} €/kWh"
                @mouseenter=${() => this._hoverSlot(s)}
                @mouseleave=${() => this._hoverSlot(null)}
                @click=${() => this._tapSlot(s)}
              ></div>`;
            })}
          </div>
          <div class="nowline" data-now="${this._t("now")}" style="left:${nowFrac * 100}%"></div>
        </div>
        <div class="xaxis">
          ${labels.map((l) => b`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
        </div>
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
      .tabs { display: flex; gap: 6px; margin-bottom: 10px; }
      .tab { cursor: pointer; border: 1px solid var(--divider-color); background: transparent; color: var(--secondary-text-color); border-radius: 999px; padding: 3px 12px; font-size: 12px; transition: all .2s; }
      .tab.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      .hist { position: absolute; inset: 0; width: 100%; height: 100%; }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 168px; padding-left: 34px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 34px; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .plot { position: absolute; left: 34px; right: 0; top: 0; bottom: 34px; }
      .bars { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 1px; }
      .bar { flex: 1; border-radius: 2px 2px 0 0; cursor: pointer; transition: opacity .15s; }
      .bar:hover { opacity: .8; }
      .bar.sel { outline: 1.5px solid var(--primary-text-color); outline-offset: -1px; }
      .chdr .now.sel b { color: var(--primary-color); }
      .bar.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); height: 100%; border-radius: 0; align-self: stretch; }
      .nowline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: attr(data-now); position: absolute; top: -2px; left: 3px; font-size: 9px; background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
      .nowline.right::before { left: auto; right: 3px; }
      .xaxis { position: absolute; left: 34px; right: 0; bottom: 12px; height: 14px; }
      .xaxis .tick { position: absolute; transform: translateX(-50%); font-size: 9px; color: var(--secondary-text-color); white-space: nowrap; }
      .xaxis .tick:last-child { transform: translateX(-100%); }
      .xaxis .tick::before { content: ""; position: absolute; top: -6px; left: 50%; width: 1px; height: 4px; background: var(--divider-color, rgba(255,255,255,.2)); }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

console.info("%c energy-flow-price-card %c v1.2.1 ", "background:#7dd3fc;color:#0a1420;font-weight:700", "background:#333;color:#fff");

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "Energy Flow & Price Card",
  description: "Compacte energie-flow (solar/accu/huis/net/auto's) plus dynamische prijzen.",
  preview: true,
  documentationURL: "https://github.com/dennisbest85/energy-flow-price-card",
});
