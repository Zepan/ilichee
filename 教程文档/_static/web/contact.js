(function() {
    //Load Stylesheet
    var root = 'https://keyreply.com';
    var head = document.getElementsByTagName('head')[0],
        stylesheet = document.createElement('link');
    stylesheet.type = 'text/css';
    stylesheet.rel = 'stylesheet';
    // stylesheet.href = root + '/chat/widget.css';
    stylesheet.href = "../_static/web/contact.css"
    head.appendChild(stylesheet);

    setTimeout(function() {
        (window.jQuery && init()) || loadScript("https://code.jquery.com/jquery-3.1.1.min.js", init);
    }, 1000);

    function loadScript(url, callback) {

        var script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) { //IE
            script.onreadystatechange = function() {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function() {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function init() {
        var $ = window.jQuery;

        var settings = {},
            script = $('#keyreply-script'),
            site = window.location.host,
            salt = '\x26\x63\x69\x64\x3D' + Math.round(2147483647 * Math.random()),
            kga = ["aHR0cHM6Ly9zc2wuZ29vZ2xlLWFuYWx5dGljcy5jb20vY29sbGVjdD92PTEmdGlkPVVBLTU1OTEzMzY2LTEz", "JnQ9cGFnZXZpZXcmZGw9", "JnQ9ZXZlbnQmZWM9aW50ZXJhY3Rpb24mZWE9YWN0aXZhdGU="],
            cipher = script.data('apps'),
            align = script.data('align'),
            whitelabel = script.data('whitelabel'),
            colors = {
                livechat: '#334433',
                skype: '#00AFF0',
                whatsapp: '#30BE2D',
                email: '#2D70E7',
                sms: '#0AD02C',
                phone: '#0AD02C',
                facetime: '#0DD12F',
                telegram: '#2DA5E1',
                facebook: '#0084FF',
                kakao: '#FBDE24',
                line: '#3ACE01',
                snapchat: '#FFFC00',
                wechat: '#1ECE29',
                reddit: '#017AD4',
                twitter: '#2DAAE1',
                hipchat: '#274970',
                slack: '#423843',
                handouts: '#70AD46'
            };

        settings.apps = JSON.parse(decodeURI(atob(cipher)));

        settings.tags = {
            page: [atob(kga[0]), atob(kga[1]), site, salt].join(''),
            event: [atob(kga[0]), atob(kga[2]), salt].join('')
        };

        settings.color = script.data('color');
        settings.overlay = script.data('overlay');
        var numberOfApps = Object.keys(settings.apps).length;
        if (!Mobile) {
            if (settings.apps.sms) numberOfApps--;
            if (settings.apps.kakao) numberOfApps--;
        }

        var maxIconCount = Math.floor((window.innerHeight - 130) / 62);

        var anchor = $('<div>')
            .attr('id', 'keyreply-container')
            .appendTo($('body'));

        if (align == 'left') {
            anchor.addClass('left');
        } else if (align == 'rightshift') {
            anchor.addClass('rightshift');
        }

        var launcher = $('<div>')
            .addClass('keyreply-launcher')
            .addClass('keyreply-effect')
            .css('background-image', 'url("data:image/svg+xml;charset=utf8,%3Csvg width=\'26\' height=\'26\' viewBox=\'0 0 26 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cellipse fill=\'' + escape(settings.color) + '\' cx=\'13\' cy=\'13\' rx=\'12\' ry=\'12\'/%3E%3Cpath d=\'M6.798 15.503l1.453-.92c.617.215 1.29.334 2 .334 2.898 0 5.247-1.996 5.247-4.46 0-2.46-2.35-4.457-5.248-4.457C7.35 6 5 7.996 5 10.458c0 1.446.81 2.73 2.065 3.545l-.503 1.273c-.038.03-.062.076-.062.127 0 .09.074.162.166.162.054 0 .1-.024.132-.062z\' stroke=\'' + escape(settings.color) + '\' stroke-width=\'.2\' fill=\'%23FFF\'/%3E%3Cpath d=\'M20.297 18.97l.04-.065-.578-1.155c1.066-.814 1.737-1.993 1.737-3.305 0-2.455-2.35-4.445-5.248-4.445-2.9 0-5.25 1.99-5.25 4.445s2.35 4.445 5.25 4.445c.838 0 1.63-.167 2.334-.463l1.39.756c.035.05.095.085.163.085.107 0 .194-.085.194-.19 0-.04-.012-.076-.033-.107z\' stroke=\'' + escape(settings.color) + '\' stroke-width=\'.2\' fill=\'%23FFF\'/%3E%3C/g%3E%3C/svg%3E")')
            .css('background-color', settings.color)
            .appendTo(anchor)
            .click(function() {
                launcher.addClass('keyreply-show-effect');
                setTimeout(function() {
                    launcher.removeClass('keyreply-show-effect');
                }, 700);
            });

        var ua = navigator.userAgent;
        var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
        var Android = !!ua.match(/Android/i);
        var Mobile = !!ua.match(/Mobi/i);
        var Mac = !!ua.match(/Macintosh/i);

        $.get(settings.tags.page);



        //Add overlay
        $.each(settings.apps, function(key, value) {
            if (Mobile || (key != 'sms' && key != 'kakao')) {
                $('<div>')
                    .addClass('keyreply-chat-icon')
                    .attr('data-type', key)
                    .css('background-color', colors[key])
                    .append(
                        $('<img>')
                        .attr('src', root + '/chat/images/apps/' + key + '.svg')
                        .attr('alt', key)
                    )
                    .append($('<div class="keyreply-label">').text(key.charAt(0).toUpperCase() + key.slice(1)))
                    .hide()
                    .appendTo(anchor);
            }
        });


        //Add a more icon
        var more = $('<div>')
            .css('background-color', '#888888')
            .addClass('keyreply-chat-icon')
            .attr('data-type', 'more')
            .append(
                $('<img>')
                .attr('src', root + '/chat/images/apps/' + 'more' + '.svg')
                .attr('alt', 'more')
            )
            .append($('<div class="keyreply-label">').text('More').css('color', 'white'))
            .hide()
            .click(function() {
                anchor.find('.keyreply-chat-icon').each(function(index, img) {
                    img = $(img);

                    if (index <= numberOfApps - maxIconCount) {
                        if (img.is(':visible')) {
                            img.animate({
                                'bottom': "",
                                'right': "",
                                'opacity': 0
                            }, 'fast', function() {
                                img.hide();
                            });

                        } else {
                            //Setting
                            var option = {
                                'opacity': 1,
                                'bottom': 82 + index % maxIconCount * 62
                            };

                            /*        option[(align == 'left' ? 'left' : 'right')] = 52 + 16 + Math.floor(index / maxIconCount) * 52;
                                   option[(align == 'left' ? 'right' : 'left')] = "auto"; */

                            option['right'] = 62 + 16 + Math.floor(index / maxIconCount) * 62;
                            option['left'] = "auto";

                            img.show().animate(option, 'fast');
                        }
                    }
                });
            });

        if (numberOfApps > maxIconCount) {
            more.appendTo(anchor);
        }

        $(window).resize(function() {
            maxIconCount = Math.floor((window.innerHeight - 130) / 62);
            if (numberOfApps > maxIconCount) {
                more.appendTo(anchor);
            } else {
                more.detach();
            }
        });


        launcher.click(function() {
            $('#keyreply-container > .keyreply-chat-icon').each(function(index, img) {
                img = $(img);
                if (launcher.is('.keyreply-launcher-active')) {
                    img.animate({
                        'bottom': 20,
                        'right': 100,
                        'opacity': 0
                    }, 'fast', function() {
                        img.css('right', '')
                            .css('bottom', '')
                            .hide();
                    });

                } else {
                    if (numberOfApps > maxIconCount) {
                        if (index > numberOfApps - maxIconCount) {
                            img.show().animate({
                                'opacity': 1,
                                'bottom': 82 + (maxIconCount - ((numberOfApps - index) % maxIconCount) - 1) * 62,
                            }, 'fast');
                        }
                    } else {
                        img.show().animate({
                            'opacity': 1,
                            'bottom': 82 + index * 62,
                        }, 'fast');
                    }
                }
            });

            if (!launcher.is('.keyreply-launcher-active')) {
                $.get(settings.tags.event);
            }

            launcher.toggleClass('keyreply-launcher-active');
        });


        $('.keyreply-chat-icon, .keyreply-overlay-chat-icon').each(function(index, icon) {
            var link, qr, app = $(icon);
            var container = $('<div>').addClass('keyreply-qr');
            switch (app.data('type')) {

                case 'email':
                    link = "mailto:" + settings.apps.email;
                    break;
                case 'sms':
                    link = "sms:" + settings.apps.sms;
                    break;
                case 'phone':
                    if (Mobile) {
                        link = "tel:" + settings.apps.phone;
                    } else {
                        container.css('color', 'white').css('padding', '8px').css('padding-top', '32px');
                        $('<a target="_blank" class="keyreply-button">').attr('href', "tel://" + settings.apps.phone).text(settings.apps.phone).appendTo(container);
                        qr = true;
                        break;
                    }
                    break;
                case 'facetime':
                    link = "facetime-audio:" + settings.apps.facetime;
                    break;
                case 'telegram':
                    link = "tg://resolve?domain=" + settings.apps.telegram.replace('@', '');
                    break;

                case 'skype':
                    link = "skype:" + (iOS ? "//" : "") + settings.apps.skype + "?chat";
                    break;

                case 'facebook':
                    link = "https://m.me/" + settings.apps.facebook;
                    break;
                case 'kakao':
                    app.find('.keyreply-label').css('color', '#1F1F1F');
                    link = "http://goto.kakao.com/" + settings.apps.kakao;
                    break;

                case 'reddit':
                    //Deeplink not possible
                    link = "https://www.reddit.com/message/compose/?to=" + settings.apps.reddit;
                    break;

                case 'twitter':
                    if (Mobile) {
                        link = "twitter://user?screen_name=" + settings.apps.twitter.replace('@', '');
                    } else {
                        link = "https://twitter.com/" + settings.apps.twitter.replace('@', '');
                    }
                    break;

                case 'whatsapp':
                    if (Mobile) {
                        link = 'whatsapp://send/?phone=' + encodeURIComponent(settings.apps.whatsapp) + '&text=' + encodeURIComponent(settings.message || "Hello")
                    } else {
                        link = 'https://web.whatsapp.com/send?phone=' + encodeURIComponent(settings.apps.whatsapp) + '&text=' + encodeURIComponent(settings.message || "Hello")
                    }
                    break;

                case 'wechat':
                    if (settings.apps.wechat.length > 100 || /^(http)/.test(settings.apps.wechat)) {
                        container.css('background-image', 'url("' + settings.apps.wechat + '")');
                    } else {
                        $("<div style=\"color:white;\">WeChat ID (微信号): " + settings.apps.wechat + "</div>").appendTo(container);
                    }
                    qr = true;
                    break;
                case 'line':
                    if (/^http.+ti\/p\/.+/.test(settings.apps.line)) {
                        link = settings.apps.line;
                    } else {
                        container.css('color', 'white').css('padding-top', '32px').text("Line ID: " + settings.apps.line);
                        $('<br><a class="keyreply-button" href="line://">Open Line</a>').appendTo(container);
                        qr = true;
                    }

                    break;
                case 'snapchat':
                    app.find('.keyreply-label').css('color', '#1F1F1F');
                    container.css('background-image', 'url("' + settings.apps.snapchat + '")');
                    qr = true;
                    break;

                default:
                    break;
            }

            if (qr) {
                app.append(container);
            }

            app.click(function(event) {
                event.stopPropagation();

                if (qr) {
                    if (app.is('.keyreply-panel')) {
                        app.removeClass('keyreply-panel');
                        app.find('.keyreply-qr').removeClass('active');
                    } else {
                        app.siblings().removeClass('keyreply-panel');
                        app.addClass('keyreply-panel');
                        app.find('.keyreply-qr').addClass('active');
                    }
                }

                if (link) {
                    app.siblings().removeClass('keyreply-panel');

                    if (Mobile) {
                        window.location = link;
                    } else {
                        var a = $('<a>').attr('target', '_blank').attr('href', link);
                        a.appendTo(anchor)[0].click();
                        a.detach();
                    }
                }
            });
        });

        window.initializeKeyreply = init;
        return true;
    }
})();