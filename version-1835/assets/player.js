(function () {
  function setup(streamUrl) {
    var video = document.querySelector('.js-player');
    var cover = document.querySelector('.js-player-cover');
    var started = false;
    var hls = null;

    function attach() {
      if (!video || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 40
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          play();
        }
      });
      video.addEventListener('ended', function () {
        if (hls && hls.destroy) {
          hls.destroy();
          hls = null;
        }
      });
    }
  }

  window.VideoPlayer = {
    setup: setup
  };
})();
