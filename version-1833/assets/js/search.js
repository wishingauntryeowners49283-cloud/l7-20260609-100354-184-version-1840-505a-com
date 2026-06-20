(function() {
  var form = document.getElementById('search-form');
  var input = document.getElementById('search-input');
  var resultBox = document.getElementById('search-results');
  var status = document.getElementById('search-status');
  var index = window.siteSearchIndex || [];

  if (!form || !input || !resultBox || !status) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;

  var buildCard = function(item) {
    var link = document.createElement('a');
    link.className = 'movie-card';
    link.href = item.url;

    var poster = document.createElement('div');
    poster.className = 'poster-wrap';

    var image = document.createElement('img');
    image.src = item.image;
    image.alt = item.title;
    image.loading = 'lazy';
    poster.appendChild(image);

    var region = document.createElement('span');
    region.className = 'badge badge-left';
    region.textContent = item.region;
    poster.appendChild(region);

    var type = document.createElement('span');
    type.className = 'badge badge-right';
    type.textContent = item.type;
    poster.appendChild(type);

    var year = document.createElement('span');
    year.className = 'badge-year';
    year.textContent = item.year;
    poster.appendChild(year);

    var shade = document.createElement('span');
    shade.className = 'card-shade';
    shade.textContent = '立即观看';
    poster.appendChild(shade);

    var body = document.createElement('div');
    body.className = 'movie-body';

    var title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = item.title;
    body.appendChild(title);

    var line = document.createElement('p');
    line.className = 'movie-one-line';
    line.textContent = item.oneLine || item.summary;
    body.appendChild(line);

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    var genre = document.createElement('span');
    genre.textContent = item.genre;
    meta.appendChild(genre);
    if (item.tags && item.tags.length) {
      var tag = document.createElement('span');
      tag.textContent = item.tags[0];
      meta.appendChild(tag);
    }
    body.appendChild(meta);

    link.appendChild(poster);
    link.appendChild(body);
    return link;
  };

  var render = function(query) {
    var q = query.trim().toLowerCase();
    resultBox.innerHTML = '';

    if (!q) {
      status.textContent = '输入关键词搜索片名、类型、地区、年份或标签。';
      return;
    }

    var matches = index.filter(function(item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return text.indexOf(q) !== -1;
    });

    status.textContent = matches.length ? '搜索结果：' + query : '未找到相关影片';

    if (!matches.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '可以尝试更换关键词，或返回分类页继续浏览。';
      resultBox.appendChild(empty);
      return;
    }

    matches.forEach(function(item) {
      resultBox.appendChild(buildCard(item));
    });
  };

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    var q = input.value.trim();
    var url = new URL(window.location.href);
    if (q) {
      url.searchParams.set('q', q);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
    render(q);
  });

  input.addEventListener('input', function() {
    render(input.value);
  });

  render(initial);
})();
