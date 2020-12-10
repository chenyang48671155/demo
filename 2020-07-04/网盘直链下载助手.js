===================================================================
--- Current Version
+++ New Version
@@ -1,17 +1,10 @@
 // ==UserScript==
-// @name              百度网盘直链下载助手
-// @name:en           Baidu Netdisk Assistant
-// @name:zh           百度网盘直链下载助手
-// @name:zh-CN        百度网盘直链下载助手
-// @name:ja           Baidu Netdiskストレートチェーンダウンロードアシスタントv4
+// @name              网盘直链下载助手
 // @namespace         https://github.com/syhyz1990/baiduyun
-// @version           4.1.5
+// @version           4.1.7
 // @icon              https://www.baiduyun.wiki/48x48.png
-// @description       【百度网盘直链下载助手】是一款免客户端获取百度网盘文件真实下载地址的油猴插件，支持Windows，Mac，Linux，Android等多平台，可使用IDM，XDown等多线程加速工具加速下载，支持RPC协议远程下载。
-// @description:en    [Baidu Netdisk Assistant] is an oil monkey plug-in that does not require clients to obtain the real download address of Baidu Netdisk files. It supports Windows, Mac, Linux, Android and other platforms. Multithreaded acceleration tools such as IDM and XDown can be used. Accelerate download, support remote download.
-// @description:ja    [Baidu Netdiskストレートチェーンダウンロードアシスタント]は、クライアントがBaidu Netdiskファイルの実際のダウンロードアドレスを取得する必要のないオイルモンキープラグインです。Windows、Mac、Linux、Android、およびその他のプラットフォームをサポートしています。IDMやXDownなどのマルチスレッドアクセラレーションツールを使用できます。 ダウンロードの高速化、リモートダウンロードのサポート、バージョン4.0.0の新しいアップグレード。
-// @author            syhyz2020
+// @description       【网盘直链下载助手】是一款免客户端获取百度网盘文件真实下载地址的油猴插件，支持Windows，Mac，Linux，Android等多平台，可使用IDM，XDown等多线程加速工具加速下载，支持RPC协议远程下载。
 // @license           AGPL
 // @supportURL        https://github.com/syhyz1990/baiduyun
 // @updateURL         https://www.baiduyun.wiki/baiduyun.user.js
 // @downloadURL       https://www.baiduyun.wiki/baiduyun.user.js
@@ -22,77 +15,81 @@
 // @match             *://pan.baidu.com/share/*
 // @match             *://yun.baidu.com/share/*
 // @require           https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
 // @require           https://cdn.jsdelivr.net/npm/sweetalert2@9
+// @connect           baidu.com
+// @connect           baidupcs.com
+// @connect           baiduyun.wiki
+// @connect           localhost
 // @connect           *
 // @run-at            document-idle
 // @grant             unsafeWindow
 // @grant             GM_addStyle
 // @grant             GM_xmlhttpRequest
+// @grant             GM_download
 // @grant             GM_setClipboard
 // @grant             GM_setValue
 // @grant             GM_getValue
 // @grant             GM_openInTab
+// @grant             GM_info
 // @grant             GM_registerMenuCommand
 // ==/UserScript==
 
-;(function () {
-    'use strict';
-
-    const version = '4.1.5';
+;(() => {
+    'use strict'
+    const version = GM_info.script.version
+    const hostname = location.hostname
     const classMap = {
-        'bar-search': 'OFaPaO',
-        'list-tools': 'tcuLAu',
-        'header': 'vyQHNyb'
-    };
+      'bar-search': 'OFaPaO',
+      'list-tools': 'tcuLAu',
+      'header': 'vyQHNyb'
+    }
     const errorMsg = {
         'dir': '提示：不支持整个文件夹下载，可进入文件夹内获取文件链接下载！',
-        'unlogin': '提示：登录百度网盘后才能使用此功能哦！',
+        'unlogin': '提示：登录网盘后才能使用此功能哦！',
         'fail': '提示：获取下载链接失败！请刷新网页后重试！',
         'unselected': '提示：请先选择要下载的文件！',
         'morethan': '提示：多个文件请点击【显示链接】！',
         'toobig': '提示：只支持300M以下的文件夹，若链接无法下载，请进入文件夹后勾选文件获取！',
         'timeout': '提示：页面过期，请刷新重试！',
         'wrongcode': '提示：获取验证码失败！',
         'deleted': '提示：文件不存在或已被百度和谐，无法下载！',
-    };
-    let defaultCode = 250528;
-    let secretCode = getValue('secretCodeV') ? getValue('secretCodeV') : defaultCode;
-    let ids = [];
-    let userAgent = '';
-    let userAgentDefault = navigator.userAgent;
-    let number = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
-    let copyright = 'Powerd By <a style="margin-left: 5px;" href="https://www.baiduyun.wiki" target="_blank">网盘直链下载助手</a>，建议配合网盘 <a href="https://pan.baidu.com/buy/checkoutcounter?from=homepage&svip=1" target="_blank">超级会员</a> 使用';
+    }
+    let defaultCode = 250528
+    let secretCode = getValue('secretCodeV') ? getValue('secretCodeV') : defaultCode
+    let ids = []
+    let userAgent = ''
+    let number = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
     let Toast = Swal.mixin({
         toast: true,
         position: 'top',
         showConfirmButton: false,
         timer: 3000,
         timerProgressBar: false,
         onOpen: (toast) => {
-            toast.addEventListener('mouseenter', Swal.stopTimer);
-            toast.addEventListener('mouseleave', Swal.resumeTimer);
+            toast.addEventListener('mouseenter', Swal.stopTimer)
+            toast.addEventListener('mouseleave', Swal.resumeTimer)
         }
-    });
+    })
     let ariaRPC = {
-        domain: getValue('rpcDomain') ? getValue('rpcDomain') : 'http://localhost',
-        port: getValue('rpcPort') ? getValue('rpcPort') : 6800,
-        token: getValue('rpcToken') ? getValue('rpcToken') : '',
-        dir: getValue('rpcDir') ? getValue('rpcDir') : 'D:/',
-    };
+        domain: getValue('rpcDomain') || 'http://localhost',
+        port: getValue('rpcPort') || 6800,
+        token: getValue('rpcToken') || '',
+        dir: getValue('rpcDir') || 'D:/',
+    }
 
     function clog(c1, c2, c3) {
-        c1 = c1 ? c1 : '';
-        c2 = c2 ? c2 : '';
-        c3 = c3 ? c3 : '';
-        console.group('[百度网盘直链下载助手]');
-        console.log(c1, c2, c3);
-        console.groupEnd();
+        c1 = c1 ? c1 : ''
+        c2 = c2 ? c2 : ''
+        c3 = c3 ? c3 : ''
+        console.group('[网盘直链下载助手]')
+        console.log(c1, c2, c3)
+        console.groupEnd()
     }
 
     function getBDUSS() {
-        let baiduyunPlugin_BDUSS = getStorage('baiduyunPlugin_BDUSS') ? getStorage('baiduyunPlugin_BDUSS') : '{"baiduyunPlugin_BDUSS":""}';
-        let BDUSS = JSON.parse(baiduyunPlugin_BDUSS).BDUSS;
+        let baiduyunPlugin_BDUSS = getStorage('baiduyunPlugin_BDUSS') ? getStorage('baiduyunPlugin_BDUSS') : '{"baiduyunPlugin_BDUSS":""}'
+        let BDUSS = JSON.parse(baiduyunPlugin_BDUSS).BDUSS
         if (!BDUSS) {
             Swal.fire({
                 icon: 'error',
                 title: '提示',
@@ -100,1407 +97,1335 @@
                 footer: '【网盘万能助手】是增强扩展插件，安装后请刷新',
                 confirmButtonText: '安装'
             }).then((result) => {
                 if (result.value) {
-                    GM_openInTab('https://www.baiduyun.wiki/zh-cn/assistant.html', {active: true});
+                    GM_openInTab('https://www.baiduyun.wiki/zh-cn/assistant.html', {active: true})
                 }
-            });
-
+            })
         }
-        return BDUSS;
+        return BDUSS
     }
 
     function aria2c(link, filename, ua) {
-        let BDUSS = getBDUSS();
-        ua = ua || userAgent;
+        let BDUSS = getBDUSS()
+        ua = ua || userAgent
         if (BDUSS) {
-            return encodeURIComponent(`aria2c "${link}" --out "${filename}" --header "User-Agent: ${ua}" --header "Cookie: BDUSS=${BDUSS}"`);
+            return encodeURIComponent(`aria2c "${link}" --out "${filename}" --header "User-Agent: ${ua}" --header "Cookie: BDUSS=${BDUSS}"`)
         } else {
-            return '请先安装网盘万能助手，安装后请重启浏览器！！！';
+            return '请先安装网盘万能助手，安装后请重启浏览器！！！'
         }
     }
 
     function replaceLink(link) {
-        return link ? link.replace(/&/g, '&amp;') : '';
+        return link ? link.replace(/&/g, '&amp;') : ''
     }
 
     function detectPage() {
-        let regx = /[\/].+[\/]/g;
-        let page = location.pathname.match(regx);
-        return page[0].replace(/\//g, '');
+        let regx = /[\/].+[\/]/g
+        let page = location.pathname.match(regx)
+        return page[0].replace(/\//g, '')
     }
 
     function getCookie(e) {
-        let o, t;
-        let n = document, c = decodeURI;
-        return n.cookie.length > 0 && (o = n.cookie.indexOf(e + "="), -1 != o) ? (o = o + e.length + 1, t = n.cookie.indexOf(";", o), -1 == t && (t = n.cookie.length), c(n.cookie.substring(o, t))) : "";
+        let o, t
+        let n = document, c = decodeURI
+        return n.cookie.length > 0 && (o = n.cookie.indexOf(e + "="), -1 != o) ? (o = o + e.length + 1, t = n.cookie.indexOf(";", o), -1 == t && (t = n.cookie.length), c(n.cookie.substring(o, t))) : ""
     }
 
     function setCookie(key, value, t) {
-        let oDate = new Date();  //创建日期对象
-        oDate.setTime(oDate.getTime() + t * 60 * 1000); //设置过期时间
-        document.cookie = key + '=' + value + ';expires=' + oDate.toGMTString();  //设置cookie的名称，数值，过期时间
+        let oDate = new Date()  //创建日期对象
+        oDate.setTime(oDate.getTime() + t * 60 * 1000) //设置过期时间
+        document.cookie = key + '=' + value + ';expires=' + oDate.toGMTString()  //设置cookie的名称，数值，过期时间
     }
 
-    function removeCookie(key) {
-        setCookie(key, '', -1);  //cookie的过期时间设为昨天
-    }
-
     function getValue(name) {
-        return GM_getValue(name);
+        return GM_getValue(name)
     }
 
     function setValue(name, value) {
-        GM_setValue(name, value);
+        GM_setValue(name, value)
     }
 
     function getStorage(key) {
-        return localStorage.getItem(key);
+        return localStorage.getItem(key)
     }
 
+    function setStorage(key, value) {
+        return localStorage.setItem(key, value)
+    }
+
     function getLogID() {
-        let name = "BAIDUID";
-        let u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/~！@#￥%……&";
-        let d = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
-        let f = String.fromCharCode;
+        let name = "BAIDUID"
+        let u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/~！@#￥%……&"
+        let d = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g
+        let f = String.fromCharCode
 
         function l(e) {
             if (e.length < 2) {
-                let n = e.charCodeAt(0);
-                return 128 > n ? e : 2048 > n ? f(192 | n >>> 6) + f(128 | 63 & n) : f(224 | n >>> 12 & 15) + f(128 | n >>> 6 & 63) + f(128 | 63 & n);
+                let n = e.charCodeAt(0)
+                return 128 > n ? e : 2048 > n ? f(192 | n >>> 6) + f(128 | 63 & n) : f(224 | n >>> 12 & 15) + f(128 | n >>> 6 & 63) + f(128 | 63 & n)
             }
-            let n = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320);
-            return f(240 | n >>> 18 & 7) + f(128 | n >>> 12 & 63) + f(128 | n >>> 6 & 63) + f(128 | 63 & n);
+            let n = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320)
+            return f(240 | n >>> 18 & 7) + f(128 | n >>> 12 & 63) + f(128 | n >>> 6 & 63) + f(128 | 63 & n)
         }
 
         function g(e) {
-            return (e + "" + Math.random()).replace(d, l);
+            return (e + "" + Math.random()).replace(d, l)
         }
 
         function m(e) {
-            let n = [0, 2, 1][e.length % 3];
-            let t = e.charCodeAt(0) << 16 | (e.length > 1 ? e.charCodeAt(1) : 0) << 8 | (e.length > 2 ? e.charCodeAt(2) : 0);
-            let o = [u.charAt(t >>> 18), u.charAt(t >>> 12 & 63), n >= 2 ? "=" : u.charAt(t >>> 6 & 63), n >= 1 ? "=" : u.charAt(63 & t)];
-            return o.join("");
+            let n = [0, 2, 1][e.length % 3]
+            let t = e.charCodeAt(0) << 16 | (e.length > 1 ? e.charCodeAt(1) : 0) << 8 | (e.length > 2 ? e.charCodeAt(2) : 0)
+            let o = [u.charAt(t >>> 18), u.charAt(t >>> 12 & 63), n >= 2 ? "=" : u.charAt(t >>> 6 & 63), n >= 1 ? "=" : u.charAt(63 & t)]
+            return o.join("")
         }
 
         function h(e) {
-            return e.replace(/[\s\S]{1,3}/g, m);
+            return e.replace(/[\s\S]{1,3}/g, m)
         }
 
         function p() {
-            return h(g((new Date()).getTime()));
+            return h(g((new Date()).getTime()))
         }
 
         function w(e, n) {
-            return n ? p(String(e)).replace(/[+\/]/g, function (e) {
-                return "+" == e ? "-" : "_";
-            }).replace(/=/g, "") : p(String(e));
+            return n ? p(String(e)).replace(/[+\/]/g, (e) => {
+                return "+" == e ? "-" : "_"
+            }).replace(/=/g, "") : p(String(e))
         }
 
-        return w(getCookie(name));
+        return w(getCookie(name))
     }
 
+    function rpcSetting() {
+        let dom = ''
+        dom += '<div class="flex-center-between"><label for="rpcDomain" style="margin-right: 5px;flex: 0 0 100px;">主机：</label><input type="text" id="rpcDomain" value="' + ariaRPC.domain + '" class="swal2-input" placeholder="http://localhost"></div>'
+        dom += '<div class="flex-center-between"><label for="rpcPort" style="margin-right: 5px;flex: 0 0 100px;">端口：</label><input type="text" id="rpcPort" value="' + ariaRPC.port + '" class="swal2-input" placeholder="6800"></div>'
+        dom += '<div class="flex-center-between"><label for="rpcToken" style="margin-right: 5px;flex: 0 0 100px;">密钥：</label><input type="text" id="rpcToken" value="' + ariaRPC.token + '" class="swal2-input" placeholder="没有留空"></div>'
+        dom += '<div class="flex-center-between"><label for="rpcDir" style="margin-right: 5px;flex: 0 0 100px;">下载路径：</label><input type="text" id="rpcDir" value="' + ariaRPC.dir + '" class="swal2-input" placeholder="默认为D:\"></div>'
+        dom = '<div>' + dom + '</div>'
+        let $dom = $(dom)
+
+        Swal.fire({
+              title: 'RPC配置',
+              allowOutsideClick: false,
+              html: $dom[0],
+              showCancelButton: true,
+              confirmButtonText: '保存',
+              cancelButtonText: '取消',
+              footer: '不会配置？<a href="https://www.baiduyun.wiki/zh-cn/rpc.html" target="_blank">点我</a>'
+          }
+        ).then((result) => {
+            if (result.value) {
+                ariaRPC.domain = $('#rpcDomain').val()
+                ariaRPC.port = $('#rpcPort').val()
+                ariaRPC.token = $('#rpcToken').val()
+                ariaRPC.dir = $('#rpcDir').val()
+                setValue('rpcDomain', ariaRPC.domain)
+                setValue('rpcPort', ariaRPC.port)
+                setValue('rpcToken', ariaRPC.token)
+                setValue('rpcDir', ariaRPC.dir)
+                Toast.fire({
+                    text: '设置成功',
+                    icon: 'success'
+                })
+            }
+        })
+    }
+
     function Dialog() {
-        let linkList = [];
-        let showParams;
-        let dialog, shadow;
+        let linkList = []
+        let showParams
+        let dialog, shadow
 
         function createDialog() {
-            let screenWidth = document.body.clientWidth;
-            let dialogLeft = screenWidth > 800 ? (screenWidth - 800) / 2 : 0;
-            let $dialog_div = $('<div class="dialog" style="width: 800px; top: 0px; bottom: auto; left: ' + dialogLeft + 'px; right: auto; display: hidden; visibility: visible; z-index: 52;"></div>');
-            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-title" style="display:inline-block;width:740px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis"></span></h3></div>');
-            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close">×</span></div>');
-            let $dialog_body = $('<div class="dialog-body"></div>');
-            let $dialog_tip = $('<div class="dialog-tip"><p></p></div>');
+            let screenWidth = document.body.clientWidth
+            let dialogLeft = screenWidth > 800 ? (screenWidth - 800) / 2 : 0
+            let $dialog_div = $('<div class="dialog" style="width: 800px; top: 0px; bottom: auto; left: ' + dialogLeft + 'px; right: auto; display: hidden; visibility: visible; z-index: 52;"></div>')
+            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-title" style="display:inline-block;width:740px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis"></span></h3></div>')
+            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close">×</span></div>')
+            let $dialog_body = $('<div class="dialog-body"></div>')
+            let $dialog_tip = $('<div class="dialog-tip"><p></p></div>')
 
-            $dialog_div.append($dialog_header.append($dialog_control)).append($dialog_body);
+            $dialog_div.append($dialog_header.append($dialog_control)).append($dialog_body)
 
-            let $dialog_button = $('<div class="dialog-button" style="display:none"></div>');
-            let $dialog_button_div = $('<div style="display:table;margin:auto"></div>');
-            let $dialog_copy_button = $('<button id="dialog-copy-button">复制全部默认链接</button>');
-            let $dialog_edit_button = $('<button id="dialog-edit-button" style="display:none">编辑</button>');
-            let $dialog_exit_button = $('<button id="dialog-exit-button" style="display:none">退出</button>');
+            let $dialog_button = $('<div class="dialog-button" style="display:none"></div>')
+            let $dialog_button_div = $('<div style="display:table;margin:auto"></div>')
+            let $dialog_copy_button = $('<button id="dialog-copy-button" style="display:none">复制全部默认链接</button>')
+            let $dialog_send_button = $('<button id="dialog-send-button" class="send-all" style="display:none">发送全部</button>')
+            let $dialog_rpc_button = $('<button id="dialog-rpc-button" class="rpc-setting" style="display:none">配置RPC服务</button>')
 
-            $dialog_button_div.append($dialog_copy_button).append($dialog_edit_button).append($dialog_exit_button);
-            $dialog_button.append($dialog_button_div);
-            $dialog_div.append($dialog_button);
+            $dialog_button_div.append($dialog_copy_button).append($dialog_send_button).append($dialog_rpc_button)
+            $dialog_button.append($dialog_button_div)
+            $dialog_div.append($dialog_button)
 
-            $dialog_copy_button.click(function () {
-                let content = '';
-                if (showParams.type == 'batch') {
-                    $.each(linkList, function (index, element) {
-                        if (index == linkList.length - 1)
-                            content += element.downloadlink[0];
+            $dialog_copy_button.click(() => {
+                let content = ''
+                if (showParams.type === 'batch') {
+                    $.each(linkList, (index, element) => {
+                        if (index === linkList.length - 1)
+                            content += element.downloadlink[0]
                         else
-                            content += element.downloadlink[0] + '\r\n';
-                    });
+                            content += element.downloadlink[0] + '\r\n'
+                    })
                 }
-                if (showParams.type == 'batchAria') {
-                    $.each(linkList, function (index, element) {
-                        if (index == linkList.length - 1)
-                            content += decodeURIComponent(aria2c(element.downloadlink[0], element.filename, userAgentDefault));
+                if (showParams.type === 'batchAria') {
+                    $.each(linkList, (index, element) => {
+                        if (index === linkList.length - 1)
+                            content += decodeURIComponent(aria2c(element.dlink, element.filename, userAgent))
                         else
-                            content += decodeURIComponent(aria2c(element.downloadlink[0], element.filename, userAgentDefault) + '\r\n');
-                    });
+                            content += decodeURIComponent(aria2c(element.dlink, element.filename, userAgent) + '\r\n')
+                    })
                 }
-                if (showParams.type == 'rpc') {
-                    $.each(linkList, function (index, element) {
-                        if (element.downloadlink == 'error')
-                            return;
-                        if (index == linkList.length - 1)
-                            content += element.downloadlink;
+                if (showParams.type === 'rpc') {
+                    $.each(linkList, (index, element) => {
+                        if (index === linkList.length - 1)
+                            content += element.downloadlink
                         else
-                            content += element.downloadlink + '\r\n';
-                    });
+                            content += element.downloadlink + '\r\n'
+                    })
                 }
-                if (showParams.type == 'shareLink') {
-                    $.each(linkList, function (index, element) {
+                if (showParams.type === 'shareLink') {
+                    $.each(linkList, (index, element) => {
                         if (element.dlink == 'error')
-                            return;
+                            return
                         if (index == linkList.length - 1)
-                            content += element.dlink;
+                            content += element.dlink
                         else
-                            content += element.dlink + '\r\n';
-                    });
+                            content += element.dlink + '\r\n'
+                    })
                 }
                 if (showParams.type == 'shareAriaLink') {
-                    $.each(linkList, function (index, element) {
+                    $.each(linkList, (index, element) => {
                         if (element.dlink == 'error')
-                            return;
+                            return
                         if (index == linkList.length - 1)
-                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename));
+                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename))
                         else
-                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename) + '\r\n');
-                    });
+                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename) + '\r\n')
+                    })
                 }
-                GM_setClipboard(content, 'text');
+                GM_setClipboard(content, 'text')
                 if (content != '') {
                     Toast.fire({
                         icon: 'success',
                         text: '已将链接复制到剪贴板！'
-                    });
+                    })
 
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: '复制失败，请手动复制！'
-                    });
+                    })
                 }
-            });
+            })
 
-            $dialog_edit_button.click(function () {
-                let $dialog_textarea = $('div.dialog-body textarea[name=dialog-textarea]', dialog);
-                let $dialog_item = $('div.dialog-body div', dialog);
-                $dialog_item.hide();
-                $dialog_copy_button.hide();
-                $dialog_edit_button.hide();
-                $dialog_textarea.show();
-                $dialog_radio_div.show();
-                $dialog_exit_button.show();
-            });
-
-            $dialog_exit_button.click(function () {
-                let $dialog_textarea = $('div.dialog-body textarea[name=dialog-textarea]', dialog);
-                let $dialog_item = $('div.dialog-body div', dialog);
-                $dialog_textarea.hide();
-                $dialog_radio_div.hide();
-                $dialog_item.show();
-                $dialog_exit_button.hide();
-                $dialog_copy_button.show();
-                $dialog_edit_button.show();
-            });
-
-            $dialog_div.append($dialog_tip);
-            $('body').append($dialog_div);
-            $dialog_control.click(dialogControl);
-            return $dialog_div;
+            $dialog_div.append($dialog_tip)
+            $('body').append($dialog_div)
+            $dialog_control.click(dialogControl)
+            return $dialog_div
         }
 
         function createShadow() {
-            let $shadow = $('<div class="dialog-shadow" style="position: fixed; left: 0px; top: 0px; z-index: 50; background: rgb(0, 0, 0) none repeat scroll 0% 0%; opacity: 0.5; width: 100%; height: 100%; display: none;"></div>');
-            $('body').append($shadow);
-            return $shadow;
+            let $shadow = $('<div class="dialog-shadow" style="position: fixed; left: 0px; top: 0px; z-index: 50; background: rgb(0, 0, 0) none repeat scroll 0% 0%; opacity: 0.5; width: 100%; height: 100%; display: none;"></div>')
+            $('body').append($shadow)
+            return $shadow
         }
 
-        this.open = function (params) {
-            showParams = params;
-            linkList = [];
+        this.open = (params) => {
+            showParams = params
+            linkList = []
             if (params.type == 'link') {
-                linkList = params.list.urls;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title + "：" + params.list.filename);
-                $.each(params.list.urls, function (index, element) {
-                    element.url = replaceLink(element.url);
-                    let $div = $('<div><div style="width:30px;float:left">' + element.rank + ':</div><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><a href="' + element.url + '">' + element.url + '</a></div></div>');
+                linkList = params.list.urls
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title + "：" + params.list.filename)
+                $.each(params.list.urls, (index, element) => {
+                    element.url = replaceLink(element.url)
+                    let $div = $('<div><div style="width:30px;float:left">' + element.rank + ':</div><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><a href="' + element.url + '">' + element.url + '</a></div></div>')
 
-                    $('div.dialog-body', dialog).append($div);
-                });
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
 
             //批量下载 - 我的网盘
-            if (params.type == 'batch' || params.type == 'batchAria' || params.type == 'batchAriaRPC') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.filename + '">' + element.filename + '</div><span>：</span></div>');
-                    if (params.type == 'batch') {  //API
-                        $.each(element.downloadlink, function (i, e) {
+            if (params.type === 'batch' || params.type === 'batchAria' || params.type === 'batchAriaRPC' || params.type === 'pcs') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.filename + '">' + element.filename + '</div><span>：</span></div>')
+                    if (params.type === 'batch') {  //API
+                        $.each(element.downloadlink, (i, e) => {
                             if (i === 0) {
-                                $div.append($('<a class="ui-link api-link" href="' + e + '" data-link=' + e + '>默认链接</a>'));
+                                $div.append($('<a class="ui-link api-link" href="' + e + '" data-link=' + e + '>默认链接</a>'))
                             } else {
                                 if (getValue('SETTING_B'))
-                                    $div.append($('<a class="ui-link api-link" href="' + e + '"  data-link=' + e + '>备用链接' + number[i] + '</a>'));
+                                    $div.append($('<a class="ui-link api-link" href="' + e + '"  data-link=' + e + '>备用链接' + number[i] + '</a>'))
                             }
-                        });
+                        })
                     }
-                    if (params.type == 'batchAria') {  //Aria下载
-                        $.each(element.downloadlink, function (i, e) {
-                            let link = aria2c(e, element.filename, userAgentDefault);
-                            if (i === 0) {
-                                $div.append($('<a class="ui-link aria-link" data-link=' + link + ' href="javascript:;">默认链接</a>'));
-                            } else {
-                                if (getValue('SETTING_B'))
-                                    $div.append($('<a class="ui-link aria-link" data-link=' + link + ' href="javascript:;">备用链接' + number[i] + '</a>'));
-                            }
-                        });
+                    if (params.type === 'pcs') {  //PCS
+                        $div.append($('<a class="ui-link pcs-link" data-filename=' + element.filename + ' data-link=' + element.dlink + ' href="javascript:;">' + element.dlink + '</a>'))
                     }
-                    if (params.type == 'batchAriaRPC') {
-                        $.each(element.downloadlink, function (i, e) {
-                            if (i === 0) {
-                                $div.append($('<a href="javascript:;" class="ui-link aria-rpc" data-link="' + e + '" data-filename="' + element.filename + '">发送默认</a>'));
-                            } else {
-                                if (getValue('SETTING_B'))
-                                    $div.append($('<a href="javascript:;" class="ui-link aria-rpc" data-link="' + e + '" data-filename="' + element.filename + '">发送备用' + number[i] + '</a>'));
-                            }
-                        });
+                    if (params.type === 'batchAria') {  //Aria下载
+                        let link = decodeURIComponent(aria2c(element.dlink, element.filename, userAgent))
+                        $div.append($('<a class="ui-link aria-link" href="javascript:;">' + link + '</a>'))
                     }
-                    $('div.dialog-body', dialog).append($div);
-                });
+                    if (params.type === 'batchAriaRPC') {
+                        $div.append($('<button class="aria-rpc" data-link="' + element.dlink + '" data-filename="' + element.filename + '">点击发送到Aria下载器</button>'))
+                    }
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
-            if (params.type == 'shareLink') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    element.dlink = replaceLink(element.dlink);
-                    if (element.isdir == 1) return;
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="' + element.dlink + '" class="share-download">' + element.dlink + '</a></div>');
-                    $('div.dialog-body', dialog).append($div);
-                });
+            if (params.type === 'shareLink') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    element.dlink = replaceLink(element.dlink)
+                    if (element.isdir == 1) return
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="' + element.dlink + '" class="share-download">' + element.dlink + '</a></div>')
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
-            if (params.type == 'rpcLink') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    element.dlink = replaceLink(element.dlink);
-                    if (element.isdir == 1) return;
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><button class="aria-rpc" data-link="' + element.dlink + '" data-filename="' + element.server_filename + '">点击发送到Aria</button></div>');
-                    $('div.dialog-body', dialog).append($div);
-                });
+            if (params.type === 'rpcLink') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    element.dlink = replaceLink(element.dlink)
+                    if (element.isdir == 1) return
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><button class="aria-rpc" data-link="' + element.dlink + '" data-filename="' + element.server_filename + '">点击发送到Aria下载器</button></div>')
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
-            if (params.type == 'shareAriaLink') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    if (element.isdir == 1) return;
-                    let link = decodeURIComponent(aria2c(element.dlink, element.server_filename));
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="javasctipt:void(0)" class="aria-link">' + link + '</a></div>');
-                    $('div.dialog-body', dialog).append($div);
-                });
+            if (params.type === 'shareAriaLink') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    if (element.isdir == 1) return
+                    let link = decodeURIComponent(aria2c(element.dlink, element.server_filename))
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="javasctipt:void(0)" class="aria-link">' + link + '</a></div>')
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
 
             if (params.tip) {
-                $('div.dialog-tip p', dialog).html(params.tip);
+                $('div.dialog-tip p', dialog).html(params.tip)
             }
 
             if (params.showcopy) {
-                $('div.dialog-button', dialog).show();
-                $('div.dialog-button button#dialog-copy-button', dialog).show();
+                $('div.dialog-button', dialog).show()
+                $('div.dialog-button #dialog-copy-button', dialog).show()
             }
