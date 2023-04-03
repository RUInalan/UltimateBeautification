// ==UserScript==
// @name         致美化签到
// @namespace    倚楼听风雨
// @description  致美化签到
// @version      6.7.10
// @author       倚楼听风雨
// @crontab      * 1-23 once * *
// @grant GM_xmlhttpRequest
// @grant GM_notification
// @connect zhutix.com
// @connect zhutix.com
// @cloudCat
// @exportCookie domain=.zhutix.com
// ==/UserScript==
return new Promise((resolve, reject) => {
    // 方式一： 手动填写tocker
    var token1999 = "";

    //方式二：填写账号密码自动获取tocker
    var Username =  "";
    var Password =  "";
    
    const datas = "nickname=&username="+Username+"&password="+Password+"&code=&img_code=&invitation_code=&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvemh1dGl4LmNvbSIsImlhdCI6MTY4MDE2MTczOSwibmJmIjoxNjgwMTYxNzM5LCJleHAiOjE2ODAxNjE5MTksImRhdGEiOnsidmFsdWUiOiJhZmQ1ODYzN2RhYzFjMjlkOGJiM2I0NGMzNmM1NGM0YiJ9fQ.eXp5EgITP6tf9KlgMQsY7erY83cbA--HTx9jHTk1Tss&smsToken=&luoToken=&confirmPassword=&loginType=";
    GM_xmlhttpRequest({
        method: 'post',
        url: 'https://zhutix.com/wp-json/jwt-auth/v1/token',
        data: JSON.stringify(datas),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "*",
        onload: function (xhr12) {
            console.log(xhr12);
            var json = xhr12.responseText;
            var start = json.indexOf('token') + 8;
            var closure = json.indexOf('exp') - 3;
            console.log("token:" + start);
            var token = json.slice(start, closure);
            console.log("token:" + token);
            var Type = xhr12.status;
            if(Type != 200) {
                token = token1999;
            }
            GM_xmlhttpRequest({
                method: 'POST',
                url: 'https://zhutix.com/wp-json/b2/v1/getTaskData',
                headers: {
                    "Authorization": "Bearer " + token
                },
                responseType: "json",
                onload: function (xhr) {
                    var jsonret = xhr.responseText;
                    var json = JSON.parse(jsonret);
                    console.log(json.task.task_mission);
                    var finish = json.task.task_mission.finish;
                    if (finish == 0) {
                        console.log(json);
                        SignIn();
                    } else {
                        GM_notification({
                            title: '致美化',
                            text: '今日以签到过了，明天在来签到吧！',
                            timeout: 3000,
                        });
                        resolve(json.task.task_mission);
                    }
                    var task_comment = json.task.task_comment;
                    var finish = task_comment.finish;
                    var i = 3 - finish;
                    console.log(i);
                    AWordEveryDay(i);
                    var task_follow = json.task.task_follow.finish;
                    if (task_follow == 0) {
                        PayCloseAttentionTo(2);
                    }
                }
            })
            function SignIn() {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: 'https://zhutix.com/wp-json/b2/v1/userMission',
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                    responseType: "text",
                    onload: function (xhr) {
                        console.log("响应信息：" + xhr.responseText);
                        var ret = xhr.responseText;
                        var information = ret.slice(1, 2);
                        console.log("提取后的响应信息：" + information);
                        if (information == 2 || information == 1 || information == 3) {
                            GM_notification({
                                title: '致美化',
                                text: '今日以签到过了，明天在来签到吧！',
                                timeout: 3000,
                            });
                            resolve('重复签到！');
                        }
                        var bs = ret.indexOf('bs');
                        var jf = ret.slice(bs + 5, bs + 6);
                        console.log("积分：" + jf);
                        if (jf != null && jf > 0) {
                            GM_notification({
                                title: '致美化',
                                text: "今日签到成功，获取到：" + jf + "积分。",
                                timeout: 3000,
                            });
                            resolve('日志：' + xhr.responseText);
                        } else {
                            resolve('签到错误日志：' + xhr.responseText);
                        }
                    },
                    onerror: function () {
                        GM_notification({
                            title: '致美化签到自动签到 - ScriptCat',
                            text: '网络错误,致美化签到签到失败',
                        });
                        reject('网络错误,致美化签到签到失败');
                    }
                });
            }
            function sleep(time) {
                var timeStamp = new Date().getTime();
                var endTime = timeStamp + time;
                while (true) {
                    if (new Date().getTime() > endTime) {
                        return;
                    }
                }
            }
            function AWordEveryDay(Frequency) {
                console.log("评论" + Frequency + "次");
                if (Frequency > 0) {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'https://saying.api.azwcl.com/saying/get',
                        responseType: "json",
                        onload: function (xhr) {
                            var jsonret = xhr.responseText;
                            var json = JSON.parse(jsonret);
                            console.log(json.data.content);
                            var content = json.data.content;
                            console.log("---------------第1次评论---------------")
                            CommentOn(content);
                            Frequency = Frequency - 1;
                            sleep(15000);
                            AWordEveryDay(Frequency)
                        }
                    })
                }
            }
            /**评论
             * 
             * @param {var} Words 评论的文字 
             */
            function CommentOn(Words) {
                console.log(Words);
                var datas = "comment_post_ID=64480&author=" + name + "&email=&comment=" + Words + "&comment_parent=0&img[imgUrl]=&img[imgId]=";
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: 'https://zhutix.com/wp-json/b2/v1/commentSubmit',
                    data: datas,
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                        "Accept": "application/json, text/plain, */*",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0"
                    },
                    responseType: "*",
                    onload: function (xhr) {
                        var Type = xhr.status;
                        console.log("评论状态码：" + Type);
                        if (Type == 200) {
                            GM_notification({
                                title: '致美化',
                                text: '评论成功！',
                                timeout: 3000,
                            });
                            resolve("评论成功！");
                        } else {
                            GM_notification({
                                title: '致美化',
                                text: '评论失败！',
                                timeout: 3000,
                            });
                            resolve("评论失败！");
                        }
                    }
                })
            }
            function PayCloseAttentionTo(Frequency) {
                console.log("开始关注");
                GM_xmlhttpRequest({
                    method: 'post',
                    url: 'https://saying.api.azwcl.com/saying/get',
                    data: "user_id=64141",
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                        "Accept": "application/json, text/plain, */*",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0"
                    },//请求头信息
                    responseType: "json",
                    onload: function (xhr) {
                        var Outcome = xhr.responseText;
                        console.log("查看关注结果：" + Outcome);
                        if(Outcome == true){
                            GM_notification({
                                title: '致美化',
                                text: '关注成功！',
                                timeout: 3000,
                            });
                        }else if(Outcome == false){
                            GM_notification({
                                title: '致美化',
                                text: '取消关注成功！',
                                timeout: 3000,
                            });
                        }else{
                            GM_notification({
                                title: '致美化',
                                text: '关注脚本执行失败！',
                                timeout: 3000,
                            });
                            Frequency--;
                        }
                        if(Frequency<2){
                            PayCloseAttentionTo();
                            sleep(5000);
                            Frequency++;
                        }
                    }
                })
            }
            resolve('日志：Authorization请求头信息' + token);
        }
    });
});
