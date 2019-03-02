 //emoji
 $.emoticons({
     'activeCls': 'trigger-active'
 }, function (api) {
     var $content = $('textarea[name="message"]');
     var $result = $('#result');
     $('#format').click(function () {
         $result.html(api.format($content.val()));
     });
 });


 var wsServer = 'ws://139.159.228.216:80'; //http://fates.free.idcfengye.com
 var websocket = new WebSocket(wsServer);

 var g_time = Date.parse(new Date()); //定义全局时间为用户打开该客户端时间

 websocket.onopen = function (evt) {


     // document.querySelector(".message_box").innerHTML = '正在连接聊天服务器,请耐心等待..'
     // alert('正在连接聊天服务器,请耐心等待..');
     $("#message_box").prepend("<p id='link'>正在连接聊天服务器,请耐心等待..</p>")
     //  if(!sessionStorage.getItem('username')) {
     setname();


     // }else {
     //     alert('您已登陆');

     // }
     // alert("正在进入聊天室，请稍后..");
 };

 websocket.onclose = function (evt) {
     alert("Disconnected");
 };

 //用户输入
 var dialog_template = function () {
     return '  <div class="use-dialog "><div class="dialog-content ">' +
         '<h3 class="title">请输入您的名字</h3>' +
         '<div><input type="text" id="use-name"></div>' +
         '<div class="btn">确定</div></div></div>';
 }

 function setname() {
     $("body").append(dialog_template);
     setTimeout(function () {
         $(".dialog-content").addClass("animate-show");
     }, 0)

     //var name = prompt("请输入您的名字", _getRandomString(6));
     var $name = $("#use-name");
     var name = $name.val();

     if (name == '' || name == null) {
         $name.val(_getRandomString(6));
         //name = _getRandomString(6);
     }

     $("body").on("click",".use-dialog",function(event){
        event.stopPropagation()
     })


     $("body").on("click", ".dialog-content .btn", function () {
         name = $name.val();


         $(".dialog-content").removeClass("animate-show").addClass("animate-hide");
         setTimeout(function () {
             $(".use-dialog").remove();
         }, 100)

         websocket.send(JSON.stringify({
             'message': name,
             'type': 'setname'
         }));
         sessionStorage.setItem('username', name);
         $("#link").remove();
         $("#message")[0].focus();

         $("#message_box").prepend("<p id='inhome'>正在进入聊天室，请稍后..</p>")
     })


 }
 var username = sessionStorage.getItem('username');

 function _getRandomString(len) { //生成随机名称
     len = len || 32;
     var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
     var maxPos = $chars.length;
     var pwd = '';
     for (i = 0; i < len; i++) {
         pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
     }
     return pwd;

 }

 function timestampToTime(timestamp) {
     var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
     var Y = date.getFullYear() + '-';
     var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
     var D = date.getDate() + ' ';
     var h = date.getHours() + ':';
     var m = date.getMinutes() + ':';
     var s = date.getSeconds();
     return Y + M + D + h + m + s;
 }
 //timestampToTime(1403058804);



 websocket.onmessage = function (evt) {


     var data = JSON.parse(evt.data);
     var now = Date.parse(new Date()); //获取收到消息时的时间
     var times;



     if (now - g_time > 1000 * 20) { //判断两个时间直接的间隔，假设两次消息间隔大于20秒则加上当前时间
         times = ' · ' + timestampToTime(now);
         g_time = now;
     } else { //否则不显示时间
         times = '';
         g_time = now;
     }



     //  console.log(data)

     switch (data.type) {
         case 1: //用户进入房间
             $("#inhome").remove();

             var s =
                 '<div class="msg_item fn-clear"><div class="uface"></div><div class="item_sys">' +
                 '<div  class="msgs"><span >' + data.content + '</span></div>' +
                 '</div></div>';
             $(".message_box").append(s);
             

             //  var arr = data.alluser.split(',');
             var str = '';
             // console.log(data.alluser);
             // var csss=JSON.parse(data.alluser);

             $.each(JSON.parse(data.alluser), function (key, val) {
                 str += '<li class="fn-clear" data-id="1" data-username="' + key +'">'
                        +'<span><img src="images/hetu.jpg" width="30" height="30"  alt=""/></span>'
                        +'<em title="双击用户名私聊" data-type="usertouser">' + val +'</em>'
                        +'<small class="online" title="在线"></small>'
                        +'<i class="iconfont icon-guanbi" title="点击关闭私聊"></i>'
                        +'</li>';
             })
             $("li[data-id='1']").remove();
             $(".user_list").append(str);
             $('#message_box').scrollTop($("#message_box")[0].scrollHeight);
             break;
         case 2: //用户发送消息
            data.content =format(data.content);
             var s =
                 '<div class="msg_item fn-clear"><div class="uface"><img src="images/hetu.jpg" width="40" height="40"  alt=""/></div><div class="item_right">' +
                 '<div class="name_time">' + data.user + times + '</div>' +
                 '<div class="msg">' + data.content + '</div>' +
                 '</div></div>';
             $(".message_box").append(s);
             $('#message_box').scrollTop($("#message_box")[0].scrollHeight);
             break;
         case 3: //用户离开房间
             $("li[data-username='" + data.user + "']").remove();
             break;
         case 4:
            $(".username").html(data.username);//此时还包括用户独立的userid 可放入全局变量中用于判断和是否是和自己聊天
            //console.log(data);
             break;

     }
 };

 websocket.onerror = function (evt, e) {
     alert('Error occured: ' + evt.data);
 };
