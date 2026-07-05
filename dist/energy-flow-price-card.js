/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

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
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),w=x(2),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

const ENTITY_FIELDS = [
  { key: "solar_power", label: "Solar vermogen (W)" },
  { key: "home_power", label: "Huis verbruik (W)" },
  { key: "grid_power", label: "Net vermogen (W, - = export)" },
  { key: "battery_power", label: "Accu vermogen (W, + = laden)" },
  { key: "battery_soc", label: "Accu SOC (%)" },
  { key: "car_power", label: "Laadpaal vermogen (W)" },
  { key: "car_soc", label: "Auto SOC (%)" },
  { key: "price_entity", label: "Frank Energie prijs-sensor" },
];

const COLOR_FIELDS = [
  { key: "color_solar", label: "Kleur solar" },
  { key: "color_battery", label: "Kleur accu" },
  { key: "color_grid", label: "Kleur net" },
  { key: "color_car", label: "Kleur auto" },
  { key: "color_home", label: "Kleur huis" },
  { key: "price_low_color", label: "Prijs: goedkoop" },
  { key: "price_mid_color", label: "Prijs: gemiddeld" },
  { key: "price_high_color", label: "Prijs: duur" },
];

const NUM_FIELDS = [
  { key: "price_low_max", label: "Drempel goedkoop < (€/kWh)" },
  { key: "price_mid_max", label: "Drempel gemiddeld < (€/kWh)" },
];

class EnergyFlowPriceCardEditor extends i {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { ...config };
  }

  _val(key) {
    return this._config?.[key] ?? "";
  }

  _emit(next) {
    this._config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true })
    );
  }

  _toggle(key, ev) {
    this._emit({ ...this._config, [key]: ev.target.checked });
  }

  _pickEntity(key, ev) {
    const v = ev.detail?.value ?? ev.target.value;
    const next = { ...this._config };
    if (v) next[key] = v; else delete next[key];
    this._emit(next);
  }

  _text(key, ev) {
    const v = ev.target.value;
    const next = { ...this._config };
    if (v === "") delete next[key]; else next[key] = v;
    this._emit(next);
  }

  _numChange(key, ev) {
    const v = parseFloat(ev.target.value);
    const next = { ...this._config };
    if (isNaN(v)) delete next[key]; else next[key] = v;
    this._emit(next);
  }

  render() {
    if (!this.hass || !this._config) return A;
    const showFlow = this._config.show_flow !== false;
    const showPrice = this._config.show_price !== false;

    return b`
      <div class="root">
        <div class="section">
          <div class="head">Weergave</div>
          <ha-formfield label="Flow tonen">
            <ha-switch .checked=${showFlow} @change=${(e) => this._toggle("show_flow", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label="Prijzen tonen">
            <ha-switch .checked=${showPrice} @change=${(e) => this._toggle("show_price", e)}></ha-switch>
          </ha-formfield>
        </div>

        <div class="section">
          <div class="head">Entiteiten</div>
          ${ENTITY_FIELDS.map(
            (f) => b`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._val(f.key)}
                .label=${f.label}
                allow-custom-entity
                @value-changed=${(e) => this._pickEntity(f.key, e)}
              ></ha-entity-picker>
            `
          )}
        </div>

        <div class="section">
          <div class="head">Kleuren</div>
          <div class="grid">
            ${COLOR_FIELDS.map(
              (f) => b`
                <label class="color">
                  <span>${f.label}</span>
                  <input type="color" .value=${this._val(f.key) || "#888888"}
                    @input=${(e) => this._text(f.key, e)} />
                </label>
              `
            )}
          </div>
        </div>

        <div class="section">
          <div class="head">Prijsdrempels</div>
          ${NUM_FIELDS.map(
            (f) => b`
              <ha-textfield
                type="number" step="0.01"
                .label=${f.label}
                .value=${this._val(f.key)}
                @input=${(e) => this._numChange(f.key, e)}
              ></ha-textfield>
            `
          )}
        </div>
      </div>
    `;
  }

  static get styles() {
    return i$3`
      .root { display: flex; flex-direction: column; gap: 18px; padding: 4px; }
      .section { display: flex; flex-direction: column; gap: 8px; }
      .head { font-weight: 600; font-size: 14px; margin-bottom: 2px; color: var(--primary-text-color); }
      ha-entity-picker, ha-textfield { display: block; width: 100%; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .color { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
      .color input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
    `;
  }
}

