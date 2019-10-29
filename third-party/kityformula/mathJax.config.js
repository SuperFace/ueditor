MathJax.Hub.Config({
  showProcessingMessages: false, //关闭js加载过程信息
  messageStyle: "none", //不显示信息
  extensions: ["tex2jax.js"],
  jax: ["input/TeX", "output/HTML-CSS"],
  tex2jax: {
    inlineMath: [
      ['$','$'],
      ["\\(","\\)"],
      ['[mathjaxinline]','[/mathjaxinline]']
    ],
    displayMath: [
      ['$$','$$'], 
      ["\\[","\\]"],
      ['[mathjax]','[/mathjax]']
    ],
    processEscapes: true
  },
  "HTML-CSS": { 
    showMathMenu: false,
    availableFonts: ["STIX", "TeX"] 
  }
});