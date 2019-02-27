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
             if ($(".username").html() == '') {
                 $(".username").html(data.user);
             }

             //  var arr = data.alluser.split(',');
             var str = '';
             // console.log(data.alluser);
             // var csss=JSON.parse(data.alluser);

             $.each(JSON.parse(data.alluser), function (key, val) {
                 str += '<li class="fn-clear" data-id="1" data-username="' + key +
                     '"><span><img src="images/hetu.jpg" width="30" height="30"  alt=""/></span><em>' + val +
                     '</em><small class="online" title="在线"></small></li>';

             })
             $("li[data-id='1']").remove();
             $(".user_list").append(str);
             $('#message_box').scrollTop($("#message_box")[0].scrollHeight);
             break;
         case 2: //用户发送消息
             $.emoticons({}, function (api) {
                 data.content = api.format(data.content);
             });

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
     }
 };

 websocket.onerror = function (evt, e) {
     alert('Error occured: ' + evt.data);
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
     $('.user_list > li').dblclick(function () {
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
     });

     $('.sub_but').click(function (event) {
         sendMessage(event, fromname, to_uid, to_uname);
     });

     /*按下按钮或键盘按键*/
     $("#message").keydown(function (event) {
         var e = window.event || event;
         var k = e.keyCode || e.which || e.charCode;
         //按下enter发送消息,ctrl+enter换行
         if ((!event.ctrlKey && (k == 13 || k == 10))) {
             sendMessage(event, fromname, to_uid, to_uname);

         } else if (k == 13 || k == 10) {
             var _val = $(this).val();
             $(this).val(_val + "\n");
         }

     });
 });

 function sendMessage(event, from_name, to_uid, to_uname) {
     var msg = $("#message").val();
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