customElements.define("energy-flow-price-card-editor", EnergyFlowPriceCardEditor);

const DEFAULTS = {
  show_flow: true,
  show_price: true,
  price_unit: "€/kWh",
  color_solar: "#f5c518",
  color_battery: "#4caf50",
  color_grid: "#ff6b5e",
  color_car: "#a78bfa",
  color_home: "#7dd3fc",
  price_low_color: "#4caf50",
  price_mid_color: "#f5c518",
  price_high_color: "#ff6b5e",
  price_low_max: 0.14,
  price_mid_max: 0.26,
};

function num(hass, entity) {
  if (!entity || !hass || !hass.states[entity]) return null;
  const v = parseFloat(hass.states[entity].state);
  return isNaN(v) ? null : v;
}

// Format watts nicely: >=1000 -> kW
function fmtPower(w) {
  if (w === null) return "–";
  const a = Math.abs(w);
  if (a >= 1000) return (w / 1000).toFixed(2).replace(".", ",") + " kW";
  return Math.round(w) + " W";
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
      home_power: "",
      grid_power: "",
      battery_power: "",
      battery_soc: "",
      car_power: "",
      car_soc: "",
      price_entity: "",
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...DEFAULTS, ...config };
  }

  getCardSize() {
    return (this._config.show_flow ? 3 : 0) + (this._config.show_price ? 3 : 0) || 1;
  }

  // ---- price data: try attribute arrays, fall back to current price ----
  _priceData() {
    const cfg = this._config;
    const ent = this.hass?.states?.[cfg.price_entity];
    if (!ent) return { points: [], current: null };
    const attrs = ent.attributes || {};
    // Frank Energie commonly exposes arrays like prices / prices_today under various keys.
    const candidates = [
      attrs.prices, attrs.prices_today, attrs.today, attrs.raw_today, attrs.data,
    ].filter(Boolean);
    let arr = candidates.find((a) => Array.isArray(a) && a.length);
    let points = [];
    if (arr) {
      points = arr
        .map((p) => {
          const from = p.from ?? p.start ?? p.time ?? p.datetime ?? p.date;
          const price = p.price ?? p.value ?? p.total ?? p.marketPrice ?? p.market_price;
          const t = from ? new Date(from).getTime() : null;
          const v = typeof price === "number" ? price : parseFloat(price);
          return t && !isNaN(v) ? { t, v } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.t - b.t);
    }
    const current = num(this.hass, cfg.price_entity);
    return { points, current };
  }

  _priceColor(v) {
    const cfg = this._config;
    if (v < cfg.price_low_max) return cfg.price_low_color;
    if (v < cfg.price_mid_max) return cfg.price_mid_color;
    return cfg.price_high_color;
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

  // -------------------- FLOW --------------------
  _renderFlow() {
    const c = this._config;
    const solar = num(this.hass, c.solar_power);
    const home = num(this.hass, c.home_power);
    const grid = num(this.hass, c.grid_power);
    const batt = num(this.hass, c.battery_power);
    const soc = num(this.hass, c.battery_soc);
    const carP = num(this.hass, c.car_power);
    const carSoc = num(this.hass, c.car_soc);

    // Active line if there's meaningful power (>5 W)
    const act = (v) => v !== null && Math.abs(v) > 5;
    const carActive = act(carP);

    // battery: convention positive = charging. Adjust sub label.
    const battLabel = batt === null ? "" : batt > 0 ? "laden" : "ontladen";
    const gridLabel = grid === null ? "" : grid < 0 ? "export" : "import";

    const socDash = (val, r) => {
      const circ = 2 * Math.PI * r;
      const pct = val === null ? 0 : Math.max(0, Math.min(100, val)) / 100;
      return { circ, offset: circ * (1 - pct) };
    };
    const bs = socDash(soc, 23);

    return b`
      <div class="flow">
        <svg class="wires" viewBox="0 0 720 180" preserveAspectRatio="none">
          <path class="wire" d="M70,55 Q220,90 330,90"></path>
          ${act(solar) ? w`<path class="live" style="stroke:${c.color_solar}" d="M70,55 Q220,90 330,90"></path>` : A}
          <path class="wire" d="M650,55 Q500,90 390,90"></path>
          ${act(grid) ? w`<path class="live" style="stroke:${c.color_grid}" d="M390,90 Q500,90 650,55"></path>` : A}
          <path class="wire" d="M70,125 Q220,90 330,90"></path>
          ${act(batt) ? w`<path class="live" style="stroke:${c.color_battery}" d="M330,90 Q220,90 70,125"></path>` : A}
          ${carActive ? w`<path class="wire" d="M650,125 Q500,90 390,90"></path>` : A}
          ${carActive ? w`<path class="live" style="stroke:${c.color_car}" d="M390,90 Q500,90 650,125"></path>` : A}
        </svg>

        <div class="node tl">
          <div class="ic" style="color:${c.color_solar};border-color:${c.color_solar}66;background:${c.color_solar}22">
            <ha-icon icon="mdi:solar-power-variant"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">Solar</span><span class="val" style="color:${c.color_solar}">${fmtPower(solar)}</span></div>
        </div>

        <div class="node tr">
          <div class="ic" style="color:${c.color_grid};border-color:${c.color_grid}66;background:${c.color_grid}22">
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">Net</span><span class="val" style="color:${c.color_grid}">${fmtPower(grid)}</span>${gridLabel ? b`<span class="sub" style="color:${c.color_grid}">${gridLabel}</span>` : A}</div>
        </div>

        <div class="node bl">
          <div class="socwrap">
            <svg class="socring" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
              ${soc !== null ? w`<circle cx="26" cy="26" r="23" fill="none" stroke="${c.color_battery}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${bs.circ}" stroke-dashoffset="${bs.offset}" transform="rotate(-90 26 26)"></circle>` : A}
            </svg>
            <div class="ic" style="color:${c.color_battery};border-color:${c.color_battery}66;background:${c.color_battery}22">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
            </div>
          </div>
          <div class="txt"><span class="lbl">Accu${soc !== null ? b` · <b style="color:${c.color_battery}">${Math.round(soc)}%</b>` : A}</span><span class="val" style="color:${c.color_battery}">${fmtPower(batt)}</span>${battLabel ? b`<span class="sub" style="color:${c.color_battery}">${battLabel}</span>` : A}</div>
        </div>

        ${carActive ? b`
          <div class="node br">
            <div class="ic" style="color:${c.color_car};border-color:${c.color_car}66;background:${c.color_car}22">
              <ha-icon icon="mdi:car-electric"></ha-icon>
            </div>
            <div class="txt"><span class="lbl">Auto${carSoc !== null ? b` · <b style="color:${c.color_car}">${Math.round(carSoc)}%</b>` : A}</span><span class="val" style="color:${c.color_car}">${fmtPower(carP)}</span><span class="sub" style="color:${c.color_car}">laden</span></div>
          </div>` : A}

        <div class="huis">
          <div class="ic" style="color:${c.color_home};border-color:${c.color_home}66;background:${c.color_home}1f">
            <ha-icon icon="mdi:home"></ha-icon>
          </div>
          <span class="lbl">Huis</span>
          <span class="val" style="color:${c.color_home}">${fmtPower(home)}</span>
        </div>
      </div>
    `;
  }

  // -------------------- PRICE --------------------
  _renderPrice() {
    const c = this._config;
    const { points, current } = this._priceData();
    const now = Date.now();

    let bars = A;
    let nowLeft = null;
    let maxV = 0.4;
    if (points.length) {
      maxV = Math.max(...points.map((p) => p.v), 0.1) * 1.1;
      const total = points.length;
      let nowIdx = points.findIndex((p, i) => {
        const next = points[i + 1];
        return p.t <= now && (!next || next.t > now);
      });
      if (nowIdx < 0) nowIdx = points.filter((p) => p.t <= now).length - 1;
      nowLeft = nowIdx >= 0 ? (nowIdx + 0.5) / total : null;

      bars = points.map((p, i) => {
        const h = Math.max(2, (p.v / maxV) * 100);
        let col = this._priceColor(p.v);
        if (i > nowIdx) col += "66"; // future dimmed
        const title = new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " — " + p.v.toFixed(2).replace(".", ",");
        return b`<div class="bar" style="height:${h}%;background:${col}" title="${title}"></div>`;
      });
    }

    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => (maxV * f).toFixed(2).replace(".", ","));

    return b`
      <div class="price">
        <div class="chdr">
          <span class="t">Stroomprijs per kwartier</span>
          ${current !== null ? b`<span class="now">Nu: <b>${(current).toFixed(2).replace(".", ",")}</b></span>` : A}
        </div>
        <div class="chart">
          <div class="yaxis">${yTicks.map((t) => b`<span>${t}</span>`)}</div>
          <div class="bars">${points.length ? bars : b`<div class="empty">Geen prijsdata gevonden in dit entiteit-attribuut.</div>`}</div>
          ${nowLeft !== null ? b`<div class="nowline" style="left:calc(34px + ${nowLeft} * (100% - 34px))"></div>` : A}
        </div>
        <div class="legend">
          <span><span class="dot" style="background:${c.price_low_color}"></span>goedkoop</span>
          <span><span class="dot" style="background:${c.price_mid_color}"></span>gemiddeld</span>
          <span><span class="dot" style="background:${c.price_high_color}"></span>duur</span>
        </div>
      </div>
    `;
  }

  static get styles() {
    return i$3`
      ha-card { padding: 12px; }
      .stack { display: flex; flex-direction: column; gap: 12px; }

      /* FLOW */
      .flow { position: relative; height: 180px; }
      .wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .wire { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 2.5; }
      .live { stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-dasharray: 5 9; animation: flow 1s linear infinite; }
      @keyframes flow { to { stroke-dashoffset: -14; } }

      .node { position: absolute; display: flex; align-items: center; gap: 8px; z-index: 2; }
      .node.tl { left: 6px; top: 10px; }
      .node.tr { right: 6px; top: 10px; flex-direction: row-reverse; text-align: right; }
      .node.bl { left: 6px; bottom: 10px; }
      .node.br { right: 6px; bottom: 10px; flex-direction: row-reverse; text-align: right; }
      .node .ic { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto;
        display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; }
      .node .ic ha-icon { --mdc-icon-size: 24px; }
      .txt { display: flex; flex-direction: column; gap: 1px; }
      .node.tr .txt, .node.br .txt { align-items: flex-end; }
      .txt .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .txt .val { font-size: 15px; font-weight: 700; line-height: 1.1; }
      .txt .sub { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; opacity: .85; }

      .socwrap { position: relative; width: 44px; height: 44px; flex: 0 0 auto; }
      .socwrap .ic { position: absolute; inset: 0; }
      .socring { position: absolute; inset: -4px; }

      .huis { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
        z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .huis .ic { width: 58px; height: 58px; border-radius: 16px; border: 1.5px solid transparent;
        display: flex; align-items: center; justify-content: center; }
      .huis .ic ha-icon { --mdc-icon-size: 30px; }
      .huis .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .huis .val { font-size: 16px; font-weight: 700; }

      /* PRICE */
      .chdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .chdr .t { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 150px; padding-left: 34px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 20px; width: 30px;
        display: flex; flex-direction: column; justify-content: space-between;
        font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .bars { position: absolute; left: 34px; right: 0; top: 0; bottom: 20px;
        display: flex; align-items: flex-end; gap: 1px; }
      .bar { flex: 1; border-radius: 2px 2px 0 0; }
      .empty { color: var(--secondary-text-color); font-size: 11px; align-self: center; margin: auto; }
      .nowline { position: absolute; top: 0; bottom: 20px; width: 2px;
        background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: "Nu"; position: absolute; top: -2px; left: 3px; font-size: 9px;
        background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
      .legend { display: flex; gap: 16px; margin-top: 8px; font-size: 10px; color: var(--secondary-text-color); }
      .legend span { display: flex; align-items: center; gap: 5px; }
      .dot { width: 9px; height: 9px; border-radius: 2px; }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "Energy Flow & Price Card",
  description: "Compacte energie-flow (solar/accu/huis/net/auto) plus kwartierprijzen.",
  preview: true,
  documentationURL: "https://github.com/USERNAME/energy-flow-price-card",
});