function format(str){
    var list = str.match(/\[[\u4e00-\u9fa5]*\w*\]/g);
    var filter = /[\[\]]/g;
    var title;
    var _hash={微笑:'img/weixiao.gif',
        嘻嘻:'img/xixi.gif',
        哈哈:'img/haha.gif',
        可爱:'img/keai.gif',
        可怜:'img/kelian.gif',
        挖鼻:'img/wabi.gif',
        吃惊:'img/chijing.gif',
        害羞:'img/haixiu.gif',
        挤眼:'img/jiyan.gif',
        闭嘴:'img/bizui.gif',
        鄙视:'img/bishi.gif',
        爱你:'img/aini.gif',
        泪:'img/lei.gif',
        偷笑:'img/touxiao.gif',
        亲亲:'img/qinqin.gif',
        生病:'img/shengbing.gif',
        太开心:'img/taikaixin.gif',
        白眼:'img/baiyan.gif',
        右哼哼:'img/youhengheng.gif',
        左哼哼:'img/zuohengheng.gif',
        嘘:'img/xu.gif',
        衰:'img/shuai.gif',
        吐:'img/tu.gif',
        哈欠:'img/haqian.gif',
        抱抱:'img/baobao.gif',
        怒:'img/nu.gif',
        疑问:'img/yiwen.gif',
        馋嘴:'img/chanzui.gif',
        拜拜:'img/baibai.gif',
        思考:'img/sikao.gif',
        汗:'img/han.gif',
        困:'img/kun.gif',
        睡:'img/shui.gif',
        钱:'img/qian.gif',
        失望:'img/shiwang.gif',
        酷:'img/ku.gif',
        色:'img/se.gif',
        哼:'img/heng.gif',
        鼓掌:'img/guzhang.gif',
        晕:'img/yun.gif',
        悲伤:'img/beishang.gif',
        抓狂:'img/zhuakuang.gif',
        黑线:'img/heixian.gif',
        阴险:'img/yinxian.gif',
        怒骂:'img/numa.gif',
        互粉:'img/hufen.gif',
        书呆子:'img/shudaizi.gif',
        愤怒:'img/fennu.gif',
        感冒:'img/ganmao.gif',
        心:'img/xin.gif',
        伤心:'img/shangxin.gif',
        猪:'img/zhu.gif',
        熊猫:'img/xiongmao.gif',
        兔子:'img/tuzi.gif',
        OK:'img/ok.gif',
        耶:'img/ye.gif',
        GOOD:'img/good.gif',
        NO:'img/no.gif',
        赞:'img/zan.gif',
        来:'img/lai.gif',
        弱:'img/ruo.gif',
        草泥马:'img/caonima.gif',
        神马:'img/shenma.gif',
        囧:'img/jiong.gif',
        浮云:'img/fuyun.gif',
        给力:'img/geili.gif',
        围观:'img/weiguan.gif',
        威武:'img/weiwu.gif',
        话筒:'img/huatong.gif',
        蜡烛:'img/lazhu.gif',
        蛋糕:'img/dangao.gif',
        发红包:'img/fahongbao.gif'}
    if(list){
        for(var i=0;i<list.length;i++){
            title = list[i].replace(filter,'');
            if(_hash[title]){
                str = str.replace(list[i],' <img src="'+_hash[title]+'"/> ');
            }
        }                
    }
    return str;
};
 $(document).ready(function (e) {
     $('#message_box').scrollTop($("#message_box")[0].scrollHeight);
     $('.uname').hover(
         function () {
             $('.managerbox').stop(true, true).slideDown(100);
         },
         function () {
             $('.managerbox').stop(true, true).slideUp(100);
         }
     );

     var fromname = $('#fromname').val();
     var to_uid = 0; // 默认为0,表示发送给所有用户
     var to_uname = '';
     $('.user_list ').on("dblclick","li>em",function () {

        var state = $(this).data("type");
        $("#use-state").val(state);


        /*
         to_uname = $(this).find('em').text();
         to_uid = $(this).attr('data-id');
         if (to_uname == fromname) {
             alert('您不能和自己聊天!');
             return false;
         }
         if (to_uname == '所有用户') {
             $("#toname").val('');
             $('#chat_type').text('群聊');
             0
         } else {
             $("#toname").val(to_uid);
             $('#chat_type').text('您正和 ' + to_uname + ' 聊天');
         }
         $(this).addClass('selected').siblings().removeClass('selected');
         $('#message').focus().attr("placeholder", "您对" + to_uname + "说：");
         */
     });

     //关闭按钮
     $('.user_list ').on("click","i",function () {
        alert()
     });

     $('.sub_but').click(function (event) {
         var $msg = $("#message");
         var msg = $msg.val();
         if($.trim(msg) != ""){
             sendMessage(event, fromname, to_uid, to_uname);
             $msg[0].focus();
             $msg.attr("placeholder","说点啥吧...");
         }else {
            $msg.val("");
            $msg[0].focus();
            $msg.attr("placeholder","不能发送空白消息!");
         }
     });

     /*按下按钮或键盘按键*/
     $("#message").keydown(function (event) {
         var e = window.event || event;
         var k = e.keyCode || e.which || e.charCode;

        //按下enter发送消息,ctrl+enter换行
        if ((!event.ctrlKey && (k == 13 || k == 10))) {
            event.preventDefault();
            var msg = $(this).val();
            if($.trim(msg) != ""){
                sendMessage(event, fromname, to_uid, to_uname);
                $(this).attr("placeholder","说点啥吧...");
            }else {
                $(this).val("");
                $(this).attr("placeholder","不能发送空白消息!");
            }
        } else if (k == 13 || k == 10) {
            var _val = $(this).val();
            $(this).val(_val + "\n");
  
        }
       
     });
 });

 function sendMessage(event, from_name, to_uid, to_uname) {
     var msg = $("#message").val();
         msg = $.trim(msg);
     if (to_uname != '') {
         msg = '您对 ' + to_uname + ' 说： ' + msg;
     }
     var htmlData = '<div class="msg_item fn-clear">' +
         '   <div class="uface"><img src="images/hetu.jpg" width="40" height="40"  alt=""/></div>' +
         '   <div class="item_right">' +
         '     <div class="msg own">' + msg + '</div>' +
         '     <div class="name_time">' + from_name + ' · 30秒前</div>' +
         '   </div>' +
         '</div>';
     //$("#message_box").append(htmlData);
     websocket.send(JSON.stringify({
         'message': msg,
         'type': 'usersaid'
     }));
     $('#message_box').scrollTop($("#message_box")[0].scrollHeight + 20);
     $("#message").val('');
 }