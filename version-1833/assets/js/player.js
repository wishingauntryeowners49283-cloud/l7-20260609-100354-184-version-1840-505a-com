function initializeMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-video');
  var button = document.getElementById('movie-play');
  var hls = null;
  var attached = false;

  if (!video || !button || !streamUrl) {
    return;
  }

  var attach = function() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
    } else {
      video.src = streamUrl;
    }

    attached = true;
  };

  var start = function() {
    attach();
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function() {
        button.classList.remove('is-hidden');
      });
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function() {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function() {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function() {
    if (hls) {
      hls.destroy();
    }
  });
}
