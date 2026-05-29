import { createDefaultThemeConfig } from '@/lib/theme/constants'
import type { ThemeConfig, ThemeScriptProps } from '@/lib/theme/types'

export type ThemeScriptConfig = Pick<
  ThemeConfig,
  | 'themes'
  | 'defaultTheme'
  | 'forcedTheme'
  | 'enableSystem'
  | 'followSystem'
  | 'attribute'
  | 'value'
  | 'target'
  | 'storageKey'
  | 'storage'
  | 'enableColorScheme'
  | 'legacyStorageKey'
>

export function themeProviderPropsToScriptConfig(
  props: ThemeScriptProps,
): ThemeScriptConfig {
  const defaults = createDefaultThemeConfig()
  return {
    themes: props.themes ?? defaults.themes,
    defaultTheme: props.defaultTheme ?? defaults.defaultTheme,
    forcedTheme: props.forcedTheme,
    enableSystem: props.enableSystem ?? defaults.enableSystem,
    followSystem: props.followSystem ?? defaults.followSystem,
    attribute: props.attribute ?? defaults.attribute,
    value: props.value,
    target: props.target ?? defaults.target,
    storageKey: props.storageKey ?? defaults.storageKey,
    storage: props.storage ?? defaults.storage,
    enableColorScheme: props.enableColorScheme ?? defaults.enableColorScheme,
    legacyStorageKey: defaults.legacyStorageKey,
  }
}

function serializeScriptConfig(config: ThemeScriptConfig): string {
  return JSON.stringify(config)
}

/**
 * Blocking IIFE for <head> and soft navigations. Runs before first paint on hard loads.
 */
export function buildThemeInitScript(config: ThemeScriptConfig): string {
  const payload = serializeScriptConfig(config)

  return `(function(){try{var c=${payload};var d=document;var r=c.target==="html"||c.target==="documentElement"?d.documentElement:(c.target==="body"?d.body:d.querySelector(c.target));if(!r)return;var ls=c.storage==="localStorage"||c.storage==="hybrid";var k=c.storageKey;var legacy=c.legacyStorageKey;if(ls&&legacy){var prev=localStorage.getItem(k);if(!prev){var leg=localStorage.getItem(legacy);if(leg==="light"||leg==="dark"){localStorage.setItem(k,leg);localStorage.removeItem(legacy);}}}var stored=ls?localStorage.getItem(k):null;var theme=c.forcedTheme||(c.followSystem?"system":(stored||c.defaultTheme));if(c.themes.indexOf(theme)===-1&&theme!=="system")theme=c.defaultTheme;var resolved=theme;if(theme==="system"||c.followSystem){var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(c.enableSystem||c.followSystem){resolved=dark?"dark":"light";}else{resolved=c.defaultTheme==="system"?(dark?"dark":"light"):c.defaultTheme;}}var attrVal=(c.value&&c.value[resolved])||resolved;var attrs=Array.isArray(c.attribute)?c.attribute:[c.attribute];var usesClass=attrs.indexOf("class")!==-1||attrs.indexOf("className")!==-1;if(usesClass){var managed={};if(c.value){for(var i=0;i<c.themes.length;i++){var tv=c.value[c.themes[i]];if(tv)tv.split(/\\s+/).forEach(function(t){if(t)managed[t]=1;});}}else{c.themes.forEach(function(t){if(t!=="system")managed[t]=1;});}Object.keys(managed).forEach(function(t){r.classList.remove(t);});attrVal.split(/\\s+/).filter(Boolean).forEach(function(t){r.classList.add(t);});}for(var j=0;j<attrs.length;j++){var n=attrs[j];if(n==="class"||n==="className")continue;r.setAttribute(n,attrVal);}if(c.enableColorScheme)r.style.colorScheme=resolved;}catch(e){}})();`
}