-            shadow.show();
-            dialog.show();
-        };
 
-        this.close = function () {
-            dialogControl();
-        };
+            if (params.showrpc){
+                $('div.dialog-button', dialog).show()
+                $('div.dialog-button #dialog-send-button', dialog).show()
+                $('div.dialog-button #dialog-rpc-button', dialog).show()
+            }
 
+            shadow.show()
+            dialog.show()
+        }
+
+        this.close = () => {
+            dialogControl()
+        }
+
         function dialogControl() {
-            $('div.dialog-body', dialog).children().remove();
-            $('div.dialog-header h3 span.dialog-title', dialog).text('');
-            $('div.dialog-tip p', dialog).text('');
-            $('div.dialog-button', dialog).hide();
-            $('div.dialog-radio input[type=radio][name=showmode][value=multi]', dialog).prop('checked', true);
-            $('div.dialog-radio', dialog).hide();
-            $('div.dialog-button button#dialog-copy-button', dialog).hide();
-            $('div.dialog-button button#dialog-edit-button', dialog).hide();
-            $('div.dialog-button button#dialog-exit-button', dialog).hide();
-            dialog.hide();
-            shadow.hide();
+            $('div.dialog-body', dialog).children().remove()
+            $('div.dialog-header h3 span.dialog-title', dialog).text('')
+            $('div.dialog-tip p', dialog).text('')
+            $('div.dialog-button', dialog).hide()
+            $('div.dialog-button button#dialog-copy-button', dialog).hide()
+            $('div.dialog-button button#dialog-send-button', dialog).hide()
+            $('div.dialog-button button#dialog-rpc-button', dialog).hide()
+            dialog.hide()
+            shadow.hide()
         }
 
-        dialog = createDialog();
-        shadow = createShadow();
+        dialog = createDialog()
+        shadow = createShadow()
     }
 
     function VCodeDialog(refreshVCode, confirmClick) {
-        let dialog, shadow;
+        let dialog, shadow
 
         function createDialog() {
-            let screenWidth = document.body.clientWidth;
-            let dialogLeft = screenWidth > 520 ? (screenWidth - 520) / 2 : 0;
-            let $dialog_div = $('<div class="dialog" id="dialog-vcode" style="width:520px;top:0px;bottom:auto;left:' + dialogLeft + 'px;right:auto;display:none;visibility:visible;z-index:52"></div>');
-            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-header-title"><em class="select-text">提示</em></span></h3></div>');
-            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">x</span></span></div>');
-            let $dialog_body = $('<div class="dialog-body"></div>');
-            let $dialog_body_div = $('<div style="text-align:center;padding:22px"></div>');
-            let $dialog_body_download_verify = $('<div class="download-verify" style="margin-top:10px;padding:0 28px;text-align:left;font-size:12px;"></div>');
-            let $dialog_verify_body = $('<div class="verify-body">请输入验证码：</div>');
-            let $dialog_input = $('<input id="dialog-input" type="text" style="padding:3px;width:85px;height:23px;border:1px solid #c6c6c6;background-color:white;vertical-align:middle;" class="input-code" maxlength="4">');
-            let $dialog_img = $('<img id="dialog-img" class="img-code" style="margin-left:10px;vertical-align:middle;" alt="点击换一张" src="" width="100" height="30">');
-            let $dialog_refresh = $('<a href="javascript:;" style="text-decoration:underline;" class="underline">换一张</a>');
-            let $dialog_err = $('<div id="dialog-err" style="padding-left:84px;height:18px;color:#d80000" class="verify-error"></div>');
-            let $dialog_footer = $('<div class="dialog-footer g-clearfix"></div>');
-            let $dialog_confirm_button = $('<a class="g-button g-button-blue" data-button-id="" data-button-index href="javascript:;" style="padding-left:36px"><span class="g-button-right" style="padding-right:36px;"><span class="text" style="width:auto;">确定</span></span></a>');
-            let $dialog_cancel_button = $('<a class="g-button" data-button-id="" data-button-index href="javascript:;" style="padding-left: 36px;"><span class="g-button-right" style="padding-right: 36px;"><span class="text" style="width: auto;">取消</span></span></a>');
+            let screenWidth = document.body.clientWidth
+            let dialogLeft = screenWidth > 520 ? (screenWidth - 520) / 2 : 0
+            let $dialog_div = $('<div class="dialog" id="dialog-vcode" style="width:520px;top:0px;bottom:auto;left:' + dialogLeft + 'px;right:auto;display:none;visibility:visible;z-index:52"></div>')
+            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-header-title"><em class="select-text">提示</em></span></h3></div>')
+            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">x</span></span></div>')
+            let $dialog_body = $('<div class="dialog-body"></div>')
+            let $dialog_body_div = $('<div style="text-align:center;padding:22px"></div>')
+            let $dialog_body_download_verify = $('<div class="download-verify" style="margin-top:10px;padding:0 28px;text-align:left;font-size:12px;"></div>')
+            let $dialog_verify_body = $('<div class="verify-body">请输入验证码：</div>')
+            let $dialog_input = $('<input id="dialog-input" type="text" style="padding:3px;width:85px;height:23px;border:1px solid #c6c6c6;background-color:white;vertical-align:middle;" class="input-code" maxlength="4">')
+            let $dialog_img = $('<img id="dialog-img" class="img-code" style="margin-left:10px;vertical-align:middle;" alt="点击换一张" src="" width="100" height="30">')
+            let $dialog_refresh = $('<a href="javascript:;" style="text-decoration:underline;" class="underline">换一张</a>')
+            let $dialog_err = $('<div id="dialog-err" style="padding-left:84px;height:18px;color:#d80000" class="verify-error"></div>')
+            let $dialog_footer = $('<div class="dialog-footer g-clearfix"></div>')
+            let $dialog_confirm_button = $('<a class="g-button g-button-blue" data-button-id="" data-button-index href="javascript:;" style="padding-left:36px"><span class="g-button-right" style="padding-right:36px;"><span class="text" style="width:auto;">确定</span></span></a>')
+            let $dialog_cancel_button = $('<a class="g-button" data-button-id="" data-button-index href="javascript:;" style="padding-left: 36px;"><span class="g-button-right" style="padding-right: 36px;"><span class="text" style="width: auto;">取消</span></span></a>')
 
-            $dialog_header.append($dialog_control);
-            $dialog_verify_body.append($dialog_input).append($dialog_img).append($dialog_refresh);
-            $dialog_body_download_verify.append($dialog_verify_body).append($dialog_err);
-            $dialog_body_div.append($dialog_body_download_verify);
-            $dialog_body.append($dialog_body_div);
-            $dialog_footer.append($dialog_confirm_button).append($dialog_cancel_button);
-            $dialog_div.append($dialog_header).append($dialog_body).append($dialog_footer);
-            $('body').append($dialog_div);
+            $dialog_header.append($dialog_control)
+            $dialog_verify_body.append($dialog_input).append($dialog_img).append($dialog_refresh)
+            $dialog_body_download_verify.append($dialog_verify_body).append($dialog_err)
+            $dialog_body_div.append($dialog_body_download_verify)
+            $dialog_body.append($dialog_body_div)
+            $dialog_footer.append($dialog_confirm_button).append($dialog_cancel_button)
+            $dialog_div.append($dialog_header).append($dialog_body).append($dialog_footer)
+            $('body').append($dialog_div)
 
-            $dialog_control.click(dialogControl);
-            $dialog_img.click(refreshVCode);
-            $dialog_refresh.click(refreshVCode);
-            $dialog_input.keypress(function (event) {
+            $dialog_control.click(dialogControl)
+            $dialog_img.click(refreshVCode)
+            $dialog_refresh.click(refreshVCode)
+            $dialog_input.keypress((event) => {
                 if (event.which == 13)
-                    confirmClick();
-            });
-            $dialog_confirm_button.click(confirmClick);
-            $dialog_cancel_button.click(dialogControl);
-            $dialog_input.click(function () {
-                $('#dialog-err').text('');
-            });
-            return $dialog_div;
+                    confirmClick()
+            })
+            $dialog_confirm_button.click(confirmClick)
+            $dialog_cancel_button.click(dialogControl)
+            $dialog_input.click(() => {
+                $('#dialog-err').text('')
+            })
+            return $dialog_div
         }
 
-        this.open = function (vcode) {
+        this.open = (vcode) => {
             if (vcode)
-                $('#dialog-img').attr('src', vcode.img);
-            dialog.show();
-            shadow.show();
-        };
-        this.close = function () {
-            dialogControl();
-        };
-        dialog = createDialog();
-        shadow = $('div.dialog-shadow');
+                $('#dialog-img').attr('src', vcode.img)
+            dialog.show()
+            shadow.show()
+        }
+        this.close = () => {
+            dialogControl()
+        }
+        dialog = createDialog()
+        shadow = $('div.dialog-shadow')
 
         function dialogControl() {
-            $('#dialog-img', dialog).attr('src', '');
-            $('#dialog-err').text('');
-            dialog.hide();
-            shadow.hide();
+            $('#dialog-img', dialog).attr('src', '')
+            $('#dialog-err').text('')
+            dialog.hide()
+            shadow.hide()
         }
     }
 
     //网盘页面的下载助手
     function PanHelper() {
-        let yunData, sign, timestamp, bdstoken, logid, fid_list;
-        let fileList = [], selectFileList = [], batchLinkList = [], batchLinkListAll = [], linkList = [];
-        let dialog, searchKey;
-        let panAPIUrl = location.protocol + "//" + location.host + "/api/";
-        let restAPIUrl = location.protocol + "//pcs.baidu.com/rest/2.0/pcs/";
-        let clientAPIUrl = location.protocol + "//d.pcs.baidu.com/rest/2.0/pcs/";
+        let yunData, sign, timestamp, bdstoken, logid, fid_list
+        let fileList = [], selectFileList = [], batchLinkList = [], batchLinkListAll = [], linkList = []
+        let dialog, searchKey
+        let panAPIUrl = location.protocol + "//" + location.host + "/api/"
+        let restAPIUrl = location.protocol + "//pcs.baidu.com/rest/2.0/pcs/"
+        let clientAPIUrl = location.protocol + "//pan.baidu.com/rest/2.0/"
 
-        this.init = function () {
-            yunData = unsafeWindow.yunData;
-            clog('初始化信息:', yunData);
+        this.init = () => {
+            yunData = unsafeWindow.yunData
+            clog('初始化信息:', yunData)
             if (yunData === undefined) {
-                clog('页面未正常加载，或者百度已经更新！');
-                return false;
+                clog('页面未正常加载，或者百度已经更新！')
+                return false
             }
-            initVar();
-            registerEventListener();
-            addButton();
-            createIframe();
-            dialog = new Dialog({addCopy: true});
-            clog('下载助手加载成功！当前版本：', version);
-        };
+            initVar()
+            registerEventListener()
+            addButton()
+            createIframe()
+            dialog = new Dialog({addCopy: true})
+            clog('下载助手加载成功！当前版本：', version)
+        }
 
         //获取选中文件
         function getSelectedFile() {
-            return require("disk-system:widget/pageModule/list/listInit.js").getCheckedItems();
+            return require("disk-system:widget/pageModule/list/listInit.js").getCheckedItems()
         }
 
         //初始化变量
         function initVar() {
-            sign = getSign();
-            timestamp = yunData.timestamp;
-            bdstoken = yunData.MYBDSTOKEN;
-            logid = getLogID();
+            sign = getSign()
+            timestamp = yunData.timestamp
+            bdstoken = yunData.MYBDSTOKEN
+            logid = getLogID()
         }
 
         function registerEventListener() {
-            registerDownload();
-        }
-
-        //下载事件
-        function registerDownload() {
-            $(document).on('click', '.api-link', function (e) {
-                e.preventDefault();
+            $(document).on('click', '.api-link', (e) => {
+                e.preventDefault()
                 if (e.target.dataset.link) {
-                    execDownload(e.target.dataset.link);
+                    execDownload(e.target.dataset.link)
                 }
-            });
-            $(document).on('click', '.aria-rpc', function (e) {
-                let link = e.target.dataset.link;
-                let filename = e.target.dataset.filename;
-                let headers = {};
-                if (!isSuperVIP()) {  //普通用户需要设置userAgentDefault为空
-                    headers = {
-                        "User-Agent": userAgent
-                    };
+            })
+            $(document).on('click', '.aria-rpc', (e) => {
+                $(e.target).addClass('clicked')
+                let link = e.target.dataset.link
+                let filename = e.target.dataset.filename
+
+                let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc'
+                let json_rpc = {
+                    id: new Date().getTime(),
+                    jsonrpc: '2.0',
+                    method: 'aria2.addUri',
+                    params: [
+                        "token:" + ariaRPC.token,
+                        [link],
+                        {
+                            dir: ariaRPC.dir,
+                            out: filename,
+                            header: ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
+                        }
+                    ]
                 }
 
                 GM_xmlhttpRequest({
-                    method: "HEAD",
-                    headers: headers,
-                    url: e.target.dataset.link,
-                    onload: function (res) {
-                        let finalUrl = res.finalUrl;
-                        if (finalUrl) {
-                            let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc';
-                            let json_rpc = {
-                                id: new Date().getTime(),
-                                jsonrpc: '2.0',
-                                method: 'aria2.addUri',
-                                params: [
-                                    "token:" + ariaRPC.token,
-                                    [finalUrl],
-                                    {
-                                        dir: ariaRPC.dir,
-                                        out: filename,
-                                        header: isSuperVIP() ? ['User-Agent:' + userAgentDefault, 'Cookie: BDUSS=' + getBDUSS()] : ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
-                                    }
-                                ]
-                            };
-
-                            GM_xmlhttpRequest({
-                                method: "POST",
-                                headers: {
-                                    "User-Agent": userAgent
-                                },
-                                url: url,
-                                responseType: 'json',
-                                timeout: 3000,
-                                data: JSON.stringify(json_rpc),
-                                onload: function (response) {
-                                    if (response.response.result) {
-                                        Toast.fire({
-                                            icon: 'success',
-                                            title: '任务已发送至RPC下载器'
-                                        });
-                                    } else {
-                                        Toast.fire({
-                                            icon: 'error',
-                                            title: response.response.message
-                                        });
-                                    }
-                                },
-                                ontimeout: function () {
-                                    Toast.fire({
-                                        icon: 'error',
-                                        title: '无法连接到RPC服务，请检查RPC配置'
-                                    });
-                                }
-                            });
+                    method: "POST",
+                    headers: {"User-Agent": userAgent},
+                    url: url,
+                    responseType: 'json',
+                    timeout: 3000,
+                    data: JSON.stringify(json_rpc),
+                    onload: (response) => {
+                        if (response.response.result) {
+                            Toast.fire({
+                                icon: 'success',
+                                title: '任务已发送至RPC下载器'
+                            })
+                        } else {
+                            Toast.fire({
+                                icon: 'error',
+                                title: response.response.message
+                            })
                         }
                     },
-                });
-            });
+                    ontimeout: () => {
+                        Toast.fire({
+                            icon: 'error',
+                            title: '连接到RPC服务器超时，请检查RPC配置'
+                        })
+                    }
+                })
+            })
+            $(document).on('click','.rpc-setting',(e)=>{
+                rpcSetting()
+            })
+            $(document).on('click','.send-all',(e)=>{
+                $('.aria-rpc').click()
+                $('.dialog').hide()
+                $('.dialog-shadow').hide()
+            })
         }
 
         //我的网盘 - 添加助手按钮
         function addButton() {
-            $('div.' + classMap['bar-search']).css('width', '18%');
-            let $dropdownbutton = $('<span class="g-dropdown-button"></span>');
-            let $dropdownbutton_a = $('<a class="g-button g-button-blue" href="javascript:;"><span class="g-button-right"><em class="icon icon-picpre-download" title="百度网盘下载助手"></em><span class="text" style="width: 60px;">下载助手</span></span></a>');
-            let $dropdownbutton_span = $('<span class="menu" style="width:114px"></span>');
+            $('div.' + classMap['bar-search']).css('width', '18%')
+            let $dropdownbutton = $('<span class="g-dropdown-button"></span>')
+            let $dropdownbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><em class="icon icon-download"></em><span class="text" style="width: 60px;">下载助手</span></span></a>')
+            let $dropdownbutton_span = $('<span class="menu" style="width:114px"></span>')
 
-            let $directbutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $directbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $directbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">直链下载</span></span></a>');
-            let $directbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>');
-            let $directbutton_batchhttplink_button = $('<a id="batchhttplink-direct" class="g-button-menu" href="javascript:;">显示链接</a>');
-            $directbutton_menu.append($directbutton_batchhttplink_button);
-            $directbutton.append($directbutton_span.append($directbutton_a).append($directbutton_menu));
-            $directbutton.hover(function () {
-                $directbutton_span.toggleClass('button-open');
-            });
-            $directbutton_batchhttplink_button.click(batchClick);
+            let $directbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $directbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $directbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">直链下载</span></span></a>')
+            let $directbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $directbutton_batchhttplink_button = $('<a id="batchhttplink-direct" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $directbutton_menu.append($directbutton_batchhttplink_button)
+            $directbutton.append($directbutton_span.append($directbutton_a).append($directbutton_menu))
+            $directbutton.hover(() => {
+                $directbutton_span.toggleClass('button-open')
+            })
+            $directbutton_batchhttplink_button.click(batchClick)
 
-            let $ariadirectbutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $ariadirectbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $ariadirectbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">Aria下载</span></span></a>');
-            let $ariadirectbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>');
-            let $ariadirectbutton_batchhttplink_button = $('<a id="batchhttplink-aria" class="g-button-menu" href="javascript:;">显示链接</a>');
-            $ariadirectbutton_menu.append($ariadirectbutton_batchhttplink_button);
-            $ariadirectbutton.append($ariadirectbutton_span.append($ariadirectbutton_a).append($ariadirectbutton_menu));
-            $ariadirectbutton.hover(function () {
-                $ariadirectbutton_span.toggleClass('button-open');
-            });
-            $ariadirectbutton_batchhttplink_button.click(batchClick);
+            let $pcsbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $pcsbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $pcsbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">API下载</span></span></a>')
+            let $pcsbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $pcsbutton_batchhttplink_button = $('<a id="batchhttplink-pcs" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $pcsbutton_menu.append($pcsbutton_batchhttplink_button)
+            $pcsbutton.append($pcsbutton_span.append($pcsbutton_a).append($pcsbutton_menu))
+            $pcsbutton.hover(() => {
+                $pcsbutton_span.toggleClass('button-open')
+            })
+            $pcsbutton_batchhttplink_button.click(batchClick)
 
-            let $ariarpcbutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $ariarpcbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $ariarpcbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">RPC下载</span></span></a>');
-            let $ariarpcbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>');
-            let $ariarpcbutton_batchhttplink_button = $('<a id="batchhttplink-rpc" class="g-button-menu" href="javascript:;">显示链接</a>');
-            let $ariarpcbutton_setting_button = $('<a class="g-button-menu" href="javascript:;">RPC配置</a>');
-            $ariarpcbutton_menu.append($ariarpcbutton_batchhttplink_button).append($ariarpcbutton_setting_button);
-            $ariarpcbutton.append($ariarpcbutton_span.append($ariarpcbutton_a).append($ariarpcbutton_menu));
-            $ariarpcbutton.hover(function () {
-                $ariarpcbutton_span.toggleClass('button-open');
-            });
-            $ariarpcbutton_batchhttplink_button.click(batchClick);
-            $ariarpcbutton_setting_button.click(rpcSetting);
+            let $ariadirectbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $ariadirectbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $ariadirectbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">Aria下载</span></span></a>')
+            let $ariadirectbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $ariadirectbutton_batchhttplink_button = $('<a id="batchhttplink-aria" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $ariadirectbutton_menu.append($ariadirectbutton_batchhttplink_button)
+            $ariadirectbutton.append($ariadirectbutton_span.append($ariadirectbutton_a).append($ariadirectbutton_menu))
+            $ariadirectbutton.hover(() => {
+                $ariadirectbutton_span.toggleClass('button-open')
+            })
+            $ariadirectbutton_batchhttplink_button.click(batchClick)
 
-            let $apibutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $apibutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $apibutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">API下载</span></span></a>');
-            let $apibutton_menu = $('<span class="menu" style="width:120px;left:77px"></span>');
-            let $apibutton_download_button = $('<a id="download-api" class="g-button-menu" href="javascript:;">直接下载</a>');
-            let $apibutton_batchhttplink_button = $('<a id="batchhttplink-api" class="g-button-menu" href="javascript:;">显示链接</a>');
-            let $setting_button = $('<a id="appid-setting" class="g-button-menu" href="javascript:;">神秘代码</a>');
-            let $default_setting = $('<a id="default-setting" class="g-button-menu" href="javascript:;" style="color: #999;">恢复默认</a>');
-            $apibutton_menu.append($apibutton_download_button).append($apibutton_batchhttplink_button)/*.append($setting_button).append($default_setting)*/;
-            let $versionButton = $('<a style="color: #e85653;font-weight: 700;" class="g-button-menu" href="javascript:;">Ver ' + version + '</a>');
+            let $ariarpcbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $ariarpcbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $ariarpcbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">RPC下载</span></span></a>')
+            let $ariarpcbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $ariarpcbutton_batchhttplink_button = $('<a id="batchhttplink-rpc" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $ariarpcbutton_menu.append($ariarpcbutton_batchhttplink_button)
+            $ariarpcbutton.append($ariarpcbutton_span.append($ariarpcbutton_a).append($ariarpcbutton_menu))
+            $ariarpcbutton.hover(() => {
+                $ariarpcbutton_span.toggleClass('button-open')
+            })
+            $ariarpcbutton_batchhttplink_button.click(batchClick)
 
-            $apibutton.append($apibutton_span.append($apibutton_a).append($apibutton_menu));
-            $apibutton.hover(function () {
-                $apibutton_span.toggleClass('button-open');
-            });
-            $apibutton_download_button.click(downloadClick);
-            $apibutton_batchhttplink_button.click(batchClick);
-            $setting_button.click(setSecretCode);
-            $default_setting.click(defaultSetting);
-            $versionButton.click(versionButtonClick);
-            $dropdownbutton_span.append($apibutton)/*.append($directbutton)*/.append($ariadirectbutton).append($ariarpcbutton).append($versionButton);
-            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span);
-            $dropdownbutton.hover(function () {
-                $dropdownbutton.toggleClass('button-open');
-            });
+            let $versionButton = $('<a style="color: #F24C43;" class="g-button-menu" target="_blank" href="https://www.baiduyun.wiki/install.html">发现新版本</a>');
 
-            $('.' + classMap['list-tools']).append($dropdownbutton);
-            $('.' + classMap['list-tools']).css('height', '40px');
-        }
+            $dropdownbutton_span.append($pcsbutton).append($ariadirectbutton).append($ariarpcbutton)
+            if (getValue('up')) {
+              $dropdownbutton_span.append($versionButton)
+            }
 
-        function rpcSetting() {
-            let dom = '';
-            dom += '<div class="flex-center-between"><label for="rpcDomain" style="margin-right: 5px;flex: 0 0 100px;">主机：</label><input type="text" id="rpcDomain" value="' + ariaRPC.domain + '" class="swal2-input" placeholder="http://localhost"></div>';
-            dom += '<div class="flex-center-between"><label for="rpcPort" style="margin-right: 5px;flex: 0 0 100px;">端口：</label><input type="text" id="rpcPort" value="' + ariaRPC.port + '" class="swal2-input" placeholder="6800"></div>';
-            dom += '<div class="flex-center-between"><label for="rpcToken" style="margin-right: 5px;flex: 0 0 100px;">密钥：</label><input type="text" id="rpcToken" value="' + ariaRPC.token + '" class="swal2-input" placeholder="没有留空"></div>';
-            dom += '<div class="flex-center-between"><label for="rpcDir" style="margin-right: 5px;flex: 0 0 100px;">下载路径：</label><input type="text" id="rpcDir" value="' + ariaRPC.dir + '" class="swal2-input" placeholder="默认为D:\"></div>';
-            dom = '<div>' + dom + '</div>';
-            let $dom = $(dom);
+            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span)
+            $dropdownbutton.hover(() => {
+                $dropdownbutton.toggleClass('button-open')
+            })
 
-            Swal.fire({
-                    title: 'RPC配置',
-                    allowOutsideClick: false,
-                    html: $dom[0],
-                    showCancelButton: true,
-                    confirmButtonText: '保存',
-                    cancelButtonText: '取消'
-                }
-            ).then((result) => {
-                if (result.value) {
-                    setValue('rpcDomain', $('#rpcDomain').val() ? $('#rpcDomain').val() : ariaRPC.domain);
-                    setValue('rpcPort', $('#rpcPort').val() ? $('#rpcPort').val() : ariaRPC.port);
-                    setValue('rpcToken', $('#rpcToken').val());
-                    setValue('rpcDir', $('#rpcDir').val() ? $('#rpcDir').val() : ariaRPC.dir);
-                    history.go(0);
-                }
-            });
+            $('.' + classMap['list-tools']).append($dropdownbutton)
+            $('.' + classMap['list-tools']).css('height', '40px')
         }
 
-        //设置神秘代码
-        function setSecretCode() {
-            Swal.fire({
-                title: '请输入神秘代码',
-                input: 'text',
-                inputValue: secretCode,
-                showCancelButton: true,
-                confirmButtonText: '确定',
-                cancelButtonText: '取消',
-                inputValidator: (value) => {
-                    if (value.length != 6) {
-                        return '请输入正确的神秘代码';
-                    }
-                }
-            }).then((result) => {
-                setValue('secretCodeV', result.value);
-                Toast.fire({
-                    icon: 'success',
-                    text: '神秘代码执行成功，3s后将自动刷新！'
-                }).then(() => {
-                    history.go(0);
-                });
-            });
-        }
-
-        function defaultSetting() {
-            setValue('secretCodeV', defaultCode);
-            Toast.fire({
-                text: '恢复默认成功，3s后将自动刷新',
-                icon: 'success'
-            }).then(() => {
-                history.go(0);
-            });
-        }
-
         function isSuperVIP() {
-            return yunData.ISSVIP === 1;
+            return yunData.ISSVIP === 1
         }
 
-        function versionButtonClick() {
-            let url = 'https://www.baiduyun.wiki';
-            GM_openInTab(url, {active: true});
-        }
-
         // 我的网盘 - 下载
         function downloadClick(event) {
-            selectFileList = getSelectedFile();
-            clog('选中文件列表：', selectFileList);
-            let id = event.target.id;
-            let downloadLink;
+            selectFileList = getSelectedFile()
+            clog('选中文件列表：', selectFileList)
+            let id = event.target.id
+            let downloadLink
 
             if (id == 'download-direct') {
-                let downloadType;
+                let downloadType
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 }
                 if (selectFileList.length == 1) {
-                    selectFileList[0].isdir === 1 ? downloadType = 'batch' : downloadType = 'dlink';
+                    selectFileList[0].isdir === 1 ? downloadType = 'batch' : downloadType = 'dlink'
                 }
                 if (selectFileList.length > 1) {
-                    downloadType = 'batch';
+                    downloadType = 'batch'
                 }
 
-                fid_list = getFidList(selectFileList);
-                let result = getDownloadLinkWithPanAPI(downloadType);
+                fid_list = getFidList(selectFileList)
+                let result = getDownloadLinkWithPanAPI(downloadType)
                 if (result.errno === 0) {
                     if (downloadType == 'dlink')
-                        downloadLink = result.dlink[0].dlink;
+                        downloadLink = result.dlink[0].dlink
                     else if (downloadType == 'batch') {
-                        downloadLink = result.dlink;
+                        downloadLink = result.dlink
                         if (selectFileList.length === 1)
-                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip';
+                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip'
                     } else {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.fail
-                        });
-                        return;
+                        })
+                        return
                     }
                 } else if (result.errno == -1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.deleted
-                    });
-                    return;
+                    })
+                    return
                 } else if (result.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
-                    return;
+                    })
+                    return
                 }
             } else {
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 } else if (selectFileList.length > 1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.morethan
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     if (selectFileList[0].isdir == 1) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.dir
-                        });
-                        return;
+                        })
+                        return
                     }
                 }
                 if (id == 'download-api') {
-                    downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path);
+                    downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path)
                 }
             }
