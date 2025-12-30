(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Parser) return;

    function enc(v){ return encodeURIComponent(v || ''); }

    function buildLinks(title, year){
        var q = title + (year ? ' ' + year : '');
        // Легальные поиски/каталоги в PL
        return [
            {name:'YouTube (PL)', url:'https://www.youtube.com/results?search_query=' + enc(q + ' zwiastun pl')},
            {name:'JustWatch PL',  url:'https://www.justwatch.com/pl/wyszukaj?q=' + enc(q)},
            {name:'TVP VOD',       url:'https://vod.tvp.pl/wyszukiwarka?query=' + enc(q)},
            {name:'Player.pl',    url:'https://player.pl/szukaj?query=' + enc(q)},
            {name:'Polsat Box Go',url:'https://polsatboxgo.pl/wyszukiwarka?query=' + enc(q)},
            {name:'Canal+ PL',    url:'https://www.canalplus.com/pl/search?q=' + enc(q)}
        ];
    }

    function tryOpen(url){
        // разные сборки LAMPA имеют разные хелперы — пробуем по очереди
        try {
            if (Lampa.Utils && Lampa.Utils.openUrl) return Lampa.Utils.openUrl(url);
            if (Lampa.Platform && Lampa.Platform.openURL) return Lampa.Platform.openURL(url);
        } catch (e) {}

        // fallback: показываем ссылку, чтобы ты мог открыть вручную
        if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(url);
    }

    Lampa.Parser.add({
        id: 'pl_legal',
        name: 'PL 🇵🇱 (Legal)',
        type: 'all',

        search: function (params, oncomplete) {
            var title = params.title || '';
            var year  = params.year || '';

            var links = buildLinks(title, year);

            var out = [];
            for (var i = 0; i < links.length; i++){
                (function(item){
                    out.push({
                        title: item.name,
                        // url — это “действие”: при выборе откроем ссылку
                        url: item.url,
                        quality: 'WEB',
                        info: 'Открыть поиск',
                        file: true,
                        // некоторые сборки LAMPA вызывают playback по url;
                        // поэтому мы добавим "магнит" не используем. Здесь просто ссылка.
                        onselect: function(){ tryOpen(item.url); }
                    });
                })(links[i]);
            }

            oncomplete(out);
        }
    });

    if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show('PL Legal source loaded');
})();
