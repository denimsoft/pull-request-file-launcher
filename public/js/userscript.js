// ==UserScript==
// @name         pull-request-file-launcher
// @namespace    https://denimsoft.com/
// @version      0.6
// @description  Adds "Open in Editor" functionality to pull request diffs.
// @author       Andrew Mackrodt <andrew@denimsoft.com>
// @match        https://bitbucket.org/*/*/pull-requests/*
// @grant        none
// @downloadURL  http://127.0.0.1:5891/js/userscript.js
// ==/UserScript==

var interval = setInterval(
    function () {
        if ($('#pullrequest-diff .bb-patch-unified h1.filename').length > 0) {
            clearInterval(interval);
            addEditorLinks();
        }
    }, 200);

function addEditorLinks () {
    var project = window.location.href.replace(/^.+\/([a-z0-9._-]+\/[a-z0-9._-]+)\/pull-.+$/i, '$1');

    $('#changeset-diff section.bb-udiff').each(function () {
        var filename = $(this).find('h1.filename')[0].innerText;

        if (filename.match(/ DELETED$/)) {
            return;
        }

        filename = filename.replace(/^File (.+) ([A-Z]+)$/, '$1');

        $(this).find('.comment-thread-container').each(function () {
            var id = $(this).prev('[class*="udiff"]').find('.gutter').attr('id');
            var line = ('' + id).replace(/^.+T(\d+)$/, '$1');

            if (!line.match(/^[0-9]+$/)) {
                line = 0;
            }

            $('<li></li>')
                .append($('<a>Open File</a>')
                    .attr({
                        href: 'http://127.0.0.1:5891/?' + $.param({
                            project: project,
                            file: filename,
                            line: line
                        }),
                        target: '_blank'
                    })
                )
                .insertBefore(
                    $(this).find('article:eq(0) .comment-actions li:last-child')
                );
        });

        var $button = $("<a class='view-file aui-button aui-button-light'>Open file</a>")
            .attr({
                href: 'http://127.0.0.1:5891/?' + $.param({
                  project: project,
                  file: filename
                }),
                target: '_blank'
            });

        $button.insertAfter($(this).find('.view-file:eq(0)'));
    });

    var $popup = null;

    $(document).on('mouseenter', 'a.add-line-comment', function () {
        var $lineNumbers = $(this).parent().find('.line-numbers');
        var filename = $lineNumbers.attr('href').replace(/^#L/, '');
        var line = filename.replace(/^.+[FT]([0-9]+)$/, '$1');

        filename = filename.replace(/(?:F[0-9]+)?(?:T[0-9]+)?$/, '');

        if ($popup !== null) {
            $popup.remove();
        }

        $popup = $('<div></div>')
            .css({
                background: 'white',
                borderRadius: '10px',
                padding: '10px 0 10px 5px',
                marginTop: '16px',
                opacity: 0.9,
                position: 'absolute',
                width: '112px',
                zIndex: '9999',
            })
            .append($('<a></a>')
                .attr({
                    href: 'http://127.0.0.1:5891/?' + $.param({
                        project: project,
                        file: filename,
                        line: line
                    }),
                    target: '_blank'
                })
                .append($('<span>Open File</span>')
                    .css({
                        background: "url('https://rawgit.com/denimsoft/pull-request-file-launcher/master/public/img/icons/phpstorm.png') no-repeat",
                        fontSize: '12px',
                        paddingLeft: '20px'
                    })
                )
            );

        var parent = $(this).parents('div.gutter');
        parent.append($popup);

        parent.mouseleave(function () {
            $popup.remove();
        });
    });
}
