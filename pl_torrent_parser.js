(function () {
    if (!window.Lampa || !Lampa.Parser) return;

    function isPL(text) {
        text = text.toLowerCase();
        return text.indexOf(' pl ') !== -1 ||
               text.indexOf('polish') !== -1 ||
               text.indexOf('lektor') !== -1 ||
               text.indexOf('dubbing') !== -1 ||
               text.indexOf('napisy') !== -1;
    }

    function search(query, callback) {
        var url = 'https://thepiratebay.party/search/' +
            encodeURIComponent(query) + '/1/99/200';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            var results = [];

            if (xhr.status === 200) {
                var rows = xhr.responseText.split('<tr>');
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].indexOf('magnet:?') === -1) continue;
                    if (!isPL(rows[i])) continue;

                    var magnet = rows[i].match(/magnet:\?[^"]+/);
                    var title = rows[i].match(/class="detLink".*?>(.*?)</);

                    if (magnet && title) {
                        results.push({
                            title: title[1],
                            url: magnet[0],
                            quality: 'Torrent',
                            info: 'PL 🇵🇱',
                            file: true
                        });
                    }
                }
            }

            callback(results);
        };

        xhr.send();
    }

    Lampa.Parser.add({
        id: 'pl_only',
        name: 'Polish Torrents 🇵🇱',
        type: 'all',

        search: function (params, oncomplete) {
            var q = params.title || '';
            if (params.year) q += ' ' + params.year;
            search(q, oncomplete);
        }
    });

    Lampa.Noty.show('PL parser loaded');
})();