-            execDownload(downloadLink);
+            execDownload(downloadLink)
         }
 
         //我的网盘 - 显示链接
         function linkClick(event) {
-            selectFileList = getSelectedFile();
-            clog('选中文件列表：', selectFileList);
-            let id = event.target.id;
-            let linkList, tip;
+            selectFileList = getSelectedFile()
+            clog('选中文件列表：', selectFileList)
+            let id = event.target.id
+            let linkList, tip
 
             if (id.indexOf('direct') != -1) {
-                let downloadType;
-                let downloadLink;
+                let downloadType
+                let downloadLink
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 } else if (selectFileList.length == 1) {
                     if (selectFileList[0].isdir === 1)
-                        downloadType = 'batch';
+                        downloadType = 'batch'
                     else if (selectFileList[0].isdir === 0)
-                        downloadType = 'dlink';
+                        downloadType = 'dlink'
                 } else if (selectFileList.length > 1) {
-                    downloadType = 'batch';
+                    downloadType = 'batch'
                 }
-                fid_list = getFidList(selectFileList);
-                let result = getDownloadLinkWithPanAPI(downloadType);
+                fid_list = getFidList(selectFileList)
+                let result = getDownloadLinkWithPanAPI(downloadType)
                 if (result.errno === 0) {
                     if (downloadType == 'dlink')
-                        downloadLink = result.dlink[0].dlink;
+                        downloadLink = result.dlink[0].dlink
                     else if (downloadType == 'batch') {
-                        clog('选中文件列表：', selectFileList);
-                        downloadLink = result.dlink;
+                        clog('选中文件列表：', selectFileList)
+                        downloadLink = result.dlink
                         if (selectFileList.length === 1)
-                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip';
+                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip'
                     } else {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.fail
-                        });
-                        return;
+                        })
+                        return
                     }
                 } else if (result.errno == -1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.deleted
-                    });
-                    return;
+                    })
+                    return
                 } else if (result.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
-                    return;
+                    })
+                    return
                 }
-                let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:');
-                let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:');
-                let filename = '';
-                $.each(selectFileList, function (index, element) {
+                let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:')
+                let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:')
+                let filename = ''
+                $.each(selectFileList, (index, element) => {
                     if (selectFileList.length == 1)
-                        filename = element.server_filename;
+                        filename = element.server_filename
                     else {
                         if (index == 0)
-                            filename = element.server_filename;
+                            filename = element.server_filename
                         else
-                            filename = filename + ',' + element.server_filename;
+                            filename = filename + ',' + element.server_filename
                     }
-                });
+                })
                 linkList = {
                     filename: filename,
                     urls: [
                         {url: httplink, rank: 1},
                         {url: httpslink, rank: 2}
                     ]
-                };
-                tip = '显示模拟百度网盘网页获取的链接，可以使用右键迅雷或IDM下载，多文件打包(限300k)下载的链接可以直接复制使用';
-                dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip});
+                }
+                tip = '显示百度网盘网页获取的链接，可以使用右键迅雷或IDM下载，多文件打包(限300k)下载的链接可以直接复制使用'
+                dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip})
             } else {
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 } else if (selectFileList.length > 1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.morethan
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     if (selectFileList[0].isdir == 1) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.dir
-                        });
-                        return;
+                        })
+                        return
                     }
                 }
                 if (id.indexOf('api') != -1) {
-                    let downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path);
-                    let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:');
-                    let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:');
+                    let downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path)
+                    let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:')
+                    let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:')
                     linkList = {
                         filename: selectFileList[0].server_filename,
                         urls: [
                             {url: httplink, rank: 1},
                             {url: httpslink, rank: 2}
                         ]
-                    };
+                    }
 
-                    tip = '显示模拟APP获取的链接(使用百度云ID)，可以右键使用迅雷或IDM下载，直接复制链接无效';
-                    dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip});
+                    tip = '显示获取的链接(使用百度云ID)，可以右键使用迅雷或IDM下载，直接复制链接无效'
+                    dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip})
                 }
             }
         }
 
         // 我的网盘 - 批量下载
         function batchClick(event) {
-            selectFileList = getSelectedFile();
-            clog('选中文件列表：', selectFileList);
+            selectFileList = getSelectedFile()
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return;
+                })
+                return
             }
-            let id = event.target.id;
-            let linkType, tip;
-            linkType = id.indexOf('https') == -1 ? (id.indexOf('http') == -1 ? location.protocol + ':' : 'http:') : 'https:';
-            batchLinkList = [];
-            batchLinkListAll = [];
+            clog('选中文件列表：', selectFileList)
+            let id = event.target.id
+            let linkType, tip
+            linkType = id.indexOf('https') == -1 ? (id.indexOf('http') == -1 ? location.protocol + ':' : 'http:') : 'https:'
+            batchLinkList = []
+            batchLinkListAll = []
             if (id.indexOf('direct') > 0) {  //直链下载
-                batchLinkList = getDirectBatchLink(linkType);
-                let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>，本链接仅支持小文件下载（<300M）';
+                batchLinkList = getPCSBatchLink(linkType)
+                let tip = '点击链接直接下载，若下载失败，请尝试其他方法或参考 <a href="https://www.baiduyun.wiki/zh-cn/question.html">常见问题</a>'
                 if (batchLinkList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 }
-                dialog.open({title: '直链下载', type: 'batch', list: batchLinkList, tip: tip, showcopy: false});
+                dialog.open({title: '直链下载', type: 'batch', list: batchLinkList, tip: tip, showcopy: false})
             }
+            if (id.indexOf('pcs') > 0) {  //PCS下载
+                getPCSBatchLink((batchLinkList) => {
+                    let tip = '点击链接直接下载，若下载失败，请尝试其他方法或参考 <a href="https://www.baiduyun.wiki/zh-cn/question.html">常见问题</a>'
+                    if (batchLinkList.length === 0) {
+                        Toast.fire({
+                            icon: 'error',
+                            text: errorMsg.unselected
+                        })
+                        return
+                    }
+                    dialog.open({title: 'PCS下载', type: 'pcs', list: batchLinkList, tip: tip, showcopy: false})
+                })
+            }
             if (id.indexOf('aria') > 0) {  //ariaAPI下载
-                batchLinkList = getAPIBatchLink(linkType);
-                tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a href="http://pan.baiduyun.wiki/down">XDown</a>';
-                if (batchLinkList.length === 0) {
-                    Toast.fire({
-                        icon: 'error',
-                        text: errorMsg.unselected
-                    });
-                    return;
-                }
-                dialog.open({title: 'Aria链接', type: 'batchAria', list: batchLinkList, tip: tip, showcopy: true});
+                getPCSBatchLink((batchLinkList) => {
+                    tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a href="http://pan.baiduyun.wiki/down">XDown</a>'
+                    if (batchLinkList.length === 0) {
+                        Toast.fire({
+                            icon: 'error',
+                            text: errorMsg.unselected
+                        })
+                        return
+                    }
+                    dialog.open({title: 'Aria链接', type: 'batchAria', list: batchLinkList, tip: tip, showcopy: true})
+                })
             }
             if (id.indexOf('rpc') > 0) {  //ariaAPI下载
-                batchLinkList = getAPIBatchLink(linkType);
-                tip = '点击按钮发送链接至Aria下载器中<a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载，此功能建议配合百度会员使用';
-                if (batchLinkList.length === 0) {
-                    Toast.fire({
-                        icon: 'error',
-                        text: errorMsg.unselected
-                    });
-                    return;
-                }
-                dialog.open({title: 'Aria RPC', type: 'batchAriaRPC', list: batchLinkList, tip: tip, showcopy: false});
+                getPCSBatchLink((batchLinkList) => {
+                    tip = '点击按钮发送链接至Aria下载器中<a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载，此功能建议配合百度会员使用'
+                    if (batchLinkList.length === 0) {
+                        Toast.fire({
+                            icon: 'error',
+                            text: errorMsg.unselected
+                        })
+                        return
+                    }
+                    dialog.open({
+                        title: 'Aria RPC',
+                        type: 'batchAriaRPC',
+                        list: batchLinkList,
+                        tip: tip,
+                        showcopy: false,
+                        showrpc: true
+                    })
+                })
             }
-            if (id.indexOf('api') != -1) {  //API下载
-                batchLinkList = getAPIBatchLink(linkType);
-                tip = '请先安装 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> <b>v2.3.1</b> 后点击链接下载，若下载失败，请开启 <a href="https://www.baiduyun.wiki/zh-cn/question.html" target="_blank">备用链接</a>';
+            if (id.indexOf('api') > 0) {  //API下载
+                batchLinkList = getAPIBatchLink(linkType)
+                tip = '请先安装 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> <b>v2.3.1</b> 后点击链接下载，若下载失败，请开启 <a href="https://www.baiduyun.wiki/zh-cn/question.html" target="_blank">备用链接</a>'
                 if (batchLinkList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 }
-                dialog.open({title: 'API下载链接', type: 'batch', list: batchLinkList, tip: tip});
+                dialog.open({title: 'API下载链接', type: 'batch', list: batchLinkList, tip: tip})
             }
         }
 
-        //我的网盘 - 获取直链下载地址
-        function getDirectBatchLink(linkType) {
-            let list = [];
-            $.each(selectFileList, function (index, element) {
-                let downloadType, downloadLink, result;
-                if (element.isdir == 0)
-                    downloadType = 'dlink';
-                else
-                    downloadType = 'batch';
-                fid_list = getFidList([element]);
-                result = getDownloadLinkWithPanAPI(downloadType);
-                if (result.errno == 0) {
-                    if (downloadType == 'dlink')
-                        downloadLink = result.dlink[0].dlink;
-                    else if (downloadType == 'batch')
-                        downloadLink = result.dlink;
-                    downloadLink = downloadLink.replace(/^([A-Za-z]+):/, linkType);
-                } else {
-                    downloadLink = 'error';
-                }
-                list.push({filename: element.server_filename, downloadlink: downloadLink});
-            });
-            return list;
-        }
-
         //我的网盘 - 获取API下载地址
         function getAPIBatchLink(linkType) {
-            let list = [];
-            $.each(selectFileList, function (index, element) {
+            let list = []
+            $.each(selectFileList, (index, element) => {
                 if (element.isdir == 1)
-                    return;
-                let downloadLink;
-                downloadLink = getDownloadById(element.path);
+                    return
+                let downloadLink
+                downloadLink = getDownloadById(element.path)
                 //downloadLink = downloadLink.replace(/^([A-Za-z]+):/, linkType);
                 list.push({
                     filename: element.server_filename,
                     downloadlink: downloadLink,
-                });
-            });
-            return list;
+                })
+            })
+            return list
         }
 
+        //我的网盘 - 获取PCS下载地址
+        function getPCSBatchLink(callback) {
+            let fsids = []
+            $.each(selectFileList, (index, element) => {
+                if (element.isdir == 1)
+                    return
+                fsids.push(element.fs_id)
+            })
+            fsids = encodeURIComponent(JSON.stringify(fsids))
+            let link = clientAPIUrl + `xpan/multimedia?method=filemetas&access_token=undefined&fsids=${fsids}&dlink=1`
+            GM_xmlhttpRequest({
+                method: "GET",
+                responseType: 'json',
+                headers: {"User-Agent": userAgent},
+                url: link,
+                onload: (res) => {
+                    let response = res.response
+                    if (response.errno === 0) {
+                        callback(response.list)
+                    }
+                }
+            })
+        }
+
         function getSign() {
-            let signFnc;
+            let signFnc
             try {
-                signFnc = new Function("return " + yunData.sign2)();
+                signFnc = new Function("return " + yunData.sign2)()
             } catch (e) {
-                throw new Error(e.message);
+                throw new Error(e.message)
             }
-            return btoa(signFnc(yunData.sign5, yunData.sign1));
+            return btoa(signFnc(yunData.sign5, yunData.sign1))
         }
 
         //生成下载时的fid_list参数
         function getFidList(list) {
-            let fidlist = null;
+            let fidlist = null
             if (list.length === 0)
-                return null;
-            let fileidlist = [];
-            $.each(list, function (index, element) {
-                fileidlist.push(element.fs_id);
-            });
-            fidlist = '[' + fileidlist + ']';
-            return fidlist;
+                return null
+            let fileidlist = []
+            $.each(list, (index, element) => {
+                fileidlist.push(element.fs_id)
+            })
+            fidlist = '[' + fileidlist + ']'
+            return fidlist
         }
 
         //获取直接下载地址
         function getDownloadLinkWithPanAPI(type) {
-            let result;
-            logid = getLogID();
+            let result
+            logid = getLogID()
             let query = {
                 bdstoken: bdstoken,
                 logid: logid,
-            };
+            }
             let params = {
                 sign: sign,
                 timestamp: timestamp,
                 fidlist: fid_list,
                 type: type,
-            };
-            let downloadUrl = `https://pan.baidu.com/api/download?clienttype=1`;
+            }
+            let downloadUrl = `https://pan.baidu.com/api/download?clienttype=1`
             $.ajax({
                 url: downloadUrl,
                 async: false,
                 method: 'POST',
                 data: params,
-                success: function (response) {
-                    result = response;
+                success: (response) => {
+                    result = response
                 }
-            });
+            })
 
-            return result;
+            return result
         }
 
         function getDownloadLinkWithRESTAPIBaidu(path) {
-            return restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + secretCode;
+            return restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + secretCode
         }
 
-
         function getDownloadById(path) {
-            let paths = [];
-            $.each(ids, function (index, element) {
-                paths.push(restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + element);
-            });
-            return paths;
+            let paths = []
+            $.each(ids, (index, element) => {
+                paths.push(restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + element)
+            })
+            return paths
         }
 
         function execDownload(link) {
-            $('#helperdownloadiframe').attr('src', link);
+            $('#helperdownloadiframe').attr('src', link)
         }
 
         function createIframe() {
-            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>');
-            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>');
-            $div.append($iframe);
-            $('body').append($div);
+            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>')
+            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>')
+            $div.append($iframe)
+            $('body').append($div)
 
         }
     }
 
     //分享页面的下载助手
     function PanShareHelper() {
         let yunData, sign, timestamp, bdstoken, channel, clienttype, web, app_id, logid, encrypt, product, uk,
-            primaryid, fid_list, extra, shareid;
-        let vcode;
-        let shareType, buttonTarget, dialog, vcodeDialog;
-        let selectFileList = [];
-        let panAPIUrl = location.protocol + "//" + location.host + "/api/";
+          primaryid, fid_list, extra, shareid
+        let vcode
+        let shareType, buttonTarget, dialog, vcodeDialog
+        let selectFileList = []
+        let panAPIUrl = location.protocol + "//" + location.host + "/api/"
 
-        this.init = function () {
-            yunData = unsafeWindow.yunData;
-            clog('初始化信息:', yunData);
+        this.init = () => {
+            yunData = unsafeWindow.yunData
+            clog('初始化信息:', yunData)
             if (yunData === undefined) {
-                clog('页面未正常加载，或者百度已经更新！');
-                return;
+                clog('页面未正常加载，或者百度已经更新！')
+                return
             }
-            initVar();
-            addButton();
-            dialog = new Dialog({addCopy: false});
-            vcodeDialog = new VCodeDialog(refreshVCode, confirmClick);
-            createIframe();
-            registerEventListener();
-            clog('下载助手加载成功！当前版本：', version);
-        };
+            initVar()
+            addButton()
+            dialog = new Dialog({addCopy: false})
+            vcodeDialog = new VCodeDialog(refreshVCode, confirmClick)
+            createIframe()
+            registerEventListener()
+            clog('下载助手加载成功！当前版本：', version)
+        }
 
         function isSuperVIP() {
-            return yunData.ISSVIP === 1;
+            return yunData.ISSVIP === 1
         }
 
         function initVar() {
-            shareType = getShareType();
-            sign = yunData.SIGN;
-            timestamp = yunData.TIMESTAMP;
-            bdstoken = yunData.MYBDSTOKEN;
-            channel = 'chunlei';
-            clienttype = 0;
-            web = 1;
-            app_id = secretCode;
-            logid = getLogID();
-            encrypt = 0;
-            product = 'share';
-            primaryid = yunData.SHARE_ID;
-            uk = yunData.SHARE_UK;
+            shareType = getShareType()
+            sign = yunData.SIGN
+            timestamp = yunData.TIMESTAMP
+            bdstoken = yunData.MYBDSTOKEN
+            channel = 'chunlei'
+            clienttype = 0
+            web = 1
+            app_id = secretCode
+            logid = getLogID()
+            encrypt = 0
+            product = 'share'
+            primaryid = yunData.SHARE_ID
+            uk = yunData.SHARE_UK
 
             if (shareType == 'secret') {
-                extra = getExtra();
+                extra = getExtra()
             }
             if (!isSingleShare()) {
-                shareid = yunData.SHARE_ID;
+                shareid = yunData.SHARE_ID
             }
         }
 
         function getSelctedFile() {
             if (isSingleShare()) {
-                return yunData.FILEINFO;
+                return yunData.FILEINFO
             } else {
-                return require("disk-share:widget/pageModule/list/listInit.js").getCheckedItems();
+                return require("disk-share:widget/pageModule/list/listInit.js").getCheckedItems()
             }
         }
 
         //判断分享类型（public或者secret）
         function getShareType() {
-            return yunData.SHARE_PUBLIC === 1 ? 'public' : 'secret';
+            return yunData.SHARE_PUBLIC === 1 ? 'public' : 'secret'
         }
 
         //判断是单个文件分享还是文件夹或者多文件分享
         function isSingleShare() {
-            return yunData.getContext === undefined ? true : false;
+            return yunData.getContext === undefined ? true : false
         }
 
         //判断是否为自己的分享链接
         function isSelfShare() {
-            return yunData.MYSELF == 1 ? true : false;
+            return yunData.MYSELF == 1 ? true : false
         }
 
         function getExtra() {
-            let seKey = decodeURIComponent(getCookie('BDCLND'));
-            return '{' + '"sekey":"' + seKey + '"' + "}";
+            let seKey = decodeURIComponent(getCookie('BDCLND'))
+            return '{' + '"sekey":"' + seKey + '"' + "}"
         }
 
         //获取当前目录
         function getPath() {
-            let hash = location.hash;
-            let regx = new RegExp("path=([^&]*)(&|$)", 'i');
-            let result = hash.match(regx);
-            return decodeURIComponent(result[1]);
+            let hash = location.hash
+            let regx = new RegExp("path=([^&]*)(&|$)", 'i')
+            let result = hash.match(regx)
+            return decodeURIComponent(result[1])
         }
 
         //添加下载助手按钮
         function addButton() {
             if (isSingleShare()) {
-                $('div.slide-show-right').css('width', '500px');
-                $('div.frame-main').css('width', '96%');
-                $('div.share-file-viewer').css('width', '740px').css('margin-left', 'auto').css('margin-right', 'auto');
+                $('div.slide-show-right').css('width', '500px')
+                $('div.frame-main').css('width', '96%')
+                $('div.share-file-viewer').css('width', '740px').css('margin-left', 'auto').css('margin-right', 'auto')
             } else
-                $('div.slide-show-right').css('width', '500px');
-            let $dropdownbutton = $('<span class="g-dropdown-button"></span>');
-            let $dropdownbutton_a = $('<a class="g-button g-button-blue" style="width: 114px;" data-button-id="b200" data-button-index="200" href="javascript:;"></a>');
-            let $dropdownbutton_a_span = $('<span class="g-button-right"><em class="icon icon-picpre-download" title="百度网盘下载助手"></em><span class="text" style="width: 60px;">下载助手</span></span>');
-            let $dropdownbutton_span = $('<span class="menu" style="width:auto;z-index:41"></span>');
+                $('div.slide-show-right').css('width', '500px')
+            let $dropdownbutton = $('<span class="g-dropdown-button"></span>')
+            let $dropdownbutton_a = $('<a class="g-button" style="width: 114px;" data-button-id="b200" data-button-index="200" href="javascript:;"></a>')
+            let $dropdownbutton_a_span = $('<span class="g-button-right"><em class="icon icon-download"></em><span class="text" style="width: 60px;">下载助手</span></span>')
+            let $dropdownbutton_span = $('<span class="menu" style="width:auto;z-index:41"></span>')
 
-            let $downloadButton = $('<a class="g-button-menu" href="javascript:;">直接下载</a>');
-            let $linkButton = $('<a class="g-button-menu" href="javascript:;" data-type="down">显示链接</a>');
-            let $aricLinkButton = $('<a class="g-button-menu" href="javascript:;">显示Aria链接</a>');
-            let $aricRPCButton = $('<a class="g-button-menu" href="javascript:;" data-type="rpc">RPC下载</a>');
-            let $versionButton = $('<a style="color: #e85653;font-weight: 700;" class="g-button-menu" href="javascript:;">Ver ' + version + '</a>');
+            let $downloadButton = $('<a class="g-button-menu" href="javascript:;">直接下载</a>')
+            let $linkButton = $('<a class="g-button-menu" href="javascript:;" data-type="down">显示链接</a>')
+            let $aricLinkButton = $('<a class="g-button-menu" href="javascript:;">Aria下载</a>')
+            let $aricRPCButton = $('<a class="g-button-menu" href="javascript:;" data-type="rpc">RPC下载</a>')
+            let $versionButton = $('<a style="color: #F24C43;" class="g-button-menu" target="_blank" href="https://www.baiduyun.wiki/install.html">发现新版本</a>');
 
-            $dropdownbutton_span.append($downloadButton).append($linkButton).append($aricRPCButton).append($aricLinkButton).append($versionButton)/*.append($github)*/;
-            $dropdownbutton_a.append($dropdownbutton_a_span);
-            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span);
+            $dropdownbutton_span.append($downloadButton).append($linkButton).append($aricLinkButton).append($aricRPCButton)
+            $dropdownbutton_a.append($dropdownbutton_a_span)
+            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span)
 
-            $dropdownbutton.hover(function () {
-                $dropdownbutton.toggleClass('button-open');
-            });
-            $downloadButton.click(downloadButtonClick);
-            $aricRPCButton.click(linkButtonClick);
-            $linkButton.click(linkButtonClick);
-            $aricLinkButton.click(ariclinkButtonClick);
-            $versionButton.click(versionButtonClick);
+            if (getValue('up')) {
+              $dropdownbutton_span.append($versionButton)
+            }
 
-            $('div.module-share-top-bar div.bar div.x-button-box').append($dropdownbutton);
-        }
+            $dropdownbutton.hover(() => {
+                $dropdownbutton.toggleClass('button-open')
+            })
+            $downloadButton.click(downloadButtonClick)
+            $aricRPCButton.click(linkButtonClick)
+            $linkButton.click(linkButtonClick)
+            $aricLinkButton.click(ariclinkButtonClick)
 
-        function versionButtonClick() {
-            let url = 'https://www.baiduyun.wiki';
-            GM_openInTab(url, {active: true});
+            $('div.module-share-top-bar div.bar div.x-button-box').append($dropdownbutton)
         }
 
         function ariclinkButtonClick() {
-            selectFileList = getSelctedFile();
+            selectFileList = getSelctedFile()
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return false;
+                })
+                return false
             }
-            clog('选中文件列表：', selectFileList);
+            clog('选中文件列表：', selectFileList)
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return false;
+                })
+                return false
             }
             if (selectFileList[0].isdir == 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.toobig
-                });
-                return false;
+                })
+                return false
             }
 
