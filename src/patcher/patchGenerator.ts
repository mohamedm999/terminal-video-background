import { TerminalVideoSettings } from '../types';

export interface PatchConfig {
  settings: TerminalVideoSettings;
  videoPath: string;
}

export class PatchGenerator {
  // version kept for fileOperator compatibility
  constructor(private readonly version: string) {
    void this.version;
  }

  generatePatch(config: PatchConfig): string {
    const { settings, videoPath } = config;
    const videoUrl = this.buildVideoUrl(videoPath);
    const css = this.buildCSS(settings);

    const configObj = {
      url: videoUrl,
      op: settings.opacity,
      bl: settings.blur,
      br: settings.brightness,
      sa: settings.saturation,
      fit: settings.objectFit,
      mu: settings.muted,
      lo: settings.loop,
      pr: settings.playbackRate,
    };

    return this.buildScript(css, configObj);
  }

  generateCleanupScript(): string {
    return [
      '(function(){',
      'var b=document.getElementById("tvb-video-box");if(b)b.remove();',
      'var s=document.getElementById("tvb-style");if(s)s.remove();',
      '})();',
    ].join('');
  }

  private buildCSS(_s: TerminalVideoSettings): string {
    // CSS is no longer needed — video overlay uses inline styles only
    return '';
  }

  private buildVideoUrl(videoPath: string): string {
    let normalized = videoPath.replace(/\\/g, '/');
    if (/^[A-Za-z]:/.test(normalized)) {
      normalized = '/' + normalized;
    }
    const encoded = normalized
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
    return `vscode-file://vscode-app${encoded}`;
  }

  private buildScript(_css: string, configObj: Record<string, unknown>): string {
    const cfgStr = JSON.stringify(configObj);

    return `
(function(){
var G=${cfgStr};

function tvbInject(){
  var panel=document.querySelector(".part.panel");
  if(!panel)return false;
  if(document.getElementById("tvb-video-box"))return true;

  panel.style.setProperty("position","relative","important");

  var box=document.createElement("div");
  box.id="tvb-video-box";
  box.setAttribute("aria-hidden","true");
  box.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;background:transparent;";

  var vid=document.createElement("video");
  vid.id="tvb-vid";
  vid.autoplay=true;
  vid.muted=G.mu;
  vid.loop=G.lo;
  vid.playsInline=true;
  vid.preload="auto";
  vid.src=G.url;
  vid.playbackRate=G.pr;
  vid.setAttribute("tabindex","-1");
  vid.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:"+G.fit+";opacity:"+G.op+";filter:blur("+G.bl+"px) brightness("+G.br+"%) saturate("+G.sa+"%);pointer-events:none;";

  box.appendChild(vid);
  panel.appendChild(box);

  vid.play().catch(function(e){console.log("[TVB] play error:",e);});
  console.log("[TVB] v1.1 overlay injected");
  return true;
}

function tvbInit(){
  if(tvbInject())return;
  var n=0,t=setInterval(function(){n++;if(tvbInject()||n>60){clearInterval(t);}},500);
}

window.__tvb_changeVideo=function(newUrl,op){var ex=document.getElementById("tvb-vid");if(!ex||ex.src===newUrl)return;ex.src=newUrl;ex.play().catch(function(){});if(op!==undefined)ex.style.opacity=String(op);};

function tvbObserve(){
  if(window.__tvb_mo){try{window.__tvb_mo.disconnect();}catch(e){}}
  var dt=null;
  var mo=new MutationObserver(function(){
    if(dt)return;
    dt=setTimeout(function(){dt=null;
      if(!document.getElementById("tvb-video-box"))tvbInject();
    },300);
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  window.__tvb_mo=mo;
}

setTimeout(function(){tvbInit();tvbObserve();},1000);
window.addEventListener("load",function(){setTimeout(tvbInit,2000);});
})();`;
  }
}
