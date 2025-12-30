(function () {
    'use strict';

    if (!window.Lampa) return;

    const SOURCE_ID = 'pl_public_source';

    function isPL(title) {
        return /(^|[^a-z])(pl|polish|lektor|dubbing|napisy)([^a-z]|$)/i.test(title);
    }

    async function searchTPB(query) {
        const mirrors = [
            'https://thepiratebay.party',
            'https://tpb.party'
        ];

        for (let m of mirrors) {
            try {
                const res = await fetch(
                    m + '/search/' + encodeURIComponent(query) + '/1/99/200'
                );

                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const rows = doc.querySelectorAll('tr');

                const out = [];

                rows.forEach(row => {
                    const titleEl = row.querySelector('.detName a');
                    const magnetEl = row.querySelector('a[href^="magnet:"]');

                    if (!titleEl || !magnetEl) return;
                    if (!isPL(titleEl.textContent)) return;

                    out.push({
                        title: titleEl.textContent,
                        magnet: magnetEl.href
                    });
                });

                if (out.length) return out;
            } catch (e) {}
        }

        return [];
    }

    Lampa.Parser.add({
        id: SOURCE_ID,
        name: 'Polish Torrents 🇵🇱',
        type: 'all',

        search: async function (params, oncomplete) {
            const query =
                (params.title || '') +
                (params.year ? ' ' + params.year : '');

            const items = await searchTPB(query);

            oncomplete(items.map(i => ({
                title: i.title,
                url: i.magnet,
                quality: 'Torrent',
                info: 'PL 🇵🇱',
                file: true
            })));
        }
    });

    console.log('[PL] parser loaded');
})();
