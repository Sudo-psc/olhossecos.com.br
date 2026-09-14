/**
 * Preferência de tema. Fotofobia é comum no olho seco: o visitante precisa
 * poder baixar a luminância sem depender só do sistema operacional.
 *
 * `system` não grava nada — o documento fica sem [data-theme] e o
 * prefers-color-scheme assume. light/dark carimbam o atributo e o
 * localStorage. O script de boot (abaixo) corre no <head> para o primeiro
 * paint já nascer na paleta certa, sem flash.
 */

export const themeStorageKey = "olhossecos-theme";
export const themeChoices = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof themeChoices)[number];

export const themeBootScript = `(function(){try{var t=localStorage.getItem("${themeStorageKey}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