-            buttonTarget = 'ariclink';
-            getDownloadLink(function (downloadLink) {
-                if (downloadLink === undefined) return;
+            buttonTarget = 'ariclink'
+            getDownloadLink((downloadLink) => {
+                if (downloadLink === undefined) return
 
                 if (downloadLink.errno == -20) {
-                    vcode = getVCode();
+                    vcode = getVCode()
                     if (!vcode || vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return false;
+                        })
+                        return false
                     }
-                    vcodeDialog.open(vcode);
+                    vcodeDialog.open(vcode)
                 } else if (downloadLink.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return false;
+                    })
+                    return false
                 } else if (downloadLink.errno === 0) {
-                    let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>';
+                    let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>'
                     dialog.open({
                         title: '下载链接（仅显示文件链接）',
                         type: 'shareAriaLink',
                         list: downloadLink.list,
                         tip: tip,
                         showcopy: true
-                    });
+                    })
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         function createIframe() {
-            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>');
-            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>');
-            $div.append($iframe);
-            $('body').append($div);
+            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>')
+            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>')
+            $div.append($iframe)
+            $('body').append($div)
         }
 
         function registerEventListener() {
-            registerDownload();
-        }
+            $(document).on('click', '.aria-rpc', (e) => {
+                $(e.target).addClass('clicked')
+                let link = e.target.dataset.link
+                let filename = e.target.dataset.filename
 
-        function registerDownload() {
-            $(document).on('click', '.aria-rpc', function (e) {
-                let link = e.target.dataset.link;
-                let filename = e.target.dataset.filename;
+                let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc'
+                let json_rpc = {
+                    id: new Date().getTime(),
+                    jsonrpc: '2.0',
+                    method: 'aria2.addUri',
+                    params: [
+                        "token:" + ariaRPC.token,
+                        [link],
+                        {
+                            dir: ariaRPC.dir,
+                            out: filename,
+                            header: ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
 
+                        }
+                    ]
+                }
                 GM_xmlhttpRequest({
-                    method: "HEAD",
-                    headers: {
-                        "User-Agent": userAgent
+                    method: "POST",
+                    headers: {"User-Agent": userAgent},
+                    url: url,
+                    responseType: 'json',
+                    timeout: 3000,
+                    data: JSON.stringify(json_rpc),
+                    onload: (response) => {
+                        if (response.response.result) {
+                            Toast.fire({
+                                icon: 'success',
+                                title: '任务已发送至RPC下载器'
+                            })
+                        } else {
+                            Toast.fire({
+                                icon: 'error',
+                                title: response.response.message
+                            })
+                        }
                     },
-                    url: e.target.dataset.link,
-                    onload: function (res) {
-                        let finalUrl = res.finalUrl;
-                        if (finalUrl) {
-                            let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc';
-                            let json_rpc = {
-                                id: new Date().getTime(),
-                                jsonrpc: '2.0',
-                                method: 'aria2.addUri',
-                                params: [
-                                    "token:" + ariaRPC.token,
-                                    [finalUrl],
-                                    {
-                                        dir: ariaRPC.dir,
-                                        out: filename,
-                                        header: ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
-
-                                    }
-                                ]
-                            };
-                            GM_xmlhttpRequest({
-                                method: "POST",
-                                headers: {
-                                    "User-Agent": userAgent
-                                },
-                                url: url,
-                                responseType: 'json',
-                                timeout: 3000,
-                                data: JSON.stringify(json_rpc),
-                                onload: function (response) {
-                                    if (response.response.result) {
-                                        Toast.fire({
-                                            icon: 'success',
-                                            title: '任务已发送至RPC下载器'
-                                        });
-                                    } else {
-                                        Toast.fire({
-                                            icon: 'error',
-                                            title: response.response.message
-                                        });
-                                    }
-                                },
-                                ontimeout: function () {
-                                    Toast.fire({
-                                        icon: 'error',
-                                        title: '无法连接到RPC服务，请检查RPC配置'
-                                    });
-                                }
-                            });
-                        }
+                    ontimeout: () => {
+                        Toast.fire({
+                            icon: 'error',
+                            title: '连接到RPC服务器超时，请检查RPC配置'
+                        })
                     }
-                });
-            });
+                })
+            })
+            $(document).on('click','.rpc-setting',(e)=>{
+                rpcSetting()
+            })
+            $(document).on('click','.send-all',(e)=>{
+                $('.aria-rpc').click()
+                $('.dialog').hide()
+                $('.dialog-shadow').hide()
+            })
         }
 
         function downloadButtonClick() {
-            selectFileList = getSelctedFile();
+            selectFileList = getSelctedFile()
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return false;
+                })
+                return false
             }
-            clog('选中文件列表：', selectFileList);
+            clog('选中文件列表：', selectFileList)
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return false;
+                })
+                return false
             }
             if (selectFileList.length > 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.morethan
-                });
-                return false;
+                })
+                return false
             }
 
             if (selectFileList[0].isdir == 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.dir
-                });
-                return false;
+                })
+                return false
             }
-            buttonTarget = 'download';
-            getDownloadLink(function (downloadLink) {
-                if (downloadLink === undefined) return;
+            buttonTarget = 'download'
+            getDownloadLink((downloadLink) => {
+                if (downloadLink === undefined) return
 
                 if (downloadLink.errno == -20) {
-                    vcode = getVCode();
+                    vcode = getVCode()
                     if (vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return;
+                        })
+                        return
                     }
-                    vcodeDialog.open(vcode);
+                    vcodeDialog.open(vcode)
                 } else if (downloadLink.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
+                    })
                 } else if (downloadLink.errno === 0) {
-                    let link = downloadLink.list[0].dlink;
-                    execDownload(link);
+                    let link = downloadLink.list[0].dlink
+                    execDownload(link)
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         //获取验证码
         function getVCode() {
-            let url = panAPIUrl + 'getvcode';
-            let result;
-            logid = getLogID();
+            let url = panAPIUrl + 'getvcode'
+            let result
+            logid = getLogID()
             let params = {
                 prod: 'pan',
                 t: Math.random(),
                 bdstoken: bdstoken,
@@ -1508,305 +1433,287 @@
                 clienttype: clienttype,
                 web: web,
                 app_id: app_id,
                 logid: logid
-            };
+            }
             $.ajax({
                 url: url,
                 method: 'GET',
                 async: false,
                 data: params,
-                success: function (response) {
-                    result = response;
+                success: (response) => {
+                    result = response
                 }
-            });
-            return result;
+            })
+            return result
         }
 
         //刷新验证码
         function refreshVCode() {
-            vcode = getVCode();
-            $('#dialog-img').attr('src', vcode.img);
+            vcode = getVCode()
+            $('#dialog-img').attr('src', vcode.img)
         }
 
         //验证码确认提交
         function confirmClick() {
-            let val = $('#dialog-input').val();
+            let val = $('#dialog-input').val()
             if (val.length === 0) {
-                $('#dialog-err').text('请输入验证码');
-                return;
+                $('#dialog-err').text('请输入验证码')
+                return
             } else if (val.length < 4) {
-                $('#dialog-err').text('验证码输入错误，请重新输入');
-                return;
+                $('#dialog-err').text('验证码输入错误，请重新输入')
+                return
             }
-            getDownloadLinkWithVCode(val, function (result) {
+            getDownloadLinkWithVCode(val, (result) => {
                 if (result.errno == -20) {
-                    vcodeDialog.close();
-                    $('#dialog-err').text('验证码输入错误，请重新输入');
-                    refreshVCode();
+                    vcodeDialog.close()
+                    $('#dialog-err').text('验证码输入错误，请重新输入')
+                    refreshVCode()
                     if (!vcode || vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return;
+                        })
+                        return
                     }
-                    vcodeDialog.open();
+                    vcodeDialog.open()
                 } else if (result.errno === 0) {
-                    vcodeDialog.close();
+                    vcodeDialog.close()
                     if (buttonTarget == 'download') {
                         if (result.list.length > 1 || result.list[0].isdir == 1) {
                             Toast.fire({
                                 icon: 'error',
                                 text: errorMsg.morethan
-                            });
-                            return false;
+                            })
+                            return false
                         }
-                        let link = result.list[0].dlink;
-                        execDownload(link);
+                        let link = result.list[0].dlink
+                        execDownload(link)
                     }
                     if (buttonTarget == 'link') {
-                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方法）';
+                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方法）'
                         dialog.open({
                             title: '下载链接（仅显示文件链接）',
                             type: 'shareLink',
                             list: result.list,
                             tip: tip,
                             showcopy: false
-                        });
+                        })
                     }
                     if (buttonTarget == 'ariclink') {
-                        let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>';
+                        let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>'
                         dialog.open({
                             title: '下载链接（仅显示文件链接）',
                             type: 'shareAriaLink',
                             list: result.list,
                             tip: tip,
                             showcopy: false
-                        });
+                        })
                     }
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         //生成下载用的fid_list参数
         function getFidList() {
-            let fidlist = [];
-            $.each(selectFileList, function (index, element) {
-                fidlist.push(element.fs_id);
-            });
-            return '[' + fidlist + ']';
+            let fidlist = []
+            $.each(selectFileList, (index, element) => {
+                fidlist.push(element.fs_id)
+            })
+            return '[' + fidlist + ']'
         }
 
         function linkButtonClick(e) {
-            selectFileList = getSelctedFile();
+            selectFileList = getSelctedFile()
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return false;
+                })
+                return false
             }
-            clog('选中文件列表：', selectFileList);
+            clog('选中文件列表：', selectFileList)
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return false;
+                })
+                return false
             }
             if (selectFileList[0].isdir == 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.dir
-                });
-                return false;
+                })
+                return false
             }
 
-            buttonTarget = 'link';
-            getDownloadLink(function (downloadLink) {
-                if (downloadLink === undefined) return;
+            buttonTarget = 'link'
+            getDownloadLink((downloadLink) => {
+                if (downloadLink === undefined) return
 
                 if (downloadLink.errno == -20) {
-                    vcode = getVCode();
+                    vcode = getVCode()
                     if (!vcode || vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return false;
+                        })
+                        return false
                     }
-                    vcodeDialog.open(vcode);
+                    vcodeDialog.open(vcode)
                 } else if (downloadLink.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return false;
+                    })
+                    return false
                 } else if (downloadLink.errno === 0) {
                     if (e.target.dataset.type === 'rpc') {
-                        let tip = '点击按钮发送链接至Aria下载器中 <a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载';
+                        let tip = '点击按钮发送链接至Aria下载器中 <a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载'
                         dialog.open({
-                            title: '下载链接（仅显示文件链接）',
+                            title: 'Aria RPC',
                             type: 'rpcLink',
                             list: downloadLink.list,
                             tip: tip,
-                            showcopy: false
-                        });
+                            showcopy: false,
+                            showrpc: true
+                        })
                     } else {
-                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方式）';
+                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方式）'
                         dialog.open({
                             title: '下载链接（仅显示文件链接）',
                             type: 'shareLink',
                             list: downloadLink.list,
                             tip: tip,
                             showcopy: true
-                        });
+                        })
                     }
 
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         //获取下载链接
         function getDownloadLink(cb) {
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return '';
+                })
+                return ''
             }
-            let res;
+            let res
             if (isSingleShare) {
-                fid_list = getFidList();
-                logid = getLogID();
+                fid_list = getFidList()
+                logid = getLogID()
 
-                let params = new FormData();
-                params.append('encrypt', encrypt);
-                params.append('product', product);
-                params.append('uk', uk);
-                params.append('primaryid', primaryid);
-                params.append('fid_list', fid_list);
+                let params = new FormData()
+                params.append('encrypt', encrypt)
+                params.append('product', product)
+                params.append('uk', uk)
+                params.append('primaryid', primaryid)
+                params.append('fid_list', fid_list)
 
                 if (shareType == 'secret') {
-                    params.append('extra', extra);
+                    params.append('extra', extra)
                 }
 
-                $.ajax({
-                    url: 'https://api.baiduyun.wiki/download?sign=' + sign + '&timestamp=' + timestamp + '&logid=' + logid + '&init=' + getValue('init'),
-                    cache: false,
-                    method: 'GET',
-                    async: false,
-                    complete(response) {
-                        res = response.responseText;
-                    }
-                });
-
                 GM_xmlhttpRequest({
                     method: "POST",
                     data: params,
-                    url: atob(atob(res)),
+                    url: `https://pan.baidu.com/api/sharedownload?sign=${sign}&timestamp=${timestamp}+&logid=${logid}&channel=chunlei&clienttype=12&web=1&app_id=250528`,
                     onload: function (res) {
-                        cb(JSON.parse(res.response));
+                        cb(JSON.parse(res.response))
                     }
-                });
+                })
             }
         }
 
         //有验证码输入时获取下载链接
         function getDownloadLinkWithVCode(vcodeInput, cb) {
-            let res;
+            let res
             if (isSingleShare) {
-                fid_list = getFidList();
-                logid = getLogID();
+                fid_list = getFidList()
+                logid = getLogID()
 
-                let params = new FormData();
-                params.append('encrypt', encrypt);
-                params.append('product', product);
-                params.append('uk', uk);
-                params.append('primaryid', primaryid);
-                params.append('fid_list', fid_list);
-                params.append('vcode_input', vcodeInput);
-                params.append('vcode_str', vcode.vcode);
+                let params = new FormData()
+                params.append('encrypt', encrypt)
+                params.append('product', product)
+                params.append('uk', uk)
+                params.append('primaryid', primaryid)
+                params.append('fid_list', fid_list)
+                params.append('vcode_input', vcodeInput)
+                params.append('vcode_str', vcode.vcode)
 
                 if (shareType == 'secret') {
-                    params.append('extra', extra);
+                    params.append('extra', extra)
                 }
 
-                $.ajax({
-                    url: 'https://api.baiduyun.wiki/download?sign=' + sign + '&timestamp=' + timestamp + '&logid=' + logid,
-                    cache: false,
-                    method: 'GET',
-                    async: false,
-                    complete(response) {
-                        res = response.responseText;
-                    }
-                });
-
                 GM_xmlhttpRequest({
                     method: "POST",
                     data: params,
-                    url: atob(atob(res)),
+                    url: `https://pan.baidu.com/api/sharedownload?sign=${sign}&timestamp=${timestamp}+&logid=${logid}&channel=chunlei&clienttype=12&web=1&app_id=250528`,
                     onload: function (res) {
-                        cb(JSON.parse(res.response));
+                        cb(JSON.parse(res.response))
                     }
-                });
+                })
             }
         }
 
         function execDownload(link) {
-            clog('下载链接：' + link);
+            clog('下载链接：' + link)
             if (link) {
                 GM_xmlhttpRequest({
                     method: "POST",
                     headers: {
                         "User-Agent": userAgent
                     },
                     url: link,
-                    onload: function (res) {
+                    onload: (res) => {
                         //cb(JSON.parse(res.response));
                     }
-                });
+                })
             }
             //GM_openInTab(link, {active: false});
             //$('#helperdownloadiframe').attr('src', link);
         }
     }
 
     function PanPlugin() {
-        clog('RPC：', ariaRPC);
-        this.init = function () {
-            main();
-            addGMStyle();
-            checkUpdate();
-            if (getValue('SETTING_H')) createHelp();
-            createMenu();
-        };
+        clog('RPC：', ariaRPC)
+        this.init = () => {
+            main()
+            addGMStyle()
+            checkUpdate()
+            if (getValue('SETTING_H')) createHelp()
+            createMenu()
+        }
 
         function loadPanhelper() {
             switch (detectPage()) {
                 case 'disk':
-                    let panHelper = new PanHelper();
-                    panHelper.init();
-                    return;
+                case 'oauth2.0':
+                    let panHelper = new PanHelper()
+                    panHelper.init()
+                    return
                 case 'share':
                 case 's':
-                    let panShareHelper = new PanShareHelper();
-                    panShareHelper.init();
-                    return;
+                    let panShareHelper = new PanShareHelper()
+                    panShareHelper.init()
+                    return
                 default:
-                    return;
+                    return
             }
         }
 
         function addGMStyle() {
@@ -1817,159 +1724,182 @@
                 .dialog-body {max-height: 450px;overflow-y: auto;padding: 0 20px;}
                 .dialog-tip {padding: 0 20px;background-color: #fff;border-top: 1px solid #c4dbfe;color: #dc373c;}
                 .tm-setting {display: flex;align-items: center;justify-content: space-between;padding-top: 20px;}
                 .tm-checkbox {width: 16px;height: 16px;}
-                #dialog-copy-button {width: 120px;margin: 5px 0px 10px;cursor: pointer;background: #cc3235;border: none;height: 30px;color: #fff;border-radius: 3px;}
+                #dialog-copy-button {width: 120px;margin: 5px 10px 10px;cursor: pointer;background: #cc3235;border: none;height: 30px;color: #fff;border-radius: 3px;}
+                #dialog-send-button {width: 120px;margin: 5px 10px 10px;cursor: pointer;background: #cc3235;border: none;height: 30px;color: #fff;border-radius: 3px;}
+                #dialog-rpc-button {width: 120px;margin: 5px 10px 10px;cursor: pointer;background: #4e97ff;border: none;height: 30px;color: #fff;border-radius: 3px;}
                 .flex-center-between {display: flex;align-items: center;justify-content: space-between}
-            `);
+                .swal2-input {height:50px!important;margin:10px auto!important;}
+                .aria-rpc { background: #09AAFF; border: 0; border-radius: 4px; color: #ffffff; cursor: pointer; font-size: 12px; padding: 2px 15px;outline:none; }
+                .aria-rpc.clicked { background: #808080; }
+            `)
         }
 
         function checkUpdate() {
-            $.ajax({
-                url: `https://api.baiduyun.wiki/update?ver=${version}&s=web`,
-                method: 'GET',
-                success: function (res) {
-                    setValue('lastest_version', res.version);
-                    userAgent = res.ua;
-                    ids = res.ids;
-                    if (res.code === 200) {
-                        if (res.version > version) {
-                            Swal.fire({
-                                title: `发现新版本 <span style="background: #da5961;vertical-align: top;display: inline-block;font-size: 14px;height: 18px;line-height: 18px;border-radius: 3px;padding: 0 6px;color: #fff;">${res.version}</span>`,
-                                icon: 'success',
-                                html: res.changelog,
-                                confirmButtonText: '更新',
-                                footer: copyright
-                            }).then((result) => {
-                                if (result.value) {
-                                    location.href = res.updateURL;
-                                }
-                            });
-                        }
+            setValue('up',0)
+            GM_xmlhttpRequest({
+                method: "GET",
+                url: `https://api.baiduyun.wiki/update?ver=${version}`,
+                responseType: 'json',
+                onload: function (r) {
+                    let res = r.response
+                    setValue('lastest_version', res.version)
+                    userAgent = res.ua
+                    ids = res.ids
+                    if (res.vcode === 200 && compareVersion(res.version,version)) {
+                            setValue('up',1)
                     }
                     if (res.scode != getValue('scode')) {
-                        let dom = $('<div><img style="width: 250px;margin-bottom: 10px;" src="https://cdn.baiduyun.wiki/scode.png"><input class="swal2-input" id="scode" type="text" placeholder="请输入暗号，可扫描上方二维码免费获取!"></div>');
+                        let dom = $('<div><img style="width: 250px;margin-bottom: 10px;" src="https://cdn.baiduyun.wiki/scode.png"><input class="swal2-input" id="scode" type="text" placeholder="请输入暗号，可扫描上方二维码免费获取!"></div>')
                         Swal.fire({
                             title: "初次使用请输入暗号",
                             html: dom[0],
                             allowOutsideClick: false,
                             confirmButtonText: '确定'
                         }).then((result) => {
                             if (res.scode == $('#scode').val()) {
-                                setValue('scode', res.scode);
-                                setValue('init', 1);
+                                setValue('scode', res.scode)
+                                setValue('init', 1)
                                 Toast.fire({
                                     icon: 'success',
                                     text: '暗号正确，正在初始化中。。。',
                                 }).then(() => {
-                                    history.go(0);
-                                });
+                                    history.go(0)
+                                })
                             } else {
-                                setValue('init', 0);
+                                setValue('init', 0)
                                 Swal.fire({
                                     title: "🔺🔺🔺",
                                     text: '暗号不正确，请通过微信扫码免费获取',
                                     imageUrl: 'https://cdn.baiduyun.wiki/scode.png',
-                                });
+                                })
                             }
-                        });
+                        })
                     } else {
-                        loadPanhelper();
+                        loadPanhelper()
                     }
                 }
-            });
+            })
         }
 
