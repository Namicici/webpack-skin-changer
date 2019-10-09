var idMap = {};
var theme_COLOR_config;

module.exports = {
    changeColor: function (options, promiseForIE) {
        var win = window // || global
        if (!theme_COLOR_config) {
            theme_COLOR_config = win.__theme_COLOR_cfg || {}
        }
        var oldColors = options.oldColors || theme_COLOR_config.colors || []
        var newColors = options.newColors || []

        var cssUrl = (theme_COLOR_config.publicPath + theme_COLOR_config.url) || options.cssUrl;
        if (options.changeUrl) {
            cssUrl = options.changeUrl(cssUrl)
        }

        var _this = this;
        var Promise = promiseForIE || win.Promise
        return new Promise(function (resolve, reject) {
            if (isSameArr(oldColors, newColors)) {
                resolve()
            }
            else {
                getCssText(cssUrl, setCssTo, resolve, reject)
            }
        })

        function getCssText(url, setCssTo, resolve, reject) {
            var elStyle = idMap[url] && document.getElementById(idMap[url]);
            if (elStyle) {
                oldColors = elStyle.color.split('|')
                setCssTo(elStyle, elStyle.innerText)
                resolve()
            } else {
				// 添加进入head有可能会被其他样式覆盖
				// elStyle = document.head.appendChild(document.createElement('style'))
				// 这里的元素要保证最新，最好放在body下面
				elStyle = document.getElementById('skinNode')
				var refNode = document.getElementById('App') || document.getElementById('app')
				if (!elStyle) {
					elStyle = document.createElement('style')
					document.body.insertBefore(elStyle, refNode)
				}
                idMap[url] = 'css_' + (+new Date())
                elStyle.setAttribute('id', idMap[url])
                _this.getCSSString(url, function (cssText) {
                    setCssTo(elStyle, cssText)
                    resolve()
                }, reject)
            }
        }

        function setCssTo(elStyle, cssText) {
            cssText = _this.replaceCssText(cssText, oldColors, newColors)
            elStyle.color = newColors.join('|')
            elStyle.innerText = cssText
            theme_COLOR_config.colors = newColors
        }
    },
    replaceCssText: function (cssText, oldColors, newColors) {
        oldColors.forEach(function (color, t) {
            var pattern = color.replace(/,/g, ',\\s*')
            pattern = pattern.replace(/\(/g, '\\(')
            pattern = pattern.replace(/\)/g, '\\)')

            cssText = cssText.replace(new RegExp(pattern, 'ig'), newColors[t]) // 255, 255,3
        })
        return cssText
    },
    getCSSString: function (url, resolve, reject) {
		if (window.DocerThemeStyles) {
			resolve(window.DocerThemeStyles)
		} else {
			var isJsFile = /(\.js)$/.test(url)
			if (isJsFile) {
				var head = document.getElementsByTagName('head')[0]
				var script = document.createElement( "script" )
				script.type = "text/javascript"
				script.async = true
				script.src = url
				script.onload = function () {
					resolve(window.getThemeColorCss())
				}
				head.appendChild(script)
			} else {
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							resolve(xhr.responseText)
						} else {
							reject(xhr.status)
						}
					}
				}
				xhr.onerror = function (e) {
					reject(e)
				}
				xhr.ontimeout = function (e) {
					reject(e)
				}
				xhr.open('GET', url)
				xhr.send()
			} 
		}
    },
}

function isSameArr(oldColors, newColors) {
    if (oldColors.length !== newColors.length) {
        return false
    }
    for (var i = 0, j = oldColors.length; i < j; i++) {
        if (oldColors[i] !== newColors[i]) {
            return false
        }
    }
    return true
}