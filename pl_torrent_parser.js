(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Parser) return;

    const SOURCE_ID = 'pl_torrents_source';

    function isPL(title) {
        return /(^|\W)(pl|polish|lektor|dubbing|napisy)(\W|$)/i.test(title);
    }

    async function search1337x(query) {
        const url = 'https://cors.isomorphic-git.org/https://www.1377x.to/search/' +
            encodeURIComponent(query) + '/1/';

        try {
            const html = await fetch(url).then(r => r.text());
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const rows = doc.querySelectorAll('table.table-list tr');
            const out = [];

            rows.forEach(row => {
                const titleEl = row.querySelector('td.name a:last-child');
                const magnetEl = row.querySelector('a[href^="magnet:"]');

                if (!titleEl || !magnetEl) return;
                if (!isPL(titleEl.textContent)) return;

                out.push({
                    title: titleEl.textContent,
                    magnet: magnetEl.href
                });
            });

            return out;
        } catch (e) {
            return [];
        }
    }

    Lampa.Parser.add({
        id: SOURCE_ID,
        name: 'Polish Torrents 🇵🇱',
        type: 'all',

        search: async function (params, oncomplete) {
            const query =
                (params.title || '') +
                (params.year ? ' ' + params.year : '');

            const items = await search1337x(query);

            oncomplete(items.map(i => ({
                title: i.title,
                url: i.magnet,
                quality: 'Torrent',
                info: 'PL 🇵🇱',
                file: true
            })));
        }
    });

    console.log('PL torrent source registered');
})();