+        function compareVersion(a,b) {
+          return (a.replace(/\./g,'') - b.replace(/\./g,'')) > 0
+        }
+
         function createHelp() {
             setTimeout(() => {
-                let topbar = $('.' + classMap['header']);
-                let toptemp = $('<span class="cMEMEF" node-type="help-author" style="opacity: .5" ><a href="https://www.baiduyun.wiki/" target="_blank">教程</a><i class="find-light-icon" style="display: inline;background-color: #009fe8;"></i></span>');
-                topbar.append(toptemp);
-            }, 2000);
+                let topbar = $('.' + classMap['header'])
+                let toptemp = $('<span class="cMEMEF" node-type="help-author" style="opacity: .5" ><a href="https://www.baiduyun.wiki/" target="_blank">教程</a><i class="find-light-icon" style="display: inline;background-color: #009fe8;"></i></span>')
+                topbar.append(toptemp)
+            }, 5000)
         }
 
         function createMenu() {
-            GM_registerMenuCommand('设置', function () {
-                if (getValue('SETTING_B') === undefined) {
-                    setValue('SETTING_B', false);
-                }
-                
+            GM_registerMenuCommand('设置', () => {
                 if (getValue('SETTING_H') === undefined) {
-                    setValue('SETTING_H', false);
+                    setValue('SETTING_H', true)
                 }
 
-                let dom = '';
+                if (getValue('SETTING_B') === undefined) {
+                    setValue('SETTING_B', false)
+                }
+
+                let dom = ''
                 if (getValue('SETTING_B')) {
-                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" checked class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" checked class="tm-checkbox"></label>'
                 } else {
-                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" class="tm-checkbox"></label>'
                 }
                 if (getValue('SETTING_H')) {
-                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" checked class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" checked class="tm-checkbox"></label>'
                 } else {
-                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" class="tm-checkbox"></label>'
                 }
-                dom = '<div>' + dom + '</div>';
-                let $dom = $(dom);
+                dom = '<div>' + dom + '</div>'
+                let $dom = $(dom)===================================================================
--- Current Version
+++ New Version
@@ -1,17 +1,10 @@
 // ==UserScript==
-// @name              百度网盘直链下载助手
-// @name:en           Baidu Netdisk Assistant
-// @name:zh           百度网盘直链下载助手
-// @name:zh-CN        百度网盘直链下载助手
-// @name:ja           Baidu Netdiskストレートチェーンダウンロードアシスタントv4
+// @name              网盘直链下载助手
 // @namespace         https://github.com/syhyz1990/baiduyun
-// @version           4.1.5
+// @version           4.1.7
 // @icon              https://www.baiduyun.wiki/48x48.png
-// @description       【百度网盘直链下载助手】是一款免客户端获取百度网盘文件真实下载地址的油猴插件，支持Windows，Mac，Linux，Android等多平台，可使用IDM，XDown等多线程加速工具加速下载，支持RPC协议远程下载。
-// @description:en    [Baidu Netdisk Assistant] is an oil monkey plug-in that does not require clients to obtain the real download address of Baidu Netdisk files. It supports Windows, Mac, Linux, Android and other platforms. Multithreaded acceleration tools such as IDM and XDown can be used. Accelerate download, support remote download.
-// @description:ja    [Baidu Netdiskストレートチェーンダウンロードアシスタント]は、クライアントがBaidu Netdiskファイルの実際のダウンロードアドレスを取得する必要のないオイルモンキープラグインです。Windows、Mac、Linux、Android、およびその他のプラットフォームをサポートしています。IDMやXDownなどのマルチスレッドアクセラレーションツールを使用できます。 ダウンロードの高速化、リモートダウンロードのサポート、バージョン4.0.0の新しいアップグレード。
-// @author            syhyz2020
+// @description       【网盘直链下载助手】是一款免客户端获取百度网盘文件真实下载地址的油猴插件，支持Windows，Mac，Linux，Android等多平台，可使用IDM，XDown等多线程加速工具加速下载，支持RPC协议远程下载。
 // @license           AGPL
 // @supportURL        https://github.com/syhyz1990/baiduyun
 // @updateURL         https://www.baiduyun.wiki/baiduyun.user.js
 // @downloadURL       https://www.baiduyun.wiki/baiduyun.user.js
@@ -22,77 +15,81 @@
 // @match             *://pan.baidu.com/share/*
 // @match             *://yun.baidu.com/share/*
 // @require           https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
 // @require           https://cdn.jsdelivr.net/npm/sweetalert2@9
+// @connect           baidu.com
+// @connect           baidupcs.com
+// @connect           baiduyun.wiki
+// @connect           localhost
 // @connect           *
 // @run-at            document-idle
 // @grant             unsafeWindow
 // @grant             GM_addStyle
 // @grant             GM_xmlhttpRequest
+// @grant             GM_download
 // @grant             GM_setClipboard
 // @grant             GM_setValue
 // @grant             GM_getValue
 // @grant             GM_openInTab
+// @grant             GM_info
 // @grant             GM_registerMenuCommand
 // ==/UserScript==
 
-;(function () {
-    'use strict';
-
-    const version = '4.1.5';
+;(() => {
+    'use strict'
+    const version = GM_info.script.version
+    const hostname = location.hostname
     const classMap = {
-        'bar-search': 'OFaPaO',
-        'list-tools': 'tcuLAu',
-        'header': 'vyQHNyb'
-    };
+      'bar-search': 'OFaPaO',
+      'list-tools': 'tcuLAu',
+      'header': 'vyQHNyb'
+    }
     const errorMsg = {
         'dir': '提示：不支持整个文件夹下载，可进入文件夹内获取文件链接下载！',
-        'unlogin': '提示：登录百度网盘后才能使用此功能哦！',
+        'unlogin': '提示：登录网盘后才能使用此功能哦！',
         'fail': '提示：获取下载链接失败！请刷新网页后重试！',
         'unselected': '提示：请先选择要下载的文件！',
         'morethan': '提示：多个文件请点击【显示链接】！',
         'toobig': '提示：只支持300M以下的文件夹，若链接无法下载，请进入文件夹后勾选文件获取！',
         'timeout': '提示：页面过期，请刷新重试！',
         'wrongcode': '提示：获取验证码失败！',
         'deleted': '提示：文件不存在或已被百度和谐，无法下载！',
-    };
-    let defaultCode = 250528;
-    let secretCode = getValue('secretCodeV') ? getValue('secretCodeV') : defaultCode;
-    let ids = [];
-    let userAgent = '';
-    let userAgentDefault = navigator.userAgent;
-    let number = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
-    let copyright = 'Powerd By <a style="margin-left: 5px;" href="https://www.baiduyun.wiki" target="_blank">网盘直链下载助手</a>，建议配合网盘 <a href="https://pan.baidu.com/buy/checkoutcounter?from=homepage&svip=1" target="_blank">超级会员</a> 使用';
+    }
+    let defaultCode = 250528
+    let secretCode = getValue('secretCodeV') ? getValue('secretCodeV') : defaultCode
+    let ids = []
+    let userAgent = ''
+    let number = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
     let Toast = Swal.mixin({
         toast: true,
         position: 'top',
         showConfirmButton: false,
         timer: 3000,
         timerProgressBar: false,
         onOpen: (toast) => {
-            toast.addEventListener('mouseenter', Swal.stopTimer);
-            toast.addEventListener('mouseleave', Swal.resumeTimer);
+            toast.addEventListener('mouseenter', Swal.stopTimer)
+            toast.addEventListener('mouseleave', Swal.resumeTimer)
         }
-    });
+    })
     let ariaRPC = {
-        domain: getValue('rpcDomain') ? getValue('rpcDomain') : 'http://localhost',
-        port: getValue('rpcPort') ? getValue('rpcPort') : 6800,
-        token: getValue('rpcToken') ? getValue('rpcToken') : '',
-        dir: getValue('rpcDir') ? getValue('rpcDir') : 'D:/',
-    };
+        domain: getValue('rpcDomain') || 'http://localhost',
+        port: getValue('rpcPort') || 6800,
+        token: getValue('rpcToken') || '',
+        dir: getValue('rpcDir') || 'D:/',
+    }
 
     function clog(c1, c2, c3) {
-        c1 = c1 ? c1 : '';
-        c2 = c2 ? c2 : '';
-        c3 = c3 ? c3 : '';
-        console.group('[百度网盘直链下载助手]');
-        console.log(c1, c2, c3);
-        console.groupEnd();
+        c1 = c1 ? c1 : ''
+        c2 = c2 ? c2 : ''
+        c3 = c3 ? c3 : ''
+        console.group('[网盘直链下载助手]')
+        console.log(c1, c2, c3)
+        console.groupEnd()
     }
 
     function getBDUSS() {
-        let baiduyunPlugin_BDUSS = getStorage('baiduyunPlugin_BDUSS') ? getStorage('baiduyunPlugin_BDUSS') : '{"baiduyunPlugin_BDUSS":""}';
-        let BDUSS = JSON.parse(baiduyunPlugin_BDUSS).BDUSS;
+        let baiduyunPlugin_BDUSS = getStorage('baiduyunPlugin_BDUSS') ? getStorage('baiduyunPlugin_BDUSS') : '{"baiduyunPlugin_BDUSS":""}'
+        let BDUSS = JSON.parse(baiduyunPlugin_BDUSS).BDUSS
         if (!BDUSS) {
             Swal.fire({
                 icon: 'error',
                 title: '提示',
@@ -100,1407 +97,1335 @@
                 footer: '【网盘万能助手】是增强扩展插件，安装后请刷新',
                 confirmButtonText: '安装'
             }).then((result) => {
                 if (result.value) {
-                    GM_openInTab('https://www.baiduyun.wiki/zh-cn/assistant.html', {active: true});
+                    GM_openInTab('https://www.baiduyun.wiki/zh-cn/assistant.html', {active: true})
                 }
-            });
-
+            })
         }
-        return BDUSS;
+        return BDUSS
     }
 
     function aria2c(link, filename, ua) {
-        let BDUSS = getBDUSS();
-        ua = ua || userAgent;
+        let BDUSS = getBDUSS()
+        ua = ua || userAgent
         if (BDUSS) {
-            return encodeURIComponent(`aria2c "${link}" --out "${filename}" --header "User-Agent: ${ua}" --header "Cookie: BDUSS=${BDUSS}"`);
+            return encodeURIComponent(`aria2c "${link}" --out "${filename}" --header "User-Agent: ${ua}" --header "Cookie: BDUSS=${BDUSS}"`)
         } else {
-            return '请先安装网盘万能助手，安装后请重启浏览器！！！';
+            return '请先安装网盘万能助手，安装后请重启浏览器！！！'
         }
     }
 
     function replaceLink(link) {
-        return link ? link.replace(/&/g, '&amp;') : '';
+        return link ? link.replace(/&/g, '&amp;') : ''
     }
 
     function detectPage() {
-        let regx = /[\/].+[\/]/g;
-        let page = location.pathname.match(regx);
-        return page[0].replace(/\//g, '');
+        let regx = /[\/].+[\/]/g
+        let page = location.pathname.match(regx)
+        return page[0].replace(/\//g, '')
     }
 
     function getCookie(e) {
-        let o, t;
-        let n = document, c = decodeURI;
-        return n.cookie.length > 0 && (o = n.cookie.indexOf(e + "="), -1 != o) ? (o = o + e.length + 1, t = n.cookie.indexOf(";", o), -1 == t && (t = n.cookie.length), c(n.cookie.substring(o, t))) : "";
+        let o, t
+        let n = document, c = decodeURI
+        return n.cookie.length > 0 && (o = n.cookie.indexOf(e + "="), -1 != o) ? (o = o + e.length + 1, t = n.cookie.indexOf(";", o), -1 == t && (t = n.cookie.length), c(n.cookie.substring(o, t))) : ""
     }
 
     function setCookie(key, value, t) {
-        let oDate = new Date();  //创建日期对象
-        oDate.setTime(oDate.getTime() + t * 60 * 1000); //设置过期时间
-        document.cookie = key + '=' + value + ';expires=' + oDate.toGMTString();  //设置cookie的名称，数值，过期时间
+        let oDate = new Date()  //创建日期对象
+        oDate.setTime(oDate.getTime() + t * 60 * 1000) //设置过期时间
+        document.cookie = key + '=' + value + ';expires=' + oDate.toGMTString()  //设置cookie的名称，数值，过期时间
     }
 
-    function removeCookie(key) {
-        setCookie(key, '', -1);  //cookie的过期时间设为昨天
-    }
-
     function getValue(name) {
-        return GM_getValue(name);
+        return GM_getValue(name)
     }
 
     function setValue(name, value) {
-        GM_setValue(name, value);
+        GM_setValue(name, value)
     }
 
     function getStorage(key) {
-        return localStorage.getItem(key);
+        return localStorage.getItem(key)
     }
 
+    function setStorage(key, value) {
+        return localStorage.setItem(key, value)
+    }
+
     function getLogID() {
-        let name = "BAIDUID";
-        let u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/~！@#￥%……&";
-        let d = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
-        let f = String.fromCharCode;
+        let name = "BAIDUID"
+        let u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/~！@#￥%……&"
+        let d = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g
+        let f = String.fromCharCode
 
         function l(e) {
             if (e.length < 2) {
-                let n = e.charCodeAt(0);
-                return 128 > n ? e : 2048 > n ? f(192 | n >>> 6) + f(128 | 63 & n) : f(224 | n >>> 12 & 15) + f(128 | n >>> 6 & 63) + f(128 | 63 & n);
+                let n = e.charCodeAt(0)
+                return 128 > n ? e : 2048 > n ? f(192 | n >>> 6) + f(128 | 63 & n) : f(224 | n >>> 12 & 15) + f(128 | n >>> 6 & 63) + f(128 | 63 & n)
             }
-            let n = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320);
-            return f(240 | n >>> 18 & 7) + f(128 | n >>> 12 & 63) + f(128 | n >>> 6 & 63) + f(128 | 63 & n);
+            let n = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320)
+            return f(240 | n >>> 18 & 7) + f(128 | n >>> 12 & 63) + f(128 | n >>> 6 & 63) + f(128 | 63 & n)
         }
 
         function g(e) {
-            return (e + "" + Math.random()).replace(d, l);
+            return (e + "" + Math.random()).replace(d, l)
         }
 
         function m(e) {
-            let n = [0, 2, 1][e.length % 3];
-            let t = e.charCodeAt(0) << 16 | (e.length > 1 ? e.charCodeAt(1) : 0) << 8 | (e.length > 2 ? e.charCodeAt(2) : 0);
-            let o = [u.charAt(t >>> 18), u.charAt(t >>> 12 & 63), n >= 2 ? "=" : u.charAt(t >>> 6 & 63), n >= 1 ? "=" : u.charAt(63 & t)];
-            return o.join("");
+            let n = [0, 2, 1][e.length % 3]
+            let t = e.charCodeAt(0) << 16 | (e.length > 1 ? e.charCodeAt(1) : 0) << 8 | (e.length > 2 ? e.charCodeAt(2) : 0)
+            let o = [u.charAt(t >>> 18), u.charAt(t >>> 12 & 63), n >= 2 ? "=" : u.charAt(t >>> 6 & 63), n >= 1 ? "=" : u.charAt(63 & t)]
+            return o.join("")
         }
 
         function h(e) {
-            return e.replace(/[\s\S]{1,3}/g, m);
+            return e.replace(/[\s\S]{1,3}/g, m)
         }
 
         function p() {
-            return h(g((new Date()).getTime()));
+            return h(g((new Date()).getTime()))
         }
 
         function w(e, n) {
-            return n ? p(String(e)).replace(/[+\/]/g, function (e) {
-                return "+" == e ? "-" : "_";
-            }).replace(/=/g, "") : p(String(e));
+            return n ? p(String(e)).replace(/[+\/]/g, (e) => {
+                return "+" == e ? "-" : "_"
+            }).replace(/=/g, "") : p(String(e))
         }
 
-        return w(getCookie(name));
+        return w(getCookie(name))
     }
 
+    function rpcSetting() {
+        let dom = ''
+        dom += '<div class="flex-center-between"><label for="rpcDomain" style="margin-right: 5px;flex: 0 0 100px;">主机：</label><input type="text" id="rpcDomain" value="' + ariaRPC.domain + '" class="swal2-input" placeholder="http://localhost"></div>'
+        dom += '<div class="flex-center-between"><label for="rpcPort" style="margin-right: 5px;flex: 0 0 100px;">端口：</label><input type="text" id="rpcPort" value="' + ariaRPC.port + '" class="swal2-input" placeholder="6800"></div>'
+        dom += '<div class="flex-center-between"><label for="rpcToken" style="margin-right: 5px;flex: 0 0 100px;">密钥：</label><input type="text" id="rpcToken" value="' + ariaRPC.token + '" class="swal2-input" placeholder="没有留空"></div>'
+        dom += '<div class="flex-center-between"><label for="rpcDir" style="margin-right: 5px;flex: 0 0 100px;">下载路径：</label><input type="text" id="rpcDir" value="' + ariaRPC.dir + '" class="swal2-input" placeholder="默认为D:\"></div>'
+        dom = '<div>' + dom + '</div>'
+        let $dom = $(dom)
+
+        Swal.fire({
+              title: 'RPC配置',
+              allowOutsideClick: false,
+              html: $dom[0],
+              showCancelButton: true,
+              confirmButtonText: '保存',
+              cancelButtonText: '取消',
+              footer: '不会配置？<a href="https://www.baiduyun.wiki/zh-cn/rpc.html" target="_blank">点我</a>'
+          }
+        ).then((result) => {
+            if (result.value) {
+                ariaRPC.domain = $('#rpcDomain').val()
+                ariaRPC.port = $('#rpcPort').val()
+                ariaRPC.token = $('#rpcToken').val()
+                ariaRPC.dir = $('#rpcDir').val()
+                setValue('rpcDomain', ariaRPC.domain)
+                setValue('rpcPort', ariaRPC.port)
+                setValue('rpcToken', ariaRPC.token)
+                setValue('rpcDir', ariaRPC.dir)
+                Toast.fire({
+                    text: '设置成功',
+                    icon: 'success'
+                })
+            }
+        })
+    }
+
     function Dialog() {
-        let linkList = [];
-        let showParams;
-        let dialog, shadow;
+        let linkList = []
+        let showParams
+        let dialog, shadow
 
         function createDialog() {
-            let screenWidth = document.body.clientWidth;
-            let dialogLeft = screenWidth > 800 ? (screenWidth - 800) / 2 : 0;
-            let $dialog_div = $('<div class="dialog" style="width: 800px; top: 0px; bottom: auto; left: ' + dialogLeft + 'px; right: auto; display: hidden; visibility: visible; z-index: 52;"></div>');
-            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-title" style="display:inline-block;width:740px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis"></span></h3></div>');
-            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close">×</span></div>');
-            let $dialog_body = $('<div class="dialog-body"></div>');
-            let $dialog_tip = $('<div class="dialog-tip"><p></p></div>');
+            let screenWidth = document.body.clientWidth
+            let dialogLeft = screenWidth > 800 ? (screenWidth - 800) / 2 : 0
+            let $dialog_div = $('<div class="dialog" style="width: 800px; top: 0px; bottom: auto; left: ' + dialogLeft + 'px; right: auto; display: hidden; visibility: visible; z-index: 52;"></div>')
+            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-title" style="display:inline-block;width:740px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis"></span></h3></div>')
+            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close">×</span></div>')
+            let $dialog_body = $('<div class="dialog-body"></div>')
+            let $dialog_tip = $('<div class="dialog-tip"><p></p></div>')
 
-            $dialog_div.append($dialog_header.append($dialog_control)).append($dialog_body);
+            $dialog_div.append($dialog_header.append($dialog_control)).append($dialog_body)
 
-            let $dialog_button = $('<div class="dialog-button" style="display:none"></div>');
-            let $dialog_button_div = $('<div style="display:table;margin:auto"></div>');
-            let $dialog_copy_button = $('<button id="dialog-copy-button">复制全部默认链接</button>');
-            let $dialog_edit_button = $('<button id="dialog-edit-button" style="display:none">编辑</button>');
-            let $dialog_exit_button = $('<button id="dialog-exit-button" style="display:none">退出</button>');
+            let $dialog_button = $('<div class="dialog-button" style="display:none"></div>')
+            let $dialog_button_div = $('<div style="display:table;margin:auto"></div>')
+            let $dialog_copy_button = $('<button id="dialog-copy-button" style="display:none">复制全部默认链接</button>')
+            let $dialog_send_button = $('<button id="dialog-send-button" class="send-all" style="display:none">发送全部</button>')
+            let $dialog_rpc_button = $('<button id="dialog-rpc-button" class="rpc-setting" style="display:none">配置RPC服务</button>')
 
-            $dialog_button_div.append($dialog_copy_button).append($dialog_edit_button).append($dialog_exit_button);
-            $dialog_button.append($dialog_button_div);
-            $dialog_div.append($dialog_button);
+            $dialog_button_div.append($dialog_copy_button).append($dialog_send_button).append($dialog_rpc_button)
+            $dialog_button.append($dialog_button_div)
+            $dialog_div.append($dialog_button)
 
-            $dialog_copy_button.click(function () {
-                let content = '';
-                if (showParams.type == 'batch') {
-                    $.each(linkList, function (index, element) {
-                        if (index == linkList.length - 1)
-                            content += element.downloadlink[0];
+            $dialog_copy_button.click(() => {
+                let content = ''
+                if (showParams.type === 'batch') {
+                    $.each(linkList, (index, element) => {
+                        if (index === linkList.length - 1)
+                            content += element.downloadlink[0]
                         else
-                            content += element.downloadlink[0] + '\r\n';
-                    });
+                            content += element.downloadlink[0] + '\r\n'
+                    })
                 }
-                if (showParams.type == 'batchAria') {
-                    $.each(linkList, function (index, element) {
-                        if (index == linkList.length - 1)
-                            content += decodeURIComponent(aria2c(element.downloadlink[0], element.filename, userAgentDefault));
+                if (showParams.type === 'batchAria') {
+                    $.each(linkList, (index, element) => {
+                        if (index === linkList.length - 1)
+                            content += decodeURIComponent(aria2c(element.dlink, element.filename, userAgent))
                         else
-                            content += decodeURIComponent(aria2c(element.downloadlink[0], element.filename, userAgentDefault) + '\r\n');
-                    });
+                            content += decodeURIComponent(aria2c(element.dlink, element.filename, userAgent) + '\r\n')
+                    })
                 }
-                if (showParams.type == 'rpc') {
-                    $.each(linkList, function (index, element) {
-                        if (element.downloadlink == 'error')
-                            return;
-                        if (index == linkList.length - 1)
-                            content += element.downloadlink;
+                if (showParams.type === 'rpc') {
+                    $.each(linkList, (index, element) => {
+                        if (index === linkList.length - 1)
+                            content += element.downloadlink
                         else
-                            content += element.downloadlink + '\r\n';
-                    });
+                            content += element.downloadlink + '\r\n'
+                    })
                 }
-                if (showParams.type == 'shareLink') {
-                    $.each(linkList, function (index, element) {
+                if (showParams.type === 'shareLink') {
+                    $.each(linkList, (index, element) => {
                         if (element.dlink == 'error')
-                            return;
+                            return
                         if (index == linkList.length - 1)
-                            content += element.dlink;
+                            content += element.dlink
                         else
-                            content += element.dlink + '\r\n';
-                    });
+                            content += element.dlink + '\r\n'
+                    })
                 }
                 if (showParams.type == 'shareAriaLink') {
-                    $.each(linkList, function (index, element) {
+                    $.each(linkList, (index, element) => {
                         if (element.dlink == 'error')
-                            return;
+                            return
                         if (index == linkList.length - 1)
-                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename));
+                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename))
                         else
-                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename) + '\r\n');
-                    });
+                            content += decodeURIComponent(aria2c(element.dlink, element.server_filename) + '\r\n')
+                    })
                 }
-                GM_setClipboard(content, 'text');
+                GM_setClipboard(content, 'text')
                 if (content != '') {
                     Toast.fire({
                         icon: 'success',
                         text: '已将链接复制到剪贴板！'
-                    });
+                    })
 
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: '复制失败，请手动复制！'
-                    });
+                    })
                 }
-            });
+            })
 
-            $dialog_edit_button.click(function () {
-                let $dialog_textarea = $('div.dialog-body textarea[name=dialog-textarea]', dialog);
-                let $dialog_item = $('div.dialog-body div', dialog);
-                $dialog_item.hide();
-                $dialog_copy_button.hide();
-                $dialog_edit_button.hide();
-                $dialog_textarea.show();
-                $dialog_radio_div.show();
-                $dialog_exit_button.show();
-            });
-
-            $dialog_exit_button.click(function () {
-                let $dialog_textarea = $('div.dialog-body textarea[name=dialog-textarea]', dialog);
-                let $dialog_item = $('div.dialog-body div', dialog);
-                $dialog_textarea.hide();
-                $dialog_radio_div.hide();
-                $dialog_item.show();
-                $dialog_exit_button.hide();
-                $dialog_copy_button.show();
-                $dialog_edit_button.show();
-            });
-
-            $dialog_div.append($dialog_tip);
-            $('body').append($dialog_div);
-            $dialog_control.click(dialogControl);
-            return $dialog_div;
+            $dialog_div.append($dialog_tip)
+            $('body').append($dialog_div)
+            $dialog_control.click(dialogControl)
+            return $dialog_div
         }
 
         function createShadow() {
-            let $shadow = $('<div class="dialog-shadow" style="position: fixed; left: 0px; top: 0px; z-index: 50; background: rgb(0, 0, 0) none repeat scroll 0% 0%; opacity: 0.5; width: 100%; height: 100%; display: none;"></div>');
-            $('body').append($shadow);
-            return $shadow;
+            let $shadow = $('<div class="dialog-shadow" style="position: fixed; left: 0px; top: 0px; z-index: 50; background: rgb(0, 0, 0) none repeat scroll 0% 0%; opacity: 0.5; width: 100%; height: 100%; display: none;"></div>')
+            $('body').append($shadow)
+            return $shadow
         }
 
-        this.open = function (params) {
-            showParams = params;
-            linkList = [];
+        this.open = (params) => {
+            showParams = params
+            linkList = []
             if (params.type == 'link') {
-                linkList = params.list.urls;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title + "：" + params.list.filename);
-                $.each(params.list.urls, function (index, element) {
-                    element.url = replaceLink(element.url);
-                    let $div = $('<div><div style="width:30px;float:left">' + element.rank + ':</div><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><a href="' + element.url + '">' + element.url + '</a></div></div>');
+                linkList = params.list.urls
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title + "：" + params.list.filename)
+                $.each(params.list.urls, (index, element) => {
+                    element.url = replaceLink(element.url)
+                    let $div = $('<div><div style="width:30px;float:left">' + element.rank + ':</div><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><a href="' + element.url + '">' + element.url + '</a></div></div>')
 
-                    $('div.dialog-body', dialog).append($div);
-                });
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
 
             //批量下载 - 我的网盘
-            if (params.type == 'batch' || params.type == 'batchAria' || params.type == 'batchAriaRPC') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.filename + '">' + element.filename + '</div><span>：</span></div>');
-                    if (params.type == 'batch') {  //API
-                        $.each(element.downloadlink, function (i, e) {
+            if (params.type === 'batch' || params.type === 'batchAria' || params.type === 'batchAriaRPC' || params.type === 'pcs') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.filename + '">' + element.filename + '</div><span>：</span></div>')
+                    if (params.type === 'batch') {  //API
+                        $.each(element.downloadlink, (i, e) => {
                             if (i === 0) {
-                                $div.append($('<a class="ui-link api-link" href="' + e + '" data-link=' + e + '>默认链接</a>'));
+                                $div.append($('<a class="ui-link api-link" href="' + e + '" data-link=' + e + '>默认链接</a>'))
                             } else {
                                 if (getValue('SETTING_B'))
-                                    $div.append($('<a class="ui-link api-link" href="' + e + '"  data-link=' + e + '>备用链接' + number[i] + '</a>'));
+                                    $div.append($('<a class="ui-link api-link" href="' + e + '"  data-link=' + e + '>备用链接' + number[i] + '</a>'))
                             }
-                        });
+                        })
                     }
-                    if (params.type == 'batchAria') {  //Aria下载
-                        $.each(element.downloadlink, function (i, e) {
-                            let link = aria2c(e, element.filename, userAgentDefault);
-                            if (i === 0) {
-                                $div.append($('<a class="ui-link aria-link" data-link=' + link + ' href="javascript:;">默认链接</a>'));
-                            } else {
-                                if (getValue('SETTING_B'))
-                                    $div.append($('<a class="ui-link aria-link" data-link=' + link + ' href="javascript:;">备用链接' + number[i] + '</a>'));
-                            }
-                        });
+                    if (params.type === 'pcs') {  //PCS
+                        $div.append($('<a class="ui-link pcs-link" data-filename=' + element.filename + ' data-link=' + element.dlink + ' href="javascript:;">' + element.dlink + '</a>'))
                     }
-                    if (params.type == 'batchAriaRPC') {
-                        $.each(element.downloadlink, function (i, e) {
-                            if (i === 0) {
-                                $div.append($('<a href="javascript:;" class="ui-link aria-rpc" data-link="' + e + '" data-filename="' + element.filename + '">发送默认</a>'));
-                            } else {
-                                if (getValue('SETTING_B'))
-                                    $div.append($('<a href="javascript:;" class="ui-link aria-rpc" data-link="' + e + '" data-filename="' + element.filename + '">发送备用' + number[i] + '</a>'));
-                            }
-                        });
+                    if (params.type === 'batchAria') {  //Aria下载
+                        let link = decodeURIComponent(aria2c(element.dlink, element.filename, userAgent))
+                        $div.append($('<a class="ui-link aria-link" href="javascript:;">' + link + '</a>'))
                     }
-                    $('div.dialog-body', dialog).append($div);
-                });
+                    if (params.type === 'batchAriaRPC') {
+                        $div.append($('<button class="aria-rpc" data-link="' + element.dlink + '" data-filename="' + element.filename + '">点击发送到Aria下载器</button>'))
+                    }
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
-            if (params.type == 'shareLink') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    element.dlink = replaceLink(element.dlink);
-                    if (element.isdir == 1) return;
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="' + element.dlink + '" class="share-download">' + element.dlink + '</a></div>');
-                    $('div.dialog-body', dialog).append($div);
-                });
+            if (params.type === 'shareLink') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    element.dlink = replaceLink(element.dlink)
+                    if (element.isdir == 1) return
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="' + element.dlink + '" class="share-download">' + element.dlink + '</a></div>')
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
-            if (params.type == 'rpcLink') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    element.dlink = replaceLink(element.dlink);
-                    if (element.isdir == 1) return;
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><button class="aria-rpc" data-link="' + element.dlink + '" data-filename="' + element.server_filename + '">点击发送到Aria</button></div>');
-                    $('div.dialog-body', dialog).append($div);
-                });
+            if (params.type === 'rpcLink') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    element.dlink = replaceLink(element.dlink)
+                    if (element.isdir == 1) return
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><button class="aria-rpc" data-link="' + element.dlink + '" data-filename="' + element.server_filename + '">点击发送到Aria下载器</button></div>')
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
-            if (params.type == 'shareAriaLink') {
-                linkList = params.list;
-                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title);
-                $.each(params.list, function (index, element) {
-                    if (element.isdir == 1) return;
-                    let link = decodeURIComponent(aria2c(element.dlink, element.server_filename));
-                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="javasctipt:void(0)" class="aria-link">' + link + '</a></div>');
-                    $('div.dialog-body', dialog).append($div);
-                });
+            if (params.type === 'shareAriaLink') {
+                linkList = params.list
+                $('div.dialog-header h3 span.dialog-title', dialog).text(params.title)
+                $.each(params.list, (index, element) => {
+                    if (element.isdir == 1) return
+                    let link = decodeURIComponent(aria2c(element.dlink, element.server_filename))
+                    let $div = $('<div class="row"><div class="ui-title" title="' + element.server_filename + '">' + element.server_filename + '</div><span>：</span><a href="javasctipt:void(0)" class="aria-link">' + link + '</a></div>')
+                    $('div.dialog-body', dialog).append($div)
+                })
             }
 
             if (params.tip) {
-                $('div.dialog-tip p', dialog).html(params.tip);
+                $('div.dialog-tip p', dialog).html(params.tip)
             }
 
             if (params.showcopy) {
-                $('div.dialog-button', dialog).show();
-                $('div.dialog-button button#dialog-copy-button', dialog).show();
+                $('div.dialog-button', dialog).show()
+                $('div.dialog-button #dialog-copy-button', dialog).show()
             }
-            shadow.show();
-            dialog.show();
-        };
 
-        this.close = function () {
-            dialogControl();
-        };
+            if (params.showrpc){
+                $('div.dialog-button', dialog).show()
+                $('div.dialog-button #dialog-send-button', dialog).show()
+                $('div.dialog-button #dialog-rpc-button', dialog).show()
+            }
 
+            shadow.show()
+            dialog.show()
+        }
+
+        this.close = () => {
+            dialogControl()
+        }
+
         function dialogControl() {
-            $('div.dialog-body', dialog).children().remove();
-            $('div.dialog-header h3 span.dialog-title', dialog).text('');
-            $('div.dialog-tip p', dialog).text('');
-            $('div.dialog-button', dialog).hide();
-            $('div.dialog-radio input[type=radio][name=showmode][value=multi]', dialog).prop('checked', true);
-            $('div.dialog-radio', dialog).hide();
-            $('div.dialog-button button#dialog-copy-button', dialog).hide();
-            $('div.dialog-button button#dialog-edit-button', dialog).hide();
-            $('div.dialog-button button#dialog-exit-button', dialog).hide();
-            dialog.hide();
-            shadow.hide();
+            $('div.dialog-body', dialog).children().remove()
+            $('div.dialog-header h3 span.dialog-title', dialog).text('')
+            $('div.dialog-tip p', dialog).text('')
+            $('div.dialog-button', dialog).hide()
+            $('div.dialog-button button#dialog-copy-button', dialog).hide()
+            $('div.dialog-button button#dialog-send-button', dialog).hide()
+            $('div.dialog-button button#dialog-rpc-button', dialog).hide()
+            dialog.hide()
+            shadow.hide()
         }
 
