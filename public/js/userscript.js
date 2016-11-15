// ==UserScript==
// @name         pull-request-file-launcher
// @namespace    https://denimsoft.com/
// @version      0.1
// @description  Adds "Open in PhpStorm" functionality to top-level pull request comments.
// @author       Andrew Mackrodt <andrew@denimsoft.com>
// @match        https://bitbucket.org/*/*/pull-requests/*/*/diff
// @grant        none
// @downloadURL  https://rawgit.com/denimsoft/pull-request-file-launcher/master/public/js/userscript.js
// ==/UserScript==

var interval = setInterval(
    function () {
        if ($('#pullrequest-diff').length > 0) {
            clearInterval(interval);
            onLoad();
        }
    }, 200);

function onLoad () {
    var project = window.location.href.replace(/^.+\/([a-z0-9_-]+\/[a-z0-9_-]+)\/pull-.+$/i, '$1');

    $('.comment-thread-container').each(function () {
        var id = $(this).prev('[class*="udiff"]').find('.gutter').attr('id');
        var file, line;

        if (('' + id).match(/^.+T\d+$/)) {
            id = id.substr(1);
            file = id.replace(/T\d+$/, '');
            line = id.replace(/^.+T/, '');
        } else {
            file = $(this).parents('.diff-container').find('.filename').text().replace(/^\s*File\s+/, '').trim();
            line = 0;
        }

        if (file.length === 0) {
            console.log('ERROR INJECTING PHPSTORM HELPER', this);
            return;
        }

        var $last = $(this).find('article:eq(0) .comment-actions li:last-child');

        $('<li></li>')
            .append($('<a></a>')
                .attr({
                    href: 'http://127.0.0.1:5891/?' + $.param({
                        project: project,
                        file: file,
                        line: line
                    }),
                    target: '_blank'
                })
                .append($('<span></span>')
                    .text('Open in PhpStorm')
                    .css({
                        background: "url('https://rawgit.com/denimsoft/pull-request-file-launcher/master/public/img/icons/phpstorm.png') no-repeat",
                        paddingLeft: '16px'
                    })
                ))
            .insertBefore($last);
    });
}