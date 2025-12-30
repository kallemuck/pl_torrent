(function () {
    'use strict';
    if (!window.Lampa) return;

    const ID = 'pl_public_torrents';
    const NAME = 'Polish Torrents 🇵🇱';

    function isPL(title) {
        return /(^|\W)(pl|polish|lektor|dubbing|napisy)(\W|$)/i.test(title);
    }

    async function searchTPB(query) {
        const mirrors = [
            'https://tpb.party',
            'https://thepiratebay.party'
        ];

        for (let m of mirrors) {
            try {
                const html = await fetch(
                    `${m}/search/${encodeURIComponent(query)}/1/99/200`
                ).then(r => r.text());

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

    Lampa.Plugin.add(ID, {
        title: NAME,
        version: '1.0.0',

        start: function () {
            Lampa.Parser.add({
                id: ID,
                name: NAME,
                type: 'all',

                search: async function (params, oncomplite) {
                    const q =
                        (params.title || '') +
                        (params.year ? ' ' + params.year : '');

                    const items = await searchTPB(q);

                    oncomplite(items.map(i => ({
                        title: i.title,
                        url: i.magnet,
                        quality: 'Torrent',
                        info: 'PL 🇵🇱',
                        file: true
                    })));
                }
            });
        }
    });
})();