-        dialog = createDialog();
-        shadow = createShadow();
+        dialog = createDialog()
+        shadow = createShadow()
     }
 
     function VCodeDialog(refreshVCode, confirmClick) {
-        let dialog, shadow;
+        let dialog, shadow
 
         function createDialog() {
-            let screenWidth = document.body.clientWidth;
-            let dialogLeft = screenWidth > 520 ? (screenWidth - 520) / 2 : 0;
-            let $dialog_div = $('<div class="dialog" id="dialog-vcode" style="width:520px;top:0px;bottom:auto;left:' + dialogLeft + 'px;right:auto;display:none;visibility:visible;z-index:52"></div>');
-            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-header-title"><em class="select-text">提示</em></span></h3></div>');
-            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">x</span></span></div>');
-            let $dialog_body = $('<div class="dialog-body"></div>');
-            let $dialog_body_div = $('<div style="text-align:center;padding:22px"></div>');
-            let $dialog_body_download_verify = $('<div class="download-verify" style="margin-top:10px;padding:0 28px;text-align:left;font-size:12px;"></div>');
-            let $dialog_verify_body = $('<div class="verify-body">请输入验证码：</div>');
-            let $dialog_input = $('<input id="dialog-input" type="text" style="padding:3px;width:85px;height:23px;border:1px solid #c6c6c6;background-color:white;vertical-align:middle;" class="input-code" maxlength="4">');
-            let $dialog_img = $('<img id="dialog-img" class="img-code" style="margin-left:10px;vertical-align:middle;" alt="点击换一张" src="" width="100" height="30">');
-            let $dialog_refresh = $('<a href="javascript:;" style="text-decoration:underline;" class="underline">换一张</a>');
-            let $dialog_err = $('<div id="dialog-err" style="padding-left:84px;height:18px;color:#d80000" class="verify-error"></div>');
-            let $dialog_footer = $('<div class="dialog-footer g-clearfix"></div>');
-            let $dialog_confirm_button = $('<a class="g-button g-button-blue" data-button-id="" data-button-index href="javascript:;" style="padding-left:36px"><span class="g-button-right" style="padding-right:36px;"><span class="text" style="width:auto;">确定</span></span></a>');
-            let $dialog_cancel_button = $('<a class="g-button" data-button-id="" data-button-index href="javascript:;" style="padding-left: 36px;"><span class="g-button-right" style="padding-right: 36px;"><span class="text" style="width: auto;">取消</span></span></a>');
+            let screenWidth = document.body.clientWidth
+            let dialogLeft = screenWidth > 520 ? (screenWidth - 520) / 2 : 0
+            let $dialog_div = $('<div class="dialog" id="dialog-vcode" style="width:520px;top:0px;bottom:auto;left:' + dialogLeft + 'px;right:auto;display:none;visibility:visible;z-index:52"></div>')
+            let $dialog_header = $('<div class="dialog-header"><h3><span class="dialog-header-title"><em class="select-text">提示</em></span></h3></div>')
+            let $dialog_control = $('<div class="dialog-control"><span class="dialog-icon dialog-close icon icon-close"><span class="sicon">x</span></span></div>')
+            let $dialog_body = $('<div class="dialog-body"></div>')
+            let $dialog_body_div = $('<div style="text-align:center;padding:22px"></div>')
+            let $dialog_body_download_verify = $('<div class="download-verify" style="margin-top:10px;padding:0 28px;text-align:left;font-size:12px;"></div>')
+            let $dialog_verify_body = $('<div class="verify-body">请输入验证码：</div>')
+            let $dialog_input = $('<input id="dialog-input" type="text" style="padding:3px;width:85px;height:23px;border:1px solid #c6c6c6;background-color:white;vertical-align:middle;" class="input-code" maxlength="4">')
+            let $dialog_img = $('<img id="dialog-img" class="img-code" style="margin-left:10px;vertical-align:middle;" alt="点击换一张" src="" width="100" height="30">')
+            let $dialog_refresh = $('<a href="javascript:;" style="text-decoration:underline;" class="underline">换一张</a>')
+            let $dialog_err = $('<div id="dialog-err" style="padding-left:84px;height:18px;color:#d80000" class="verify-error"></div>')
+            let $dialog_footer = $('<div class="dialog-footer g-clearfix"></div>')
+            let $dialog_confirm_button = $('<a class="g-button g-button-blue" data-button-id="" data-button-index href="javascript:;" style="padding-left:36px"><span class="g-button-right" style="padding-right:36px;"><span class="text" style="width:auto;">确定</span></span></a>')
+            let $dialog_cancel_button = $('<a class="g-button" data-button-id="" data-button-index href="javascript:;" style="padding-left: 36px;"><span class="g-button-right" style="padding-right: 36px;"><span class="text" style="width: auto;">取消</span></span></a>')
 
-            $dialog_header.append($dialog_control);
-            $dialog_verify_body.append($dialog_input).append($dialog_img).append($dialog_refresh);
-            $dialog_body_download_verify.append($dialog_verify_body).append($dialog_err);
-            $dialog_body_div.append($dialog_body_download_verify);
-            $dialog_body.append($dialog_body_div);
-            $dialog_footer.append($dialog_confirm_button).append($dialog_cancel_button);
-            $dialog_div.append($dialog_header).append($dialog_body).append($dialog_footer);
-            $('body').append($dialog_div);
+            $dialog_header.append($dialog_control)
+            $dialog_verify_body.append($dialog_input).append($dialog_img).append($dialog_refresh)
+            $dialog_body_download_verify.append($dialog_verify_body).append($dialog_err)
+            $dialog_body_div.append($dialog_body_download_verify)
+            $dialog_body.append($dialog_body_div)
+            $dialog_footer.append($dialog_confirm_button).append($dialog_cancel_button)
+            $dialog_div.append($dialog_header).append($dialog_body).append($dialog_footer)
+            $('body').append($dialog_div)
 
-            $dialog_control.click(dialogControl);
-            $dialog_img.click(refreshVCode);
-            $dialog_refresh.click(refreshVCode);
-            $dialog_input.keypress(function (event) {
+            $dialog_control.click(dialogControl)
+            $dialog_img.click(refreshVCode)
+            $dialog_refresh.click(refreshVCode)
+            $dialog_input.keypress((event) => {
                 if (event.which == 13)
-                    confirmClick();
-            });
-            $dialog_confirm_button.click(confirmClick);
-            $dialog_cancel_button.click(dialogControl);
-            $dialog_input.click(function () {
-                $('#dialog-err').text('');
-            });
-            return $dialog_div;
+                    confirmClick()
+            })
+            $dialog_confirm_button.click(confirmClick)
+            $dialog_cancel_button.click(dialogControl)
+            $dialog_input.click(() => {
+                $('#dialog-err').text('')
+            })
+            return $dialog_div
         }
 
-        this.open = function (vcode) {
+        this.open = (vcode) => {
             if (vcode)
-                $('#dialog-img').attr('src', vcode.img);
-            dialog.show();
-            shadow.show();
-        };
-        this.close = function () {
-            dialogControl();
-        };
-        dialog = createDialog();
-        shadow = $('div.dialog-shadow');
+                $('#dialog-img').attr('src', vcode.img)
+            dialog.show()
+            shadow.show()
+        }
+        this.close = () => {
+            dialogControl()
+        }
+        dialog = createDialog()
+        shadow = $('div.dialog-shadow')
 
         function dialogControl() {
-            $('#dialog-img', dialog).attr('src', '');
-            $('#dialog-err').text('');
-            dialog.hide();
-            shadow.hide();
+            $('#dialog-img', dialog).attr('src', '')
+            $('#dialog-err').text('')
+            dialog.hide()
+            shadow.hide()
         }
     }
 
     //网盘页面的下载助手
     function PanHelper() {
-        let yunData, sign, timestamp, bdstoken, logid, fid_list;
-        let fileList = [], selectFileList = [], batchLinkList = [], batchLinkListAll = [], linkList = [];
-        let dialog, searchKey;
-        let panAPIUrl = location.protocol + "//" + location.host + "/api/";
-        let restAPIUrl = location.protocol + "//pcs.baidu.com/rest/2.0/pcs/";
-        let clientAPIUrl = location.protocol + "//d.pcs.baidu.com/rest/2.0/pcs/";
+        let yunData, sign, timestamp, bdstoken, logid, fid_list
+        let fileList = [], selectFileList = [], batchLinkList = [], batchLinkListAll = [], linkList = []
+        let dialog, searchKey
+        let panAPIUrl = location.protocol + "//" + location.host + "/api/"
+        let restAPIUrl = location.protocol + "//pcs.baidu.com/rest/2.0/pcs/"
+        let clientAPIUrl = location.protocol + "//pan.baidu.com/rest/2.0/"
 
-        this.init = function () {
-            yunData = unsafeWindow.yunData;
-            clog('初始化信息:', yunData);
+        this.init = () => {
+            yunData = unsafeWindow.yunData
+            clog('初始化信息:', yunData)
             if (yunData === undefined) {
-                clog('页面未正常加载，或者百度已经更新！');
-                return false;
+                clog('页面未正常加载，或者百度已经更新！')
+                return false
             }
-            initVar();
-            registerEventListener();
-            addButton();
-            createIframe();
-            dialog = new Dialog({addCopy: true});
-            clog('下载助手加载成功！当前版本：', version);
-        };
+            initVar()
+            registerEventListener()
+            addButton()
+            createIframe()
+            dialog = new Dialog({addCopy: true})
+            clog('下载助手加载成功！当前版本：', version)
+        }
 
         //获取选中文件
         function getSelectedFile() {
-            return require("disk-system:widget/pageModule/list/listInit.js").getCheckedItems();
+            return require("disk-system:widget/pageModule/list/listInit.js").getCheckedItems()
         }
 
         //初始化变量
         function initVar() {
-            sign = getSign();
-            timestamp = yunData.timestamp;
-            bdstoken = yunData.MYBDSTOKEN;
-            logid = getLogID();
+            sign = getSign()
+            timestamp = yunData.timestamp
+            bdstoken = yunData.MYBDSTOKEN
+            logid = getLogID()
         }
 
         function registerEventListener() {
-            registerDownload();
-        }
-
-        //下载事件
-        function registerDownload() {
-            $(document).on('click', '.api-link', function (e) {
-                e.preventDefault();
+            $(document).on('click', '.api-link', (e) => {
+                e.preventDefault()
                 if (e.target.dataset.link) {
-                    execDownload(e.target.dataset.link);
+                    execDownload(e.target.dataset.link)
                 }
-            });
-            $(document).on('click', '.aria-rpc', function (e) {
-                let link = e.target.dataset.link;
-                let filename = e.target.dataset.filename;
-                let headers = {};
-                if (!isSuperVIP()) {  //普通用户需要设置userAgentDefault为空
-                    headers = {
-                        "User-Agent": userAgent
-                    };
+            })
+            $(document).on('click', '.aria-rpc', (e) => {
+                $(e.target).addClass('clicked')
+                let link = e.target.dataset.link
+                let filename = e.target.dataset.filename
+
+                let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc'
+                let json_rpc = {
+                    id: new Date().getTime(),
+                    jsonrpc: '2.0',
+                    method: 'aria2.addUri',
+                    params: [
+                        "token:" + ariaRPC.token,
+                        [link],
+                        {
+                            dir: ariaRPC.dir,
+                            out: filename,
+                            header: ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
+                        }
+                    ]
                 }
 
                 GM_xmlhttpRequest({
-                    method: "HEAD",
-                    headers: headers,
-                    url: e.target.dataset.link,
-                    onload: function (res) {
-                        let finalUrl = res.finalUrl;
-                        if (finalUrl) {
-                            let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc';
-                            let json_rpc = {
-                                id: new Date().getTime(),
-                                jsonrpc: '2.0',
-                                method: 'aria2.addUri',
-                                params: [
-                                    "token:" + ariaRPC.token,
-                                    [finalUrl],
-                                    {
-                                        dir: ariaRPC.dir,
-                                        out: filename,
-                                        header: isSuperVIP() ? ['User-Agent:' + userAgentDefault, 'Cookie: BDUSS=' + getBDUSS()] : ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
-                                    }
-                                ]
-                            };
-
-                            GM_xmlhttpRequest({
-                                method: "POST",
-                                headers: {
-                                    "User-Agent": userAgent
-                                },
-                                url: url,
-                                responseType: 'json',
-                                timeout: 3000,
-                                data: JSON.stringify(json_rpc),
-                                onload: function (response) {
-                                    if (response.response.result) {
-                                        Toast.fire({
-                                            icon: 'success',
-                                            title: '任务已发送至RPC下载器'
-                                        });
-                                    } else {
-                                        Toast.fire({
-                                            icon: 'error',
-                                            title: response.response.message
-                                        });
-                                    }
-                                },
-                                ontimeout: function () {
-                                    Toast.fire({
-                                        icon: 'error',
-                                        title: '无法连接到RPC服务，请检查RPC配置'
-                                    });
-                                }
-                            });
+                    method: "POST",
+                    headers: {"User-Agent": userAgent},
+                    url: url,
+                    responseType: 'json',
+                    timeout: 3000,
+                    data: JSON.stringify(json_rpc),
+                    onload: (response) => {
+                        if (response.response.result) {
+                            Toast.fire({
+                                icon: 'success',
+                                title: '任务已发送至RPC下载器'
+                            })
+                        } else {
+                            Toast.fire({
+                                icon: 'error',
+                                title: response.response.message
+                            })
                         }
                     },
-                });
-            });
+                    ontimeout: () => {
+                        Toast.fire({
+                            icon: 'error',
+                            title: '连接到RPC服务器超时，请检查RPC配置'
+                        })
+                    }
+                })
+            })
+            $(document).on('click','.rpc-setting',(e)=>{
+                rpcSetting()
+            })
+            $(document).on('click','.send-all',(e)=>{
+                $('.aria-rpc').click()
+                $('.dialog').hide()
+                $('.dialog-shadow').hide()
+            })
         }
 
         //我的网盘 - 添加助手按钮
         function addButton() {
-            $('div.' + classMap['bar-search']).css('width', '18%');
-            let $dropdownbutton = $('<span class="g-dropdown-button"></span>');
-            let $dropdownbutton_a = $('<a class="g-button g-button-blue" href="javascript:;"><span class="g-button-right"><em class="icon icon-picpre-download" title="百度网盘下载助手"></em><span class="text" style="width: 60px;">下载助手</span></span></a>');
-            let $dropdownbutton_span = $('<span class="menu" style="width:114px"></span>');
+            $('div.' + classMap['bar-search']).css('width', '18%')
+            let $dropdownbutton = $('<span class="g-dropdown-button"></span>')
+            let $dropdownbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><em class="icon icon-download"></em><span class="text" style="width: 60px;">下载助手</span></span></a>')
+            let $dropdownbutton_span = $('<span class="menu" style="width:114px"></span>')
 
-            let $directbutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $directbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $directbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">直链下载</span></span></a>');
-            let $directbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>');
-            let $directbutton_batchhttplink_button = $('<a id="batchhttplink-direct" class="g-button-menu" href="javascript:;">显示链接</a>');
-            $directbutton_menu.append($directbutton_batchhttplink_button);
-            $directbutton.append($directbutton_span.append($directbutton_a).append($directbutton_menu));
-            $directbutton.hover(function () {
-                $directbutton_span.toggleClass('button-open');
-            });
-            $directbutton_batchhttplink_button.click(batchClick);
+            let $directbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $directbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $directbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">直链下载</span></span></a>')
+            let $directbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $directbutton_batchhttplink_button = $('<a id="batchhttplink-direct" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $directbutton_menu.append($directbutton_batchhttplink_button)
+            $directbutton.append($directbutton_span.append($directbutton_a).append($directbutton_menu))
+            $directbutton.hover(() => {
+                $directbutton_span.toggleClass('button-open')
+            })
+            $directbutton_batchhttplink_button.click(batchClick)
 
-            let $ariadirectbutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $ariadirectbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $ariadirectbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">Aria下载</span></span></a>');
-            let $ariadirectbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>');
-            let $ariadirectbutton_batchhttplink_button = $('<a id="batchhttplink-aria" class="g-button-menu" href="javascript:;">显示链接</a>');
-            $ariadirectbutton_menu.append($ariadirectbutton_batchhttplink_button);
-            $ariadirectbutton.append($ariadirectbutton_span.append($ariadirectbutton_a).append($ariadirectbutton_menu));
-            $ariadirectbutton.hover(function () {
-                $ariadirectbutton_span.toggleClass('button-open');
-            });
-            $ariadirectbutton_batchhttplink_button.click(batchClick);
+            let $pcsbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $pcsbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $pcsbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">API下载</span></span></a>')
+            let $pcsbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $pcsbutton_batchhttplink_button = $('<a id="batchhttplink-pcs" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $pcsbutton_menu.append($pcsbutton_batchhttplink_button)
+            $pcsbutton.append($pcsbutton_span.append($pcsbutton_a).append($pcsbutton_menu))
+            $pcsbutton.hover(() => {
+                $pcsbutton_span.toggleClass('button-open')
+            })
+            $pcsbutton_batchhttplink_button.click(batchClick)
 
-            let $ariarpcbutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $ariarpcbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $ariarpcbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">RPC下载</span></span></a>');
-            let $ariarpcbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>');
-            let $ariarpcbutton_batchhttplink_button = $('<a id="batchhttplink-rpc" class="g-button-menu" href="javascript:;">显示链接</a>');
-            let $ariarpcbutton_setting_button = $('<a class="g-button-menu" href="javascript:;">RPC配置</a>');
-            $ariarpcbutton_menu.append($ariarpcbutton_batchhttplink_button).append($ariarpcbutton_setting_button);
-            $ariarpcbutton.append($ariarpcbutton_span.append($ariarpcbutton_a).append($ariarpcbutton_menu));
-            $ariarpcbutton.hover(function () {
-                $ariarpcbutton_span.toggleClass('button-open');
-            });
-            $ariarpcbutton_batchhttplink_button.click(batchClick);
-            $ariarpcbutton_setting_button.click(rpcSetting);
+            let $ariadirectbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $ariadirectbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $ariadirectbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">Aria下载</span></span></a>')
+            let $ariadirectbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $ariadirectbutton_batchhttplink_button = $('<a id="batchhttplink-aria" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $ariadirectbutton_menu.append($ariadirectbutton_batchhttplink_button)
+            $ariadirectbutton.append($ariadirectbutton_span.append($ariadirectbutton_a).append($ariadirectbutton_menu))
+            $ariadirectbutton.hover(() => {
+                $ariadirectbutton_span.toggleClass('button-open')
+            })
+            $ariadirectbutton_batchhttplink_button.click(batchClick)
 
-            let $apibutton = $('<span class="g-button-menu" style="display:block"></span>');
-            let $apibutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>');
-            let $apibutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">API下载</span></span></a>');
-            let $apibutton_menu = $('<span class="menu" style="width:120px;left:77px"></span>');
-            let $apibutton_download_button = $('<a id="download-api" class="g-button-menu" href="javascript:;">直接下载</a>');
-            let $apibutton_batchhttplink_button = $('<a id="batchhttplink-api" class="g-button-menu" href="javascript:;">显示链接</a>');
-            let $setting_button = $('<a id="appid-setting" class="g-button-menu" href="javascript:;">神秘代码</a>');
-            let $default_setting = $('<a id="default-setting" class="g-button-menu" href="javascript:;" style="color: #999;">恢复默认</a>');
-            $apibutton_menu.append($apibutton_download_button).append($apibutton_batchhttplink_button)/*.append($setting_button).append($default_setting)*/;
-            let $versionButton = $('<a style="color: #e85653;font-weight: 700;" class="g-button-menu" href="javascript:;">Ver ' + version + '</a>');
+            let $ariarpcbutton = $('<span class="g-button-menu" style="display:block"></span>')
+            let $ariarpcbutton_span = $('<span class="g-dropdown-button g-dropdown-button-second" menulevel="2"></span>')
+            let $ariarpcbutton_a = $('<a class="g-button" href="javascript:;"><span class="g-button-right"><span class="text" style="width:auto">RPC下载</span></span></a>')
+            let $ariarpcbutton_menu = $('<span class="menu" style="width:120px;left:79px"></span>')
+            let $ariarpcbutton_batchhttplink_button = $('<a id="batchhttplink-rpc" class="g-button-menu" href="javascript:;">显示链接</a>')
+            $ariarpcbutton_menu.append($ariarpcbutton_batchhttplink_button)
+            $ariarpcbutton.append($ariarpcbutton_span.append($ariarpcbutton_a).append($ariarpcbutton_menu))
+            $ariarpcbutton.hover(() => {
+                $ariarpcbutton_span.toggleClass('button-open')
+            })
+            $ariarpcbutton_batchhttplink_button.click(batchClick)
 
-            $apibutton.append($apibutton_span.append($apibutton_a).append($apibutton_menu));
-            $apibutton.hover(function () {
-                $apibutton_span.toggleClass('button-open');
-            });
-            $apibutton_download_button.click(downloadClick);
-            $apibutton_batchhttplink_button.click(batchClick);
-            $setting_button.click(setSecretCode);
-            $default_setting.click(defaultSetting);
-            $versionButton.click(versionButtonClick);
-            $dropdownbutton_span.append($apibutton)/*.append($directbutton)*/.append($ariadirectbutton).append($ariarpcbutton).append($versionButton);
-            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span);
-            $dropdownbutton.hover(function () {
-                $dropdownbutton.toggleClass('button-open');
-            });
+            let $versionButton = $('<a style="color: #F24C43;" class="g-button-menu" target="_blank" href="https://www.baiduyun.wiki/install.html">发现新版本</a>');
 
-            $('.' + classMap['list-tools']).append($dropdownbutton);
-            $('.' + classMap['list-tools']).css('height', '40px');
-        }
+            $dropdownbutton_span.append($pcsbutton).append($ariadirectbutton).append($ariarpcbutton)
+            if (getValue('up')) {
+              $dropdownbutton_span.append($versionButton)
+            }
 
-        function rpcSetting() {
-            let dom = '';
-            dom += '<div class="flex-center-between"><label for="rpcDomain" style="margin-right: 5px;flex: 0 0 100px;">主机：</label><input type="text" id="rpcDomain" value="' + ariaRPC.domain + '" class="swal2-input" placeholder="http://localhost"></div>';
-            dom += '<div class="flex-center-between"><label for="rpcPort" style="margin-right: 5px;flex: 0 0 100px;">端口：</label><input type="text" id="rpcPort" value="' + ariaRPC.port + '" class="swal2-input" placeholder="6800"></div>';
-            dom += '<div class="flex-center-between"><label for="rpcToken" style="margin-right: 5px;flex: 0 0 100px;">密钥：</label><input type="text" id="rpcToken" value="' + ariaRPC.token + '" class="swal2-input" placeholder="没有留空"></div>';
-            dom += '<div class="flex-center-between"><label for="rpcDir" style="margin-right: 5px;flex: 0 0 100px;">下载路径：</label><input type="text" id="rpcDir" value="' + ariaRPC.dir + '" class="swal2-input" placeholder="默认为D:\"></div>';
-            dom = '<div>' + dom + '</div>';
-            let $dom = $(dom);
+            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span)
+            $dropdownbutton.hover(() => {
+                $dropdownbutton.toggleClass('button-open')
+            })
 
-            Swal.fire({
-                    title: 'RPC配置',
-                    allowOutsideClick: false,
-                    html: $dom[0],
-                    showCancelButton: true,
-                    confirmButtonText: '保存',
-                    cancelButtonText: '取消'
-                }
-            ).then((result) => {
-                if (result.value) {
-                    setValue('rpcDomain', $('#rpcDomain').val() ? $('#rpcDomain').val() : ariaRPC.domain);
-                    setValue('rpcPort', $('#rpcPort').val() ? $('#rpcPort').val() : ariaRPC.port);
-                    setValue('rpcToken', $('#rpcToken').val());
-                    setValue('rpcDir', $('#rpcDir').val() ? $('#rpcDir').val() : ariaRPC.dir);
-                    history.go(0);
-                }
-            });
+            $('.' + classMap['list-tools']).append($dropdownbutton)
+            $('.' + classMap['list-tools']).css('height', '40px')
         }
 
-        //设置神秘代码
-        function setSecretCode() {
-            Swal.fire({
-                title: '请输入神秘代码',
-                input: 'text',
-                inputValue: secretCode,
-                showCancelButton: true,
-                confirmButtonText: '确定',
-                cancelButtonText: '取消',
-                inputValidator: (value) => {
-                    if (value.length != 6) {
-                        return '请输入正确的神秘代码';
-                    }
-                }
-            }).then((result) => {
-                setValue('secretCodeV', result.value);
-                Toast.fire({
-                    icon: 'success',
-                    text: '神秘代码执行成功，3s后将自动刷新！'
-                }).then(() => {
-                    history.go(0);
-                });
-            });
-        }
-
-        function defaultSetting() {
-            setValue('secretCodeV', defaultCode);
-            Toast.fire({
-                text: '恢复默认成功，3s后将自动刷新',
-                icon: 'success'
-            }).then(() => {
-                history.go(0);
-            });
-        }
-
         function isSuperVIP() {
-            return yunData.ISSVIP === 1;
+            return yunData.ISSVIP === 1
         }
 
-        function versionButtonClick() {
-            let url = 'https://www.baiduyun.wiki';
-            GM_openInTab(url, {active: true});
-        }
-
         // 我的网盘 - 下载
         function downloadClick(event) {
-            selectFileList = getSelectedFile();
-            clog('选中文件列表：', selectFileList);
-            let id = event.target.id;
-            let downloadLink;
+            selectFileList = getSelectedFile()
+            clog('选中文件列表：', selectFileList)
+            let id = event.target.id
+            let downloadLink
 
             if (id == 'download-direct') {
-                let downloadType;
+                let downloadType
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 }
                 if (selectFileList.length == 1) {
-                    selectFileList[0].isdir === 1 ? downloadType = 'batch' : downloadType = 'dlink';
+                    selectFileList[0].isdir === 1 ? downloadType = 'batch' : downloadType = 'dlink'
                 }
                 if (selectFileList.length > 1) {
-                    downloadType = 'batch';
+                    downloadType = 'batch'
                 }
 
-                fid_list = getFidList(selectFileList);
-                let result = getDownloadLinkWithPanAPI(downloadType);
+                fid_list = getFidList(selectFileList)
+                let result = getDownloadLinkWithPanAPI(downloadType)
                 if (result.errno === 0) {
                     if (downloadType == 'dlink')
-                        downloadLink = result.dlink[0].dlink;
+                        downloadLink = result.dlink[0].dlink
                     else if (downloadType == 'batch') {
-                        downloadLink = result.dlink;
+                        downloadLink = result.dlink
                         if (selectFileList.length === 1)
-                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip';
+                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip'
                     } else {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.fail
-                        });
-                        return;
+                        })
+                        return
                     }
                 } else if (result.errno == -1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.deleted
-                    });
-                    return;
+                    })
+                    return
                 } else if (result.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
-                    return;
+                    })
+                    return
                 }
             } else {
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 } else if (selectFileList.length > 1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.morethan
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     if (selectFileList[0].isdir == 1) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.dir
-                        });
-                        return;
+                        })
+                        return
                     }
                 }
                 if (id == 'download-api') {
-                    downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path);
+                    downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path)
                 }
             }
