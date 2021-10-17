// ==UserScript==
// @name         b站直播自定义颜文字输入插件-改版
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  b站直播自带的颜文字无了･ﾟﾟ･(>д<)･ﾟﾟ･｡ 改版：加个自定义颜表情功能
// @author       爱虎虎的小饼干 改版：大梦小贤
// @match        https://live.bilibili.com/*
// @icon         http://i2.hdslb.com/bfs/face/e95015d06a56f732fd5d6a33250412f434b3c0f5.jpg@125w_125h.webp
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/npm/jquery@1.11.1/dist/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';
    //颜文字列表
    GM_registerMenuCommand("清空表情", ()=>{GM_deleteValue("kaomoji");});
    let kaomojiList = GM_getValue("kaomoji");
    console.log(kaomojiList);
    if (!kaomojiList) {
        kaomojiList = [
            "(⌒▽⌒)", "（￣▽￣）", "(=・ω・=)",
            "(｀・ω・´)", "(〜￣△￣)〜", "(･∀･)",
            "(°∀°)ﾉ", "(￣3￣)", "╮(￣▽￣)╭",
            "_(:3」∠)_", "(^・ω・^ )", "(●￣(ｴ)￣●)",
            "ε=ε=(ノ≧∇≦)ノ", "⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄", "←◡←",
        ];
        GM_setValue("kaomoji", JSON.stringify(kaomojiList));
    } else {
        kaomojiList = JSON.parse(kaomojiList);
    }

    //绘制面板框架
    const kaomojiPanel = $(`<div id="kaomojiPanel" data-v-b505b1e4 data-v-39dcacee
    class="border-box dialog-ctnr common-popup-wrap top-left a-scale-out v-leave-to"
    style="transform-origin: 63px buttom; width: 280px; margin: 0px 0px 0px -140px; left:50%; display:none"
    >
        <div data-v-b505b1e4 class="arrow p-absolute" style="left:73px;"></div>
        <div id="kaomojiDiv" style="height:200px;overflow-y:auto"></div>
    </div>`);

    //绘制颜文字按钮组件
    const kaomojiIcon = $(`<span data-`+GM_getValue("data-v")+` title="颜文字面板" id="kaomojiIcon" class="icon-item icon-font icon-pic-biaoqing2-dynamic live-skin-main-text"></span>`);

    //元素定位参数
    const iconPanelStr = ".icon-left-part";
    const controlPanelStr = "#control-panel-ctnr-box";
    const kaomojiDivStr = "#kaomojiDiv";
    const kaomojiPanelStr = "#kaomojiPanel";
    const kaomojiIconStr = "#kaomojiIcon";
    const textareaStr = "textarea.chat-input";
    const sendBtnStr = "div.right-action button";
    const moreInput = "#moreInput";

    //添加图标到页面
    (function insertKaomojiIcon() {
        var iconPanel = $(iconPanelStr);
        if (iconPanel.length > 0) {
            iconPanel.append(kaomojiIcon);
            for(var key in iconPanel[0].dataset) {
                GM_setValue("data-v",key);
            }
        } else {
            requestAnimationFrame(function () {
                insertKaomojiIcon();
            });
        }
    })();
    //添加面板到页面
    (function insertKaomojiPanel() {
        var panel = $(controlPanelStr);
        if (panel.length > 0) {
            panel.append(kaomojiPanel);
        } else {
            requestAnimationFrame(function () {
                insertKaomojiPanel();
            });
        }
    })();
    //加载颜文字列表
    (function insertKaomojiSpan() {
        var panel = $(kaomojiDivStr);
        if (panel.length > 0) {
            for (var i = 0; i < kaomojiList.length; i++) {
                var kaomojiSpan = $("<span></span>").attr("class", "list-content-candidate dp-i-block").attr(`data-v-14d43f2e`, "").text(kaomojiList[i]);
                kaomojiSpan.click(inputToText);
                kaomojiSpan.mouseup(sendKaomoji);
                panel.append(kaomojiSpan);
            }
            try{
                let moreInput = $("<input />").attr("type", "text").attr(`id`, "moreInput").attr(`data-${GM_getValue("data-v")}`, "");
                moreInput.keydown(addKaomoji);
                panel.append(moreInput);
            }catch(e){
                console.log("error-------");
                console.log(e);
            }
        } else {
            requestAnimationFrame(function () {
                insertKaomojiSpan();
            });
        }
    })();

    //给图标和面板添加点击事件
    (function setKaomojiBtn() {
        var panel = $(kaomojiPanelStr);
        var icon = $(kaomojiIconStr);
        var timer = 0;
        function setTimer() {
            timer = setTimeout(hidePanel, 100);
        };
        function clearTimer() {
            clearTimeout(timer);
            openPanel();
        };
        function openPanel() {
            panel.attr("class", "border-box dialog-ctnr common-popup-wrap top-left a-scale-in-ease v-leave-to");
            panel.css("display", "");
        }
        function hidePanel() {
            panel.attr("class", "border-box dialog-ctnr common-popup-wrap top-left a-scale-out v-leave-to");
            panel.css("display", "none");
        }
        if (icon.length > 0) {
            icon.mouseenter(clearTimer);
            icon.mouseleave(setTimer);
            panel.mouseenter(clearTimer);
            panel.mouseleave(setTimer);
            panel.bind("contextmenu",()=>{return false});
        } else {
            requestAnimationFrame(function () {
                setKaomojiBtn();
            });
        }
    })();

    //添加更多表情
    function addKaomoji(event) {
        let text = $(this).val();
        if (event.key === "Enter") {
            console.log(`keydown ${event.key} ${text}`);
            if (kaomojiList.indexOf(text) === -1){
                var panel = $(moreInput);
                var kaomojiSpan = $("<span></span>").attr("class", "list-content-candidate dp-i-block").attr(`data-v-14d43f2e`, "").text(text);
                kaomojiSpan.click(inputToText);
                kaomojiSpan.mouseup(sendKaomoji);
                panel.before(kaomojiSpan);
                kaomojiList.push(text);
                GM_setValue("kaomoji", JSON.stringify(kaomojiList));
            }
            $(this).val("");
        }
    }

    //给颜文字添加点击事件
    function inputToText() {
        var text = $(this).text();
        var textarea = $(textareaStr);
        var con = textarea.val();
        var pos = getCursortPosition(textarea[0]);
        textarea.val(con.substr(0,pos) + text + con.substr(pos));
        setCaretPosition(textarea[0],pos+text.length);
        textarea[0].dispatchEvent(new Event('input', { "bubbles": true, "cancelable": true }));
    }

    //右键直接发送表情
    function sendKaomoji(e) {
        if(e.which == 3) {
            var text = $(this).text();
            var textarea = $(textareaStr);
            var con = textarea.val();
            textarea.val(text);
            textarea[0].dispatchEvent(new Event('input', { "bubbles": true, "cancelable": true }));
            $(sendBtnStr).click();
            textarea.val(con);
            textarea[0].dispatchEvent(new Event('input', { "bubbles": true, "cancelable": true }));
        } else {
            return;
        }
    }
    //获取光标位置函数
    function getCursortPosition (ctrl) {
        var CaretPos = 0;	// IE Support
        if (document.selection) {
            ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }
        // Firefox support
        else if (ctrl.selectionStart || ctrl.selectionStart == '0')
            CaretPos = ctrl.selectionStart;
        return (CaretPos);
    }
    //设置光标位置函数
    function setCaretPosition(ctrl, pos){
        if(ctrl.setSelectionRange)
        {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
})();