核心代码来源https://github.com/hzsrc/webpack-theme-color-replacer，在此基础上支持对特定变量的替换，比如var(--search-bar-background-color)；对提取的样式做了js封装，以便跨域或者离线情况下获取皮肤样式，同时也将样式文件写入了入口文件，可以避免异步获取皮肤样式的开销。

This plugin can extract theme color styles from all the outputed css files (such as element-ui theme colors), and make a 'theme-colors.css' file which only contains color styles. At runtime in your web page, the client part will help you to download this css file, and then replace the colors into new customized colors dynamicly.

This is a sample:
https://hzsrc-vue-webpack4-elementui.netlify.com/themeColor.html

Implementation (Chinese):
https://segmentfault.com/a/1190000016061608

# 1.Install
npm i -D webpack-skin-changer

# 2.Cofig for webpack

````js

const ThemeColorReplacer = require('webpack-skin-changer')

module.exports = {
    .....
    plugins: [
        new ThemeColorReplacer({
			fileName: 'js/theme-colors-[contenthash:8].js', // output css file name, suport [contenthash] and [hash].
            matchColors: ['var(--search-bar-background-color)', '#4b0'], // colors array for extracting css file
            resolveCss(resultCss) { // optional. Resolve result css code as you wish.
                return resultCss.replace(/#4b0/g, '#ed4040')
            },
            externalCssFiles: ['./node_modules/element-ui/lib/theme-chalk/index.css'], // optional, String or string array. Set external css files (such as cdn css) to extract colors.
            changeSelector(cssSelector) { // optional, Funciton. Changing css selectors, in order to raise css priority, to resolve lazy-loading problems.
                return cssSelector
            },
            isJsUgly: process.env.NODE_ENV !== 'development', // optional. Set to `true` if your js is uglified. Default is set by process.env.NODE_ENV.
        })
    ],
}
````

You can view this sample:
https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/build/webpack.base.conf.js

# 3.Usage in your web page
Like this:

````js
import replacer from 'webpack-skin-changer/client'

// change theme colors at runtime.
export function changeColor(newColor) {
  var options = {
    newColors: [newColor, newColor], // new colors array, one-to-one corresponde with `matchColors`
    // changeUrl(cssUrl) {
    //   return `/${cssUrl}`; // while router is not `hash` mode, it needs absolute path
    // },
  }

  replacer.changer.changeColor(options, Promise).then(() => {
      console.log('Theme colors changed!')
  })
}



````

You can view this sample:
https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/src/js/themeColorClient.js

# issues report
If you have issues with this plugin, please run your command with `--theme_debug` option, such as `npm run dev --theme_debug`, then upload the outputed `_tmp_xxx` files while reporting issues. Thanks!