-            execDownload(downloadLink);
+            execDownload(downloadLink)
         }
 
         //我的网盘 - 显示链接
         function linkClick(event) {
-            selectFileList = getSelectedFile();
-            clog('选中文件列表：', selectFileList);
-            let id = event.target.id;
-            let linkList, tip;
+            selectFileList = getSelectedFile()
+            clog('选中文件列表：', selectFileList)
+            let id = event.target.id
+            let linkList, tip
 
             if (id.indexOf('direct') != -1) {
-                let downloadType;
-                let downloadLink;
+                let downloadType
+                let downloadLink
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 } else if (selectFileList.length == 1) {
                     if (selectFileList[0].isdir === 1)
-                        downloadType = 'batch';
+                        downloadType = 'batch'
                     else if (selectFileList[0].isdir === 0)
-                        downloadType = 'dlink';
+                        downloadType = 'dlink'
                 } else if (selectFileList.length > 1) {
-                    downloadType = 'batch';
+                    downloadType = 'batch'
                 }
-                fid_list = getFidList(selectFileList);
-                let result = getDownloadLinkWithPanAPI(downloadType);
+                fid_list = getFidList(selectFileList)
+                let result = getDownloadLinkWithPanAPI(downloadType)
                 if (result.errno === 0) {
                     if (downloadType == 'dlink')
-                        downloadLink = result.dlink[0].dlink;
+                        downloadLink = result.dlink[0].dlink
                     else if (downloadType == 'batch') {
-                        clog('选中文件列表：', selectFileList);
-                        downloadLink = result.dlink;
+                        clog('选中文件列表：', selectFileList)
+                        downloadLink = result.dlink
                         if (selectFileList.length === 1)
-                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip';
+                            downloadLink = downloadLink + '&zipname=' + encodeURIComponent(selectFileList[0].server_filename) + '.zip'
                     } else {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.fail
-                        });
-                        return;
+                        })
+                        return
                     }
                 } else if (result.errno == -1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.deleted
-                    });
-                    return;
+                    })
+                    return
                 } else if (result.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
-                    return;
+                    })
+                    return
                 }
-                let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:');
-                let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:');
-                let filename = '';
-                $.each(selectFileList, function (index, element) {
+                let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:')
+                let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:')
+                let filename = ''
+                $.each(selectFileList, (index, element) => {
                     if (selectFileList.length == 1)
-                        filename = element.server_filename;
+                        filename = element.server_filename
                     else {
                         if (index == 0)
-                            filename = element.server_filename;
+                            filename = element.server_filename
                         else
-                            filename = filename + ',' + element.server_filename;
+                            filename = filename + ',' + element.server_filename
                     }
-                });
+                })
                 linkList = {
                     filename: filename,
                     urls: [
                         {url: httplink, rank: 1},
                         {url: httpslink, rank: 2}
                     ]
-                };
-                tip = '显示模拟百度网盘网页获取的链接，可以使用右键迅雷或IDM下载，多文件打包(限300k)下载的链接可以直接复制使用';
-                dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip});
+                }
+                tip = '显示百度网盘网页获取的链接，可以使用右键迅雷或IDM下载，多文件打包(限300k)下载的链接可以直接复制使用'
+                dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip})
             } else {
                 if (selectFileList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 } else if (selectFileList.length > 1) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.morethan
-                    });
-                    return;
+                    })
+                    return
                 } else {
                     if (selectFileList[0].isdir == 1) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.dir
-                        });
-                        return;
+                        })
+                        return
                     }
                 }
                 if (id.indexOf('api') != -1) {
-                    let downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path);
-                    let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:');
-                    let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:');
+                    let downloadLink = getDownloadLinkWithRESTAPIBaidu(selectFileList[0].path)
+                    let httplink = downloadLink.replace(/^([A-Za-z]+):/, 'http:')
+                    let httpslink = downloadLink.replace(/^([A-Za-z]+):/, 'https:')
                     linkList = {
                         filename: selectFileList[0].server_filename,
                         urls: [
                             {url: httplink, rank: 1},
                             {url: httpslink, rank: 2}
                         ]
-                    };
+                    }
 
-                    tip = '显示模拟APP获取的链接(使用百度云ID)，可以右键使用迅雷或IDM下载，直接复制链接无效';
-                    dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip});
+                    tip = '显示获取的链接(使用百度云ID)，可以右键使用迅雷或IDM下载，直接复制链接无效'
+                    dialog.open({title: '下载链接', type: 'link', list: linkList, tip: tip})
                 }
             }
         }
 
         // 我的网盘 - 批量下载
         function batchClick(event) {
-            selectFileList = getSelectedFile();
-            clog('选中文件列表：', selectFileList);
+            selectFileList = getSelectedFile()
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return;
+                })
+                return
             }
-            let id = event.target.id;
-            let linkType, tip;
-            linkType = id.indexOf('https') == -1 ? (id.indexOf('http') == -1 ? location.protocol + ':' : 'http:') : 'https:';
-            batchLinkList = [];
-            batchLinkListAll = [];
+            clog('选中文件列表：', selectFileList)
+            let id = event.target.id
+            let linkType, tip
+            linkType = id.indexOf('https') == -1 ? (id.indexOf('http') == -1 ? location.protocol + ':' : 'http:') : 'https:'
+            batchLinkList = []
+            batchLinkListAll = []
             if (id.indexOf('direct') > 0) {  //直链下载
-                batchLinkList = getDirectBatchLink(linkType);
-                let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>，本链接仅支持小文件下载（<300M）';
+                batchLinkList = getPCSBatchLink(linkType)
+                let tip = '点击链接直接下载，若下载失败，请尝试其他方法或参考 <a href="https://www.baiduyun.wiki/zh-cn/question.html">常见问题</a>'
                 if (batchLinkList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 }
-                dialog.open({title: '直链下载', type: 'batch', list: batchLinkList, tip: tip, showcopy: false});
+                dialog.open({title: '直链下载', type: 'batch', list: batchLinkList, tip: tip, showcopy: false})
             }
+            if (id.indexOf('pcs') > 0) {  //PCS下载
+                getPCSBatchLink((batchLinkList) => {
+                    let tip = '点击链接直接下载，若下载失败，请尝试其他方法或参考 <a href="https://www.baiduyun.wiki/zh-cn/question.html">常见问题</a>'
+                    if (batchLinkList.length === 0) {
+                        Toast.fire({
+                            icon: 'error',
+                            text: errorMsg.unselected
+                        })
+                        return
+                    }
+                    dialog.open({title: 'PCS下载', type: 'pcs', list: batchLinkList, tip: tip, showcopy: false})
+                })
+            }
             if (id.indexOf('aria') > 0) {  //ariaAPI下载
-                batchLinkList = getAPIBatchLink(linkType);
-                tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a href="http://pan.baiduyun.wiki/down">XDown</a>';
-                if (batchLinkList.length === 0) {
-                    Toast.fire({
-                        icon: 'error',
-                        text: errorMsg.unselected
-                    });
-                    return;
-                }
-                dialog.open({title: 'Aria链接', type: 'batchAria', list: batchLinkList, tip: tip, showcopy: true});
+                getPCSBatchLink((batchLinkList) => {
+                    tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a href="http://pan.baiduyun.wiki/down">XDown</a>'
+                    if (batchLinkList.length === 0) {
+                        Toast.fire({
+                            icon: 'error',
+                            text: errorMsg.unselected
+                        })
+                        return
+                    }
+                    dialog.open({title: 'Aria链接', type: 'batchAria', list: batchLinkList, tip: tip, showcopy: true})
+                })
             }
             if (id.indexOf('rpc') > 0) {  //ariaAPI下载
-                batchLinkList = getAPIBatchLink(linkType);
-                tip = '点击按钮发送链接至Aria下载器中<a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载，此功能建议配合百度会员使用';
-                if (batchLinkList.length === 0) {
-                    Toast.fire({
-                        icon: 'error',
-                        text: errorMsg.unselected
-                    });
-                    return;
-                }
-                dialog.open({title: 'Aria RPC', type: 'batchAriaRPC', list: batchLinkList, tip: tip, showcopy: false});
+                getPCSBatchLink((batchLinkList) => {
+                    tip = '点击按钮发送链接至Aria下载器中<a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载，此功能建议配合百度会员使用'
+                    if (batchLinkList.length === 0) {
+                        Toast.fire({
+                            icon: 'error',
+                            text: errorMsg.unselected
+                        })
+                        return
+                    }
+                    dialog.open({
+                        title: 'Aria RPC',
+                        type: 'batchAriaRPC',
+                        list: batchLinkList,
+                        tip: tip,
+                        showcopy: false,
+                        showrpc: true
+                    })
+                })
             }
-            if (id.indexOf('api') != -1) {  //API下载
-                batchLinkList = getAPIBatchLink(linkType);
-                tip = '请先安装 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> <b>v2.3.1</b> 后点击链接下载，若下载失败，请开启 <a href="https://www.baiduyun.wiki/zh-cn/question.html" target="_blank">备用链接</a>';
+            if (id.indexOf('api') > 0) {  //API下载
+                batchLinkList = getAPIBatchLink(linkType)
+                tip = '请先安装 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> <b>v2.3.1</b> 后点击链接下载，若下载失败，请开启 <a href="https://www.baiduyun.wiki/zh-cn/question.html" target="_blank">备用链接</a>'
                 if (batchLinkList.length === 0) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.unselected
-                    });
-                    return;
+                    })
+                    return
                 }
-                dialog.open({title: 'API下载链接', type: 'batch', list: batchLinkList, tip: tip});
+                dialog.open({title: 'API下载链接', type: 'batch', list: batchLinkList, tip: tip})
             }
         }
 
-        //我的网盘 - 获取直链下载地址
-        function getDirectBatchLink(linkType) {
-            let list = [];
-            $.each(selectFileList, function (index, element) {
-                let downloadType, downloadLink, result;
-                if (element.isdir == 0)
-                    downloadType = 'dlink';
-                else
-                    downloadType = 'batch';
-                fid_list = getFidList([element]);
-                result = getDownloadLinkWithPanAPI(downloadType);
-                if (result.errno == 0) {
-                    if (downloadType == 'dlink')
-                        downloadLink = result.dlink[0].dlink;
-                    else if (downloadType == 'batch')
-                        downloadLink = result.dlink;
-                    downloadLink = downloadLink.replace(/^([A-Za-z]+):/, linkType);
-                } else {
-                    downloadLink = 'error';
-                }
-                list.push({filename: element.server_filename, downloadlink: downloadLink});
-            });
-            return list;
-        }
-
         //我的网盘 - 获取API下载地址
         function getAPIBatchLink(linkType) {
-            let list = [];
-            $.each(selectFileList, function (index, element) {
+            let list = []
+            $.each(selectFileList, (index, element) => {
                 if (element.isdir == 1)
-                    return;
-                let downloadLink;
-                downloadLink = getDownloadById(element.path);
+                    return
+                let downloadLink
+                downloadLink = getDownloadById(element.path)
                 //downloadLink = downloadLink.replace(/^([A-Za-z]+):/, linkType);
                 list.push({
                     filename: element.server_filename,
                     downloadlink: downloadLink,
-                });
-            });
-            return list;
+                })
+            })
+            return list
         }
 
+        //我的网盘 - 获取PCS下载地址
+        function getPCSBatchLink(callback) {
+            let fsids = []
+            $.each(selectFileList, (index, element) => {
+                if (element.isdir == 1)
+                    return
+                fsids.push(element.fs_id)
+            })
+            fsids = encodeURIComponent(JSON.stringify(fsids))
+            let link = clientAPIUrl + `xpan/multimedia?method=filemetas&access_token=undefined&fsids=${fsids}&dlink=1`
+            GM_xmlhttpRequest({
+                method: "GET",
+                responseType: 'json',
+                headers: {"User-Agent": userAgent},
+                url: link,
+                onload: (res) => {
+                    let response = res.response
+                    if (response.errno === 0) {
+                        callback(response.list)
+                    }
+                }
+            })
+        }
+
         function getSign() {
-            let signFnc;
+            let signFnc
             try {
-                signFnc = new Function("return " + yunData.sign2)();
+                signFnc = new Function("return " + yunData.sign2)()
             } catch (e) {
-                throw new Error(e.message);
+                throw new Error(e.message)
             }
-            return btoa(signFnc(yunData.sign5, yunData.sign1));
+            return btoa(signFnc(yunData.sign5, yunData.sign1))
         }
 
         //生成下载时的fid_list参数
         function getFidList(list) {
-            let fidlist = null;
+            let fidlist = null
             if (list.length === 0)
-                return null;
-            let fileidlist = [];
-            $.each(list, function (index, element) {
-                fileidlist.push(element.fs_id);
-            });
-            fidlist = '[' + fileidlist + ']';
-            return fidlist;
+                return null
+            let fileidlist = []
+            $.each(list, (index, element) => {
+                fileidlist.push(element.fs_id)
+            })
+            fidlist = '[' + fileidlist + ']'
+            return fidlist
         }
 
         //获取直接下载地址
         function getDownloadLinkWithPanAPI(type) {
-            let result;
-            logid = getLogID();
+            let result
+            logid = getLogID()
             let query = {
                 bdstoken: bdstoken,
                 logid: logid,
-            };
+            }
             let params = {
                 sign: sign,
                 timestamp: timestamp,
                 fidlist: fid_list,
                 type: type,
-            };
-            let downloadUrl = `https://pan.baidu.com/api/download?clienttype=1`;
+            }
+            let downloadUrl = `https://pan.baidu.com/api/download?clienttype=1`
             $.ajax({
                 url: downloadUrl,
                 async: false,
                 method: 'POST',
                 data: params,
-                success: function (response) {
-                    result = response;
+                success: (response) => {
+                    result = response
                 }
-            });
+            })
 
-            return result;
+            return result
         }
 
         function getDownloadLinkWithRESTAPIBaidu(path) {
-            return restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + secretCode;
+            return restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + secretCode
         }
 
-
         function getDownloadById(path) {
-            let paths = [];
-            $.each(ids, function (index, element) {
-                paths.push(restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + element);
-            });
-            return paths;
+            let paths = []
+            $.each(ids, (index, element) => {
+                paths.push(restAPIUrl + 'file?method=download&path=' + encodeURIComponent(path) + '&app_id=' + element)
+            })
+            return paths
         }
 
         function execDownload(link) {
-            $('#helperdownloadiframe').attr('src', link);
+            $('#helperdownloadiframe').attr('src', link)
         }
 
         function createIframe() {
-            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>');
-            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>');
-            $div.append($iframe);
-            $('body').append($div);
+            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>')
+            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>')
+            $div.append($iframe)
+            $('body').append($div)
 
         }
     }
 
     //分享页面的下载助手
     function PanShareHelper() {
         let yunData, sign, timestamp, bdstoken, channel, clienttype, web, app_id, logid, encrypt, product, uk,
-            primaryid, fid_list, extra, shareid;
-        let vcode;
-        let shareType, buttonTarget, dialog, vcodeDialog;
-        let selectFileList = [];
-        let panAPIUrl = location.protocol + "//" + location.host + "/api/";
+          primaryid, fid_list, extra, shareid
+        let vcode
+        let shareType, buttonTarget, dialog, vcodeDialog
+        let selectFileList = []
+        let panAPIUrl = location.protocol + "//" + location.host + "/api/"
 
-        this.init = function () {
-            yunData = unsafeWindow.yunData;
-            clog('初始化信息:', yunData);
+        this.init = () => {
+            yunData = unsafeWindow.yunData
+            clog('初始化信息:', yunData)
             if (yunData === undefined) {
-                clog('页面未正常加载，或者百度已经更新！');
-                return;
+                clog('页面未正常加载，或者百度已经更新！')
+                return
             }
-            initVar();
-            addButton();
-            dialog = new Dialog({addCopy: false});
-            vcodeDialog = new VCodeDialog(refreshVCode, confirmClick);
-            createIframe();
-            registerEventListener();
-            clog('下载助手加载成功！当前版本：', version);
-        };
+            initVar()
+            addButton()
+            dialog = new Dialog({addCopy: false})
+            vcodeDialog = new VCodeDialog(refreshVCode, confirmClick)
+            createIframe()
+            registerEventListener()
+            clog('下载助手加载成功！当前版本：', version)
+        }
 
         function isSuperVIP() {
-            return yunData.ISSVIP === 1;
+            return yunData.ISSVIP === 1
         }
 
         function initVar() {
-            shareType = getShareType();
-            sign = yunData.SIGN;
-            timestamp = yunData.TIMESTAMP;
-            bdstoken = yunData.MYBDSTOKEN;
-            channel = 'chunlei';
-            clienttype = 0;
-            web = 1;
-            app_id = secretCode;
-            logid = getLogID();
-            encrypt = 0;
-            product = 'share';
-            primaryid = yunData.SHARE_ID;
-            uk = yunData.SHARE_UK;
+            shareType = getShareType()
+            sign = yunData.SIGN
+            timestamp = yunData.TIMESTAMP
+            bdstoken = yunData.MYBDSTOKEN
+            channel = 'chunlei'
+            clienttype = 0
+            web = 1
+            app_id = secretCode
+            logid = getLogID()
+            encrypt = 0
+            product = 'share'
+            primaryid = yunData.SHARE_ID
+            uk = yunData.SHARE_UK
 
             if (shareType == 'secret') {
-                extra = getExtra();
+                extra = getExtra()
             }
             if (!isSingleShare()) {
-                shareid = yunData.SHARE_ID;
+                shareid = yunData.SHARE_ID
             }
         }
 
         function getSelctedFile() {
             if (isSingleShare()) {
-                return yunData.FILEINFO;
+                return yunData.FILEINFO
             } else {
-                return require("disk-share:widget/pageModule/list/listInit.js").getCheckedItems();
+                return require("disk-share:widget/pageModule/list/listInit.js").getCheckedItems()
             }
         }
 
         //判断分享类型（public或者secret）
         function getShareType() {
-            return yunData.SHARE_PUBLIC === 1 ? 'public' : 'secret';
+            return yunData.SHARE_PUBLIC === 1 ? 'public' : 'secret'
         }
 
         //判断是单个文件分享还是文件夹或者多文件分享
         function isSingleShare() {
-            return yunData.getContext === undefined ? true : false;
+            return yunData.getContext === undefined ? true : false
         }
 
         //判断是否为自己的分享链接
         function isSelfShare() {
-            return yunData.MYSELF == 1 ? true : false;
+            return yunData.MYSELF == 1 ? true : false
         }
 
         function getExtra() {
-            let seKey = decodeURIComponent(getCookie('BDCLND'));
-            return '{' + '"sekey":"' + seKey + '"' + "}";
+            let seKey = decodeURIComponent(getCookie('BDCLND'))
+            return '{' + '"sekey":"' + seKey + '"' + "}"
         }
 
         //获取当前目录
         function getPath() {
-            let hash = location.hash;
-            let regx = new RegExp("path=([^&]*)(&|$)", 'i');
-            let result = hash.match(regx);
-            return decodeURIComponent(result[1]);
+            let hash = location.hash
+            let regx = new RegExp("path=([^&]*)(&|$)", 'i')
+            let result = hash.match(regx)
+            return decodeURIComponent(result[1])
         }
 
         //添加下载助手按钮
         function addButton() {
             if (isSingleShare()) {
-                $('div.slide-show-right').css('width', '500px');
-                $('div.frame-main').css('width', '96%');
-                $('div.share-file-viewer').css('width', '740px').css('margin-left', 'auto').css('margin-right', 'auto');
+                $('div.slide-show-right').css('width', '500px')
+                $('div.frame-main').css('width', '96%')
+                $('div.share-file-viewer').css('width', '740px').css('margin-left', 'auto').css('margin-right', 'auto')
             } else
-                $('div.slide-show-right').css('width', '500px');
-            let $dropdownbutton = $('<span class="g-dropdown-button"></span>');
-            let $dropdownbutton_a = $('<a class="g-button g-button-blue" style="width: 114px;" data-button-id="b200" data-button-index="200" href="javascript:;"></a>');
-            let $dropdownbutton_a_span = $('<span class="g-button-right"><em class="icon icon-picpre-download" title="百度网盘下载助手"></em><span class="text" style="width: 60px;">下载助手</span></span>');
-            let $dropdownbutton_span = $('<span class="menu" style="width:auto;z-index:41"></span>');
+                $('div.slide-show-right').css('width', '500px')
+            let $dropdownbutton = $('<span class="g-dropdown-button"></span>')
+            let $dropdownbutton_a = $('<a class="g-button" style="width: 114px;" data-button-id="b200" data-button-index="200" href="javascript:;"></a>')
+            let $dropdownbutton_a_span = $('<span class="g-button-right"><em class="icon icon-download"></em><span class="text" style="width: 60px;">下载助手</span></span>')
+            let $dropdownbutton_span = $('<span class="menu" style="width:auto;z-index:41"></span>')
 
-            let $downloadButton = $('<a class="g-button-menu" href="javascript:;">直接下载</a>');
-            let $linkButton = $('<a class="g-button-menu" href="javascript:;" data-type="down">显示链接</a>');
-            let $aricLinkButton = $('<a class="g-button-menu" href="javascript:;">显示Aria链接</a>');
-            let $aricRPCButton = $('<a class="g-button-menu" href="javascript:;" data-type="rpc">RPC下载</a>');
-            let $versionButton = $('<a style="color: #e85653;font-weight: 700;" class="g-button-menu" href="javascript:;">Ver ' + version + '</a>');
+            let $downloadButton = $('<a class="g-button-menu" href="javascript:;">直接下载</a>')
+            let $linkButton = $('<a class="g-button-menu" href="javascript:;" data-type="down">显示链接</a>')
+            let $aricLinkButton = $('<a class="g-button-menu" href="javascript:;">Aria下载</a>')
+            let $aricRPCButton = $('<a class="g-button-menu" href="javascript:;" data-type="rpc">RPC下载</a>')
+            let $versionButton = $('<a style="color: #F24C43;" class="g-button-menu" target="_blank" href="https://www.baiduyun.wiki/install.html">发现新版本</a>');
 
-            $dropdownbutton_span.append($downloadButton).append($linkButton).append($aricRPCButton).append($aricLinkButton).append($versionButton)/*.append($github)*/;
-            $dropdownbutton_a.append($dropdownbutton_a_span);
-            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span);
+            $dropdownbutton_span.append($downloadButton).append($linkButton).append($aricLinkButton).append($aricRPCButton)
+            $dropdownbutton_a.append($dropdownbutton_a_span)
+            $dropdownbutton.append($dropdownbutton_a).append($dropdownbutton_span)
 
-            $dropdownbutton.hover(function () {
-                $dropdownbutton.toggleClass('button-open');
-            });
-            $downloadButton.click(downloadButtonClick);
-            $aricRPCButton.click(linkButtonClick);
-            $linkButton.click(linkButtonClick);
-            $aricLinkButton.click(ariclinkButtonClick);
-            $versionButton.click(versionButtonClick);
+            if (getValue('up')) {
+              $dropdownbutton_span.append($versionButton)
+            }
 
-            $('div.module-share-top-bar div.bar div.x-button-box').append($dropdownbutton);
-        }
+            $dropdownbutton.hover(() => {
+                $dropdownbutton.toggleClass('button-open')
+            })
+            $downloadButton.click(downloadButtonClick)
+            $aricRPCButton.click(linkButtonClick)
+            $linkButton.click(linkButtonClick)
+            $aricLinkButton.click(ariclinkButtonClick)
 
-        function versionButtonClick() {
-            let url = 'https://www.baiduyun.wiki';
-            GM_openInTab(url, {active: true});
+            $('div.module-share-top-bar div.bar div.x-button-box').append($dropdownbutton)
         }
 
         function ariclinkButtonClick() {
-            selectFileList = getSelctedFile();
+            selectFileList = getSelctedFile()
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return false;
+                })
+                return false
             }
-            clog('选中文件列表：', selectFileList);
+            clog('选中文件列表：', selectFileList)
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return false;
+                })
+                return false
             }
             if (selectFileList[0].isdir == 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.toobig
-                });
-                return false;
+                })
+                return false
             }
 
-            buttonTarget = 'ariclink';
-            getDownloadLink(function (downloadLink) {
-                if (downloadLink === undefined) return;
+            buttonTarget = 'ariclink'
+            getDownloadLink((downloadLink) => {
+                if (downloadLink === undefined) return
 
                 if (downloadLink.errno == -20) {
-                    vcode = getVCode();
+                    vcode = getVCode()
                     if (!vcode || vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return false;
+                        })
+                        return false
                     }
-                    vcodeDialog.open(vcode);
+                    vcodeDialog.open(vcode)
                 } else if (downloadLink.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return false;
+                    })
+                    return false
                 } else if (downloadLink.errno === 0) {
-                    let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>';
+                    let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>'
                     dialog.open({
                         title: '下载链接（仅显示文件链接）',
                         type: 'shareAriaLink',
                         list: downloadLink.list,
                         tip: tip,
                         showcopy: true
-                    });
+                    })
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         function createIframe() {
-            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>');
-            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>');
-            $div.append($iframe);
-            $('body').append($div);
+            let $div = $('<div class="helper-hide" style="padding:0;margin:0;display:block"></div>')
+            let $iframe = $('<iframe src="javascript:;" id="helperdownloadiframe" style="display:none"></iframe>')
+            $div.append($iframe)
+            $('body').append($div)
         }
 
         function registerEventListener() {
-            registerDownload();
-        }
+            $(document).on('click', '.aria-rpc', (e) => {
+                $(e.target).addClass('clicked')
+                let link = e.target.dataset.link
+                let filename = e.target.dataset.filename
 
-        function registerDownload() {
-            $(document).on('click', '.aria-rpc', function (e) {
-                let link = e.target.dataset.link;
-                let filename = e.target.dataset.filename;
+                let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc'
+                let json_rpc = {
+                    id: new Date().getTime(),
+                    jsonrpc: '2.0',
+                    method: 'aria2.addUri',
+                    params: [
+                        "token:" + ariaRPC.token,
+                        [link],
+                        {
+                            dir: ariaRPC.dir,
+                            out: filename,
+                            header: ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
 
+                        }
+                    ]
+                }
                 GM_xmlhttpRequest({
-                    method: "HEAD",
-                    headers: {
-                        "User-Agent": userAgent
+                    method: "POST",
+                    headers: {"User-Agent": userAgent},
+                    url: url,
+                    responseType: 'json',
+                    timeout: 3000,
+                    data: JSON.stringify(json_rpc),
+                    onload: (response) => {
+                        if (response.response.result) {
+                            Toast.fire({
+                                icon: 'success',
+                                title: '任务已发送至RPC下载器'
+                            })
+                        } else {
+                            Toast.fire({
+                                icon: 'error',
+                                title: response.response.message
+                            })
+                        }
                     },
-                    url: e.target.dataset.link,
-                    onload: function (res) {
-                        let finalUrl = res.finalUrl;
-                        if (finalUrl) {
-                            let url = ariaRPC.domain + ":" + ariaRPC.port + '/jsonrpc';
-                            let json_rpc = {
-                                id: new Date().getTime(),
-                                jsonrpc: '2.0',
-                                method: 'aria2.addUri',
-                                params: [
-                                    "token:" + ariaRPC.token,
-                                    [finalUrl],
-                                    {
-                                        dir: ariaRPC.dir,
-                                        out: filename,
-                                        header: ['User-Agent:' + userAgent, 'Cookie: BDUSS=' + getBDUSS()]
-
-                                    }
-                                ]
-                            };
-                            GM_xmlhttpRequest({
-                                method: "POST",
-                                headers: {
-                                    "User-Agent": userAgent
-                                },
-                                url: url,
-                                responseType: 'json',
-                                timeout: 3000,
-                                data: JSON.stringify(json_rpc),
-                                onload: function (response) {
-                                    if (response.response.result) {
-                                        Toast.fire({
-                                            icon: 'success',
-                                            title: '任务已发送至RPC下载器'
-                                        });
-                                    } else {
-                                        Toast.fire({
-                                            icon: 'error',
-                                            title: response.response.message
-                                        });
-                                    }
-                                },
-                                ontimeout: function () {
-                                    Toast.fire({
-                                        icon: 'error',
-                                        title: '无法连接到RPC服务，请检查RPC配置'
-                                    });
-                                }
-                            });
-                        }
+                    ontimeout: () => {
+                        Toast.fire({
+                            icon: 'error',
+                            title: '连接到RPC服务器超时，请检查RPC配置'
+                        })
                     }
-                });
-            });
+                })
+            })
+            $(document).on('click','.rpc-setting',(e)=>{
+                rpcSetting()
+            })
+            $(document).on('click','.send-all',(e)=>{
+                $('.aria-rpc').click()
+                $('.dialog').hide()
+                $('.dialog-shadow').hide()
+            })
         }
 
         function downloadButtonClick() {
-            selectFileList = getSelctedFile();
+            selectFileList = getSelctedFile()
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return false;
+                })
+                return false
             }
