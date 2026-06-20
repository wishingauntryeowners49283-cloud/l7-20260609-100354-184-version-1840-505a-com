(function () {
  function initPlayer(panel) {
    var video = panel.querySelector("video[data-hls]");
    var button = panel.querySelector("[data-play-button]");
    var status = panel.querySelector("[data-player-status]");
    var source = video ? video.getAttribute("data-hls") : "";
    var hlsInstance = null;
    var loaded = false;

    if (!video || !button || !source) {
      if (status) {
        status.textContent = "当前影片没有可用播放源。";
      }
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
          button.classList.remove("is-hidden");
        });
      }
    }

    function loadWithNativeHls() {
      video.src = source;
      video.controls = true;
      button.classList.add("is-hidden");
      setStatus("正在使用浏览器原生 HLS 播放。");
      playVideo();
    }

    function loadWithHlsJs() {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.controls = true;
      button.classList.add("is-hidden");
      setStatus("正在初始化 HLS 播放器。连接播放源后会自动播放。 ");

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源已加载，可正常播放。 ");
        playVideo();
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus("播放网络暂时异常，正在重试。 ");
          hlsInstance.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus("媒体解码异常，正在恢复。 ");
          hlsInstance.recoverMediaError();
          return;
        }

        setStatus("当前浏览器无法播放该 HLS 源，请更换浏览器或稍后重试。 ");
        hlsInstance.destroy();
      });
    }

    function load() {
      if (loaded) {
        button.classList.add("is-hidden");
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        loadWithNativeHls();
        return;
      }

      if (window.Hls && Hls.isSupported()) {
        loadWithHlsJs();
        return;
      }

      setStatus("当前浏览器不支持 HLS 播放。请使用 Chrome、Edge、Safari 或 Firefox 的新版浏览器。 ");
    }

    button.addEventListener("click", load);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
  });
})();
