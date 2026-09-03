/* Dil seçimini kalıcı hatırla — /en/ ve /ru/ sayfaları için.
   Kullanıcı TR'ye dönerse otomatik algılama onu tekrar EN/RU'ya atmaz. */
(function(){function r(e){var a=e.target.closest('.seo-lang a, .nav-lang a, .mm-lang a');if(!a)return;var l=(a.getAttribute('hreflang')||'').slice(0,2);if(!l)return;try{localStorage.setItem('fn-lang-choice',l);sessionStorage.setItem('fn-lang-redirected','1')}catch(x){}}
document.addEventListener('click',r,true)})();