-            clog('选中文件列表：', selectFileList);
+            clog('选中文件列表：', selectFileList)
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return false;
+                })
+                return false
             }
             if (selectFileList.length > 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.morethan
-                });
-                return false;
+                })
+                return false
             }
 
             if (selectFileList[0].isdir == 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.dir
-                });
-                return false;
+                })
+                return false
             }
-            buttonTarget = 'download';
-            getDownloadLink(function (downloadLink) {
-                if (downloadLink === undefined) return;
+            buttonTarget = 'download'
+            getDownloadLink((downloadLink) => {
+                if (downloadLink === undefined) return
 
                 if (downloadLink.errno == -20) {
-                    vcode = getVCode();
+                    vcode = getVCode()
                     if (vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return;
+                        })
+                        return
                     }
-                    vcodeDialog.open(vcode);
+                    vcodeDialog.open(vcode)
                 } else if (downloadLink.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
+                    })
                 } else if (downloadLink.errno === 0) {
-                    let link = downloadLink.list[0].dlink;
-                    execDownload(link);
+                    let link = downloadLink.list[0].dlink
+                    execDownload(link)
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         //获取验证码
         function getVCode() {
-            let url = panAPIUrl + 'getvcode';
-            let result;
-            logid = getLogID();
+            let url = panAPIUrl + 'getvcode'
+            let result
+            logid = getLogID()
             let params = {
                 prod: 'pan',
                 t: Math.random(),
                 bdstoken: bdstoken,
@@ -1508,305 +1433,287 @@
                 clienttype: clienttype,
                 web: web,
                 app_id: app_id,
                 logid: logid
-            };
+            }
             $.ajax({
                 url: url,
                 method: 'GET',
                 async: false,
                 data: params,
-                success: function (response) {
-                    result = response;
+                success: (response) => {
+                    result = response
                 }
-            });
-            return result;
+            })
+            return result
         }
 
         //刷新验证码
         function refreshVCode() {
-            vcode = getVCode();
-            $('#dialog-img').attr('src', vcode.img);
+            vcode = getVCode()
+            $('#dialog-img').attr('src', vcode.img)
         }
 
         //验证码确认提交
         function confirmClick() {
-            let val = $('#dialog-input').val();
+            let val = $('#dialog-input').val()
             if (val.length === 0) {
-                $('#dialog-err').text('请输入验证码');
-                return;
+                $('#dialog-err').text('请输入验证码')
+                return
             } else if (val.length < 4) {
-                $('#dialog-err').text('验证码输入错误，请重新输入');
-                return;
+                $('#dialog-err').text('验证码输入错误，请重新输入')
+                return
             }
-            getDownloadLinkWithVCode(val, function (result) {
+            getDownloadLinkWithVCode(val, (result) => {
                 if (result.errno == -20) {
-                    vcodeDialog.close();
-                    $('#dialog-err').text('验证码输入错误，请重新输入');
-                    refreshVCode();
+                    vcodeDialog.close()
+                    $('#dialog-err').text('验证码输入错误，请重新输入')
+                    refreshVCode()
                     if (!vcode || vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return;
+                        })
+                        return
                     }
-                    vcodeDialog.open();
+                    vcodeDialog.open()
                 } else if (result.errno === 0) {
-                    vcodeDialog.close();
+                    vcodeDialog.close()
                     if (buttonTarget == 'download') {
                         if (result.list.length > 1 || result.list[0].isdir == 1) {
                             Toast.fire({
                                 icon: 'error',
                                 text: errorMsg.morethan
-                            });
-                            return false;
+                            })
+                            return false
                         }
-                        let link = result.list[0].dlink;
-                        execDownload(link);
+                        let link = result.list[0].dlink
+                        execDownload(link)
                     }
                     if (buttonTarget == 'link') {
-                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方法）';
+                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方法）'
                         dialog.open({
                             title: '下载链接（仅显示文件链接）',
                             type: 'shareLink',
                             list: result.list,
                             tip: tip,
                             showcopy: false
-                        });
+                        })
                     }
                     if (buttonTarget == 'ariclink') {
-                        let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>';
+                        let tip = '请先安装 <a  href="https://www.baiduyun.wiki/zh-cn/assistant.html">网盘万能助手</a> 请将链接复制到支持Aria的下载器中, 推荐使用 <a  href="http://pan.baiduyun.wiki/down">XDown</a>'
                         dialog.open({
                             title: '下载链接（仅显示文件链接）',
                             type: 'shareAriaLink',
                             list: result.list,
                             tip: tip,
                             showcopy: false
-                        });
+                        })
                     }
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         //生成下载用的fid_list参数
         function getFidList() {
-            let fidlist = [];
-            $.each(selectFileList, function (index, element) {
-                fidlist.push(element.fs_id);
-            });
-            return '[' + fidlist + ']';
+            let fidlist = []
+            $.each(selectFileList, (index, element) => {
+                fidlist.push(element.fs_id)
+            })
+            return '[' + fidlist + ']'
         }
 
         function linkButtonClick(e) {
-            selectFileList = getSelctedFile();
+            selectFileList = getSelctedFile()
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return false;
+                })
+                return false
             }
-            clog('选中文件列表：', selectFileList);
+            clog('选中文件列表：', selectFileList)
             if (selectFileList.length === 0) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unselected
-                });
-                return false;
+                })
+                return false
             }
             if (selectFileList[0].isdir == 1) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.dir
-                });
-                return false;
+                })
+                return false
             }
 
-            buttonTarget = 'link';
-            getDownloadLink(function (downloadLink) {
-                if (downloadLink === undefined) return;
+            buttonTarget = 'link'
+            getDownloadLink((downloadLink) => {
+                if (downloadLink === undefined) return
 
                 if (downloadLink.errno == -20) {
-                    vcode = getVCode();
+                    vcode = getVCode()
                     if (!vcode || vcode.errno !== 0) {
                         Toast.fire({
                             icon: 'error',
                             text: errorMsg.wrongcode
-                        });
-                        return false;
+                        })
+                        return false
                     }
-                    vcodeDialog.open(vcode);
+                    vcodeDialog.open(vcode)
                 } else if (downloadLink.errno == 112) {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.timeout
-                    });
-                    return false;
+                    })
+                    return false
                 } else if (downloadLink.errno === 0) {
                     if (e.target.dataset.type === 'rpc') {
-                        let tip = '点击按钮发送链接至Aria下载器中 <a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载';
+                        let tip = '点击按钮发送链接至Aria下载器中 <a href="https://www.baiduyun.wiki/zh-cn/rpc.html">详细说明</a>，需配合最新版 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a>，支持本地和远程下载'
                         dialog.open({
-                            title: '下载链接（仅显示文件链接）',
+                            title: 'Aria RPC',
                             type: 'rpcLink',
                             list: downloadLink.list,
                             tip: tip,
-                            showcopy: false
-                        });
+                            showcopy: false,
+                            showrpc: true
+                        })
                     } else {
-                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方式）';
+                        let tip = '点击链接直接下载，请先升级 <a href="https://www.baiduyun.wiki/zh-cn/assistant.html">[网盘万能助手]</a> 至 <b>v2.3.1</b>（出现403请尝试其他下载方式）'
                         dialog.open({
                             title: '下载链接（仅显示文件链接）',
                             type: 'shareLink',
                             list: downloadLink.list,
                             tip: tip,
                             showcopy: true
-                        });
+                        })
                     }
 
                 } else {
                     Toast.fire({
                         icon: 'error',
                         text: errorMsg.fail
-                    });
+                    })
                 }
-            });
+            })
         }
 
         //获取下载链接
         function getDownloadLink(cb) {
             if (bdstoken === null) {
                 Toast.fire({
                     icon: 'error',
                     text: errorMsg.unlogin
-                });
-                return '';
+                })
+                return ''
             }
-            let res;
+            let res
             if (isSingleShare) {
-                fid_list = getFidList();
-                logid = getLogID();
+                fid_list = getFidList()
+                logid = getLogID()
 
-                let params = new FormData();
-                params.append('encrypt', encrypt);
-                params.append('product', product);
-                params.append('uk', uk);
-                params.append('primaryid', primaryid);
-                params.append('fid_list', fid_list);
+                let params = new FormData()
+                params.append('encrypt', encrypt)
+                params.append('product', product)
+                params.append('uk', uk)
+                params.append('primaryid', primaryid)
+                params.append('fid_list', fid_list)
 
                 if (shareType == 'secret') {
-                    params.append('extra', extra);
+                    params.append('extra', extra)
                 }
 
-                $.ajax({
-                    url: 'https://api.baiduyun.wiki/download?sign=' + sign + '&timestamp=' + timestamp + '&logid=' + logid + '&init=' + getValue('init'),
-                    cache: false,
-                    method: 'GET',
-                    async: false,
-                    complete(response) {
-                        res = response.responseText;
-                    }
-                });
-
                 GM_xmlhttpRequest({
                     method: "POST",
                     data: params,
-                    url: atob(atob(res)),
+                    url: `https://pan.baidu.com/api/sharedownload?sign=${sign}&timestamp=${timestamp}+&logid=${logid}&channel=chunlei&clienttype=12&web=1&app_id=250528`,
                     onload: function (res) {
-                        cb(JSON.parse(res.response));
+                        cb(JSON.parse(res.response))
                     }
-                });
+                })
             }
         }
 
         //有验证码输入时获取下载链接
         function getDownloadLinkWithVCode(vcodeInput, cb) {
-            let res;
+            let res
             if (isSingleShare) {
-                fid_list = getFidList();
-                logid = getLogID();
+                fid_list = getFidList()
+                logid = getLogID()
 
-                let params = new FormData();
-                params.append('encrypt', encrypt);
-                params.append('product', product);
-                params.append('uk', uk);
-                params.append('primaryid', primaryid);
-                params.append('fid_list', fid_list);
-                params.append('vcode_input', vcodeInput);
-                params.append('vcode_str', vcode.vcode);
+                let params = new FormData()
+                params.append('encrypt', encrypt)
+                params.append('product', product)
+                params.append('uk', uk)
+                params.append('primaryid', primaryid)
+                params.append('fid_list', fid_list)
+                params.append('vcode_input', vcodeInput)
+                params.append('vcode_str', vcode.vcode)
 
                 if (shareType == 'secret') {
-                    params.append('extra', extra);
+                    params.append('extra', extra)
                 }
 
-                $.ajax({
-                    url: 'https://api.baiduyun.wiki/download?sign=' + sign + '&timestamp=' + timestamp + '&logid=' + logid,
-                    cache: false,
-                    method: 'GET',
-                    async: false,
-                    complete(response) {
-                        res = response.responseText;
-                    }
-                });
-
                 GM_xmlhttpRequest({
                     method: "POST",
                     data: params,
-                    url: atob(atob(res)),
+                    url: `https://pan.baidu.com/api/sharedownload?sign=${sign}&timestamp=${timestamp}+&logid=${logid}&channel=chunlei&clienttype=12&web=1&app_id=250528`,
                     onload: function (res) {
-                        cb(JSON.parse(res.response));
+                        cb(JSON.parse(res.response))
                     }
-                });
+                })
             }
         }
 
         function execDownload(link) {
-            clog('下载链接：' + link);
+            clog('下载链接：' + link)
             if (link) {
                 GM_xmlhttpRequest({
                     method: "POST",
                     headers: {
                         "User-Agent": userAgent
                     },
                     url: link,
-                    onload: function (res) {
+                    onload: (res) => {
                         //cb(JSON.parse(res.response));
                     }
-                });
+                })
             }
             //GM_openInTab(link, {active: false});
             //$('#helperdownloadiframe').attr('src', link);
         }
     }
 
     function PanPlugin() {
-        clog('RPC：', ariaRPC);
-        this.init = function () {
-            main();
-            addGMStyle();
-            checkUpdate();
-            if (getValue('SETTING_H')) createHelp();
-            createMenu();
-        };
+        clog('RPC：', ariaRPC)
+        this.init = () => {
+            main()
+            addGMStyle()
+            checkUpdate()
+            if (getValue('SETTING_H')) createHelp()
+            createMenu()
+        }
 
         function loadPanhelper() {
             switch (detectPage()) {
                 case 'disk':
-                    let panHelper = new PanHelper();
-                    panHelper.init();
-                    return;
+                case 'oauth2.0':
+                    let panHelper = new PanHelper()
+                    panHelper.init()
+                    return
                 case 'share':
                 case 's':
-                    let panShareHelper = new PanShareHelper();
-                    panShareHelper.init();
-                    return;
+                    let panShareHelper = new PanShareHelper()
+                    panShareHelper.init()
+                    return
                 default:
-                    return;
+                    return
             }
         }
 
         function addGMStyle() {
@@ -1817,159 +1724,182 @@
                 .dialog-body {max-height: 450px;overflow-y: auto;padding: 0 20px;}
                 .dialog-tip {padding: 0 20px;background-color: #fff;border-top: 1px solid #c4dbfe;color: #dc373c;}
                 .tm-setting {display: flex;align-items: center;justify-content: space-between;padding-top: 20px;}
                 .tm-checkbox {width: 16px;height: 16px;}
-                #dialog-copy-button {width: 120px;margin: 5px 0px 10px;cursor: pointer;background: #cc3235;border: none;height: 30px;color: #fff;border-radius: 3px;}
+                #dialog-copy-button {width: 120px;margin: 5px 10px 10px;cursor: pointer;background: #cc3235;border: none;height: 30px;color: #fff;border-radius: 3px;}
+                #dialog-send-button {width: 120px;margin: 5px 10px 10px;cursor: pointer;background: #cc3235;border: none;height: 30px;color: #fff;border-radius: 3px;}
+                #dialog-rpc-button {width: 120px;margin: 5px 10px 10px;cursor: pointer;background: #4e97ff;border: none;height: 30px;color: #fff;border-radius: 3px;}
                 .flex-center-between {display: flex;align-items: center;justify-content: space-between}
-            `);
+                .swal2-input {height:50px!important;margin:10px auto!important;}
+                .aria-rpc { background: #09AAFF; border: 0; border-radius: 4px; color: #ffffff; cursor: pointer; font-size: 12px; padding: 2px 15px;outline:none; }
+                .aria-rpc.clicked { background: #808080; }
+            `)
         }
 
         function checkUpdate() {
-            $.ajax({
-                url: `https://api.baiduyun.wiki/update?ver=${version}&s=web`,
-                method: 'GET',
-                success: function (res) {
-                    setValue('lastest_version', res.version);
-                    userAgent = res.ua;
-                    ids = res.ids;
-                    if (res.code === 200) {
-                        if (res.version > version) {
-                            Swal.fire({
-                                title: `发现新版本 <span style="background: #da5961;vertical-align: top;display: inline-block;font-size: 14px;height: 18px;line-height: 18px;border-radius: 3px;padding: 0 6px;color: #fff;">${res.version}</span>`,
-                                icon: 'success',
-                                html: res.changelog,
-                                confirmButtonText: '更新',
-                                footer: copyright
-                            }).then((result) => {
-                                if (result.value) {
-                                    location.href = res.updateURL;
-                                }
-                            });
-                        }
+            setValue('up',0)
+            GM_xmlhttpRequest({
+                method: "GET",
+                url: `https://api.baiduyun.wiki/update?ver=${version}`,
+                responseType: 'json',
+                onload: function (r) {
+                    let res = r.response
+                    setValue('lastest_version', res.version)
+                    userAgent = res.ua
+                    ids = res.ids
+                    if (res.vcode === 200 && compareVersion(res.version,version)) {
+                            setValue('up',1)
                     }
                     if (res.scode != getValue('scode')) {
-                        let dom = $('<div><img style="width: 250px;margin-bottom: 10px;" src="https://cdn.baiduyun.wiki/scode.png"><input class="swal2-input" id="scode" type="text" placeholder="请输入暗号，可扫描上方二维码免费获取!"></div>');
+                        let dom = $('<div><img style="width: 250px;margin-bottom: 10px;" src="https://cdn.baiduyun.wiki/scode.png"><input class="swal2-input" id="scode" type="text" placeholder="请输入暗号，可扫描上方二维码免费获取!"></div>')
                         Swal.fire({
                             title: "初次使用请输入暗号",
                             html: dom[0],
                             allowOutsideClick: false,
                             confirmButtonText: '确定'
                         }).then((result) => {
                             if (res.scode == $('#scode').val()) {
-                                setValue('scode', res.scode);
-                                setValue('init', 1);
+                                setValue('scode', res.scode)
+                                setValue('init', 1)
                                 Toast.fire({
                                     icon: 'success',
                                     text: '暗号正确，正在初始化中。。。',
                                 }).then(() => {
-                                    history.go(0);
-                                });
+                                    history.go(0)
+                                })
                             } else {
-                                setValue('init', 0);
+                                setValue('init', 0)
                                 Swal.fire({
                                     title: "🔺🔺🔺",
                                     text: '暗号不正确，请通过微信扫码免费获取',
                                     imageUrl: 'https://cdn.baiduyun.wiki/scode.png',
-                                });
+                                })
                             }
-                        });
+                        })
                     } else {
-                        loadPanhelper();
+                        loadPanhelper()
                     }
                 }
-            });
+            })
         }
 
+        function compareVersion(a,b) {
+          return (a.replace(/\./g,'') - b.replace(/\./g,'')) > 0
+        }
+
         function createHelp() {
             setTimeout(() => {
-                let topbar = $('.' + classMap['header']);
-                let toptemp = $('<span class="cMEMEF" node-type="help-author" style="opacity: .5" ><a href="https://www.baiduyun.wiki/" target="_blank">教程</a><i class="find-light-icon" style="display: inline;background-color: #009fe8;"></i></span>');
-                topbar.append(toptemp);
-            }, 2000);
+                let topbar = $('.' + classMap['header'])
+                let toptemp = $('<span class="cMEMEF" node-type="help-author" style="opacity: .5" ><a href="https://www.baiduyun.wiki/" target="_blank">教程</a><i class="find-light-icon" style="display: inline;background-color: #009fe8;"></i></span>')
+                topbar.append(toptemp)
+            }, 5000)
         }
 
         function createMenu() {
-            GM_registerMenuCommand('设置', function () {
-                if (getValue('SETTING_B') === undefined) {
-                    setValue('SETTING_B', false);
-                }
-                
+            GM_registerMenuCommand('设置', () => {
                 if (getValue('SETTING_H') === undefined) {
-                    setValue('SETTING_H', false);
+                    setValue('SETTING_H', true)
                 }
 
-                let dom = '';
+                if (getValue('SETTING_B') === undefined) {
+                    setValue('SETTING_B', false)
+                }
+
+                let dom = ''
                 if (getValue('SETTING_B')) {
-                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" checked class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" checked class="tm-checkbox"></label>'
                 } else {
-                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启备用链接<input type="checkbox" id="S-B" class="tm-checkbox"></label>'
                 }
                 if (getValue('SETTING_H')) {
-                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" checked class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" checked class="tm-checkbox"></label>'
                 } else {
-                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" class="tm-checkbox"></label>';
+                    dom += '<label class="tm-setting">开启教程<input type="checkbox" id="S-H" class="tm-checkbox"></label>'
                 }
-                dom = '<div>' + dom + '</div>';
-                let $dom = $(dom);
+                dom = '<div>' + dom + '</div>'
+                let $dom = $(dom)
                 Swal.fire({
                     title: '脚本配置',
                     html: $dom[0],
-                    confirmButtonText: '保存',
-                    footer: copyright
+                    confirmButtonText: '保存'
                 }).then((result) => {
-                    history.go(0);
-                });
-            });
-            $(document).on('change', '#S-B', function () {
-                setValue('SETTING_B', $(this)[0].checked);
-            });
-            $(document).on('change', '#S-H', function () {
-                setValue('SETTING_H', $(this)[0].checked);
-            });
+                    history.go(0)
+                })
+            })
+            $(document).on('change', '#S-B', () => {
+                setValue('SETTING_B', $(this)[0].checked)
+            })
+            $(document).on('change', '#S-H', () => {
+                setValue('SETTING_H', $(this)[0].checked)
+            })
         }
 
         function main() {
-            setValue('current_version', version);
+            setValue('current_version', version)
 
             //解决https无法加载http资源的问题
-            let oMeta = document.createElement('meta');
-            oMeta.httpEquiv = 'Content-Security-Policy';
-            oMeta.content = 'upgrade-insecure-requests';
-            document.getElementsByTagName('head')[0].appendChild(oMeta);
+            let oMeta = document.createElement('meta')
+            oMeta.httpEquiv = 'Content-Security-Policy'
+            oMeta.content = 'upgrade-insecure-requests'
+            document.getElementsByTagName('head')[0].appendChild(oMeta)
 
-            $(document).on('contextmenu', '.aria-link', function (e) {
-                e.preventDefault();
-                return false;
-            });
+            $(document).on('contextmenu', '.aria-link', (e) => {
+                e.preventDefault()
+                return false
+            })
 
-            $(document).on('mousedown', '.aria-link', function (e) {
-                e.preventDefault();
-                let link = decodeURIComponent($(this).data('link'));
-                GM_setClipboard(link, 'text');
+            $(document).on('mousedown', '.aria-link', (e) => {
+                e.preventDefault()
+                let link = decodeURIComponent($(this).text())
+                GM_setClipboard(link, 'text')
                 Toast.fire({
                     icon: 'success',
                     text: '已将链接复制到剪贴板！'
-                });
-                return false;
-            });
+                })
+                return false
+            })
 
-            $(document).on('click', '.share-download', function (e) {
-                e.preventDefault();
+            $(document).on('click', '.share-download', (e) => {
+                e.preventDefault()
                 if (e.target.innerText) {
                     GM_xmlhttpRequest({
                         method: "POST",
                         headers: {"User-Agent": userAgent},
                         url: e.target.innerText,
-                        onload: function (res) {
+                        onload: (res) => {
                             //GM_openInTab(res.finalUrl, {active: false});
                         }
-                    });
+                    })
                 }
-            });
+            })
+
+            $(document).on('click', '.pcs-link', (e) => {
+                let link = e.target.dataset.link
+                let filename = e.target.dataset.filename
+                if (link) {
+                    GM_xmlhttpRequest({
+                        method: "HEAD",
+                        headers: {"User-Agent": userAgent},
+                        url: link,
+                        onload: (res) => {
+                            let final = res.finalUrl.replace('https', "http")
+                            GM_download({
+                                url: final,
+                                headers: {"User-Agent": userAgent},
+                                name: filename,
+                                saveAs: true,
+                            })
+                        }
+                    })
+                }
+            })
         }
     }
 
-    $(function () {
-        let plugin = new PanPlugin();
-        plugin.init();
-    });
-})();
+    $(() => {
+        //阻止在其他网站运行
+        if (hostname.match(/(pan|yun).baidu.com/i)) {
+            let plugin = new PanPlugin()
+            plugin.init()
+        }
+    })
+})()
u
                 Swal.fire({
                     title: '脚本配置',
                     html: $dom[0],
-                    confirmButtonText: '保存',
-                    footer: copyright
+                    confirmButtonText: '保存'
                 }).then((result) => {
-                    history.go(0);
-                });
-            });
-            $(document).on('change', '#S-B', function () {
-                setValue('SETTING_B', $(this)[0].checked);
-            });
-            $(document).on('change', '#S-H', function () {
-                setValue('SETTING_H', $(this)[0].checked);
-            });
+                    history.go(0)
+                })
+            })
+            $(document).on('change', '#S-B', () => {
+                setValue('SETTING_B', $(this)[0].checked)
+            })
+            $(document).on('change', '#S-H', () => {
+                setValue('SETTING_H', $(this)[0].checked)
+            })
         }
 
         function main() {
-            setValue('current_version', version);
+            setValue('current_version', version)
 
             //解决https无法加载http资源的问题
-            let oMeta = document.createElement('meta');
-            oMeta.httpEquiv = 'Content-Security-Policy';
-            oMeta.content = 'upgrade-insecure-requests';
-            document.getElementsByTagName('head')[0].appendChild(oMeta);
+            let oMeta = document.createElement('meta')
+            oMeta.httpEquiv = 'Content-Security-Policy'
+            oMeta.content = 'upgrade-insecure-requests'
+            document.getElementsByTagName('head')[0].appendChild(oMeta)
 
-            $(document).on('contextmenu', '.aria-link', function (e) {
-                e.preventDefault();
-                return false;
-            });
+            $(document).on('contextmenu', '.aria-link', (e) => {
+                e.preventDefault()
+                return false
+            })
 
-            $(document).on('mousedown', '.aria-link', function (e) {
-                e.preventDefault();
-                let link = decodeURIComponent($(this).data('link'));
-                GM_setClipboard(link, 'text');
+            $(document).on('mousedown', '.aria-link', (e) => {
+                e.preventDefault()
+                let link = decodeURIComponent($(this).text())
+                GM_setClipboard(link, 'text')
                 Toast.fire({
                     icon: 'success',
                     text: '已将链接复制到剪贴板！'
-                });
-                return false;
-            });
+                })
+                return false
+            })
 
-            $(document).on('click', '.share-download', function (e) {
-                e.preventDefault();
+            $(document).on('click', '.share-download', (e) => {
+                e.preventDefault()
                 if (e.target.innerText) {
                     GM_xmlhttpRequest({
                         method: "POST",
                         headers: {"User-Agent": userAgent},
                         url: e.target.innerText,
-                        onload: function (res) {
+                        onload: (res) => {
                             //GM_openInTab(res.finalUrl, {active: false});
                         }
-                    });
+                    })
                 }
-            });
+            })
+
+            $(document).on('click', '.pcs-link', (e) => {
+                let link = e.target.dataset.link
+                let filename = e.target.dataset.filename
+                if (link) {
+                    GM_xmlhttpRequest({
+                        method: "HEAD",
+                        headers: {"User-Agent": userAgent},
+                        url: link,
+                        onload: (res) => {
+                            let final = res.finalUrl.replace('https', "http")
+                            GM_download({
+                                url: final,
+                                headers: {"User-Agent": userAgent},
+                                name: filename,
+                                saveAs: true,
+                            })
+                        }
+                    })
+                }
+            })
         }
     }
 
-    $(function () {
-        let plugin = new PanPlugin();
-        plugin.init();
-    });
-})();
+    $(() => {
+        //阻止在其他网站运行
+        if (hostname.match(/(pan|yun).baidu.com/i)) {
+            let plugin = new PanPlugin()
+            plugin.init()
+        }
+    })
+})()
