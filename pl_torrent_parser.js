(function () {
    'use strict';

    if (!window.Lampa) return;

    const pluginName = 'pl_torrent_parser';

    function normalizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isPolish(title) {
        const t = title.toLowerCase();
        return (
            t.includes('pl') ||
            t.includes('polish') ||
            t.includes('lektor') ||
            t.includes('lektor pl') ||
            t.includes('dubbing pl')
        );
    }

    async function searchTPB(query) {
        const mirrors = [
            'https://tpb.party',
            'https://thepiratebay.party',
            'https://pirateproxy.live'
        ];

        for (let mirror of mirrors) {
            try {
                const url = `${mirror}/search/${encodeURIComponent(query)}/1/99/200`;
                const html = await fetch(url).then(r => r.text());

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const rows = doc.querySelectorAll('tr');
                let results = [];

                rows.forEach(row => {
                    const titleEl = row.querySelector('.detName a');
                    const magnetEl = row.querySelector('a[href^="magnet:"]');
                    const sizeEl = row.querySelector('.detDesc');

                    if (!titleEl || !magnetEl) return;

                    const title = titleEl.textContent;
                    if (!isPolish(title)) return;

                    let size = '';
                    if (sizeEl) {
                        const match = sizeEl.textContent.match(/Size (.*?),/);
                        if (match) size = match[1];
                    }

                    results.push({
                        title: title,
                        magnet: magnetEl.getAttribute('href'),
                        size: size || '—',
                        quality: 'Torrent',
                        info: 'PL'
                    });
                });

                if (results.length) return results;
            } catch (e) {
                console.warn('Mirror failed:', mirror);
            }
        }

        return [];
    }

    Lampa.Plugin.add(pluginName, {
        title: 'PL Torrents',
        description: 'Поиск торрент-видео с польской озвучкой',
        version: '1.0.0',

        start: function () {

            Lampa.Parser.add({
                id: pluginName,
                name: 'Polish Torrents',
                type: 'movie',

                search: async function (params, oncomplite) {
                    const title = normalizeTitle(params.title || '');
                    const year = params.year ? ` ${params.year}` : '';
                    const query = `${title}${year} PL`;

                    const torrents = await searchTPB(query);

                    const results = torrents.map(t => ({
                        title: t.title,
                        url: t.magnet,
                        quality: t.quality,
                        info: `${t.size} | ${t.info}`,
                        file: true
                    }));

                    oncomplite(results);
                }
            });

            console.log('PL Torrent Parser loaded');
        }
    });
})();
