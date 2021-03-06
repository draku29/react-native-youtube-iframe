import {MUTE_MODE, PAUSE_MODE, PLAY_MODE, UNMUTE_MODE} from './constants';

const getPostMessage = (eventType, data) =>
  `window.ReactNativeWebView.postMessage(JSON.stringify({eventType: ${eventType}, data: ${data}));`;

const getPostMessageFunction = (eventType, data) => `
${getPostMessage(eventType, data)}
true;
`;

export const PLAYER_FUNCTIONS = {
  durationScript: getPostMessageFunction('getDuration', 'player.getDuration()'),
  currentTimeScript: getPostMessageFunction('getCurrentTime', 'player.getCurrentTime()'),
  isMutedScript: getPostMessageFunction('isMuted', 'player.isMuted()'),
  getVolumeScript: getPostMessageFunction('getVolume', 'player.getVolume()'),
  getPlaybackRateScript: getPostMessageFunction('getPlaybackRate', 'player.getPlaybackRate()'),
  getAvailablePlaybackRatesScript: getPostMessageFunction('getAvailablePlaybackRates', 'player.getAvailablePlaybackRates()'),
  seekToScript: (seconds, allowSeekAhead) => `
player.seekTo(${seconds}, ${allowSeekAhead})
`,
  playVideo: 'player.playVideo(); true;',
  pauseVideo: 'player.pauseVideo(); true;',
  muteVideo: 'player.mute(); true;',
  unMuteVideo: 'player.unMute(); true;',
  setPlaybackRate: playbackRate =>
    `player.setPlaybackRate(${playbackRate}); true;`,
  setVolume: volume => `player.setVolume(${volume}); true;`,
  loadPlaylist: (playList, startIndex, play) => `
  player.${play ? 'loadPlaylist' : 'cuePlaylist'}({playlist: ${JSON.stringify(
    playList,
  )},
    index: ${startIndex || 0}}); true;`,
};

export const playMode = {
  [PLAY_MODE]: PLAYER_FUNCTIONS.playVideo,
  [PAUSE_MODE]: PLAYER_FUNCTIONS.pauseVideo,
};

export const soundMode = {
  [MUTE_MODE]: PLAYER_FUNCTIONS.muteVideo,
  [UNMUTE_MODE]: PLAYER_FUNCTIONS.unMuteVideo,
};

export const MAIN_SCRIPT = (
  videoId,
  playList,
  {
    loop = false,
    controls = true,
    cc_lang_pref, // country code
    showClosedCaptions,
    color, // 'red' or 'white'
    end,
    preventFullScreen = false,
    playerLang,
    iv_load_policy,
    modestbranding,
    rel,
    start,
    playsinline = true,
    showinfo,
  },
  allowWebViewZoom,
) => `<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0${
        allowWebViewZoom ? '' : ', maximum-scale=1'
      }"
    >
    <style>
      body {
        margin: 0;
      }
      .container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%;
      }
      .video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="video" id="player" />
    </div>

    <script>
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '1000',
          width: '1000',
          videoId: '${videoId || ''}',
          playerVars: {
            loop: ${loop ? 1 : 0},
            controls: ${controls ? 1 : 0},
            cc_lang_pref: '${cc_lang_pref || ''}',
            cc_load_policy: ${showClosedCaptions ? 1 : 0},
            color: ${color},
            end: ${end},
            fs: ${preventFullScreen ? 0 : 1},
            hl: ${playerLang},
            iv_load_policy: ${iv_load_policy},
            modestbranding: ${modestbranding ? 1 : 0},
            rel: ${rel ? 1 : 0},
            start: ${start},
            listType:  '${typeof playList === 'string' ? 'playlist' : ''}',
            list: '${typeof playList === 'string' ? playList : ''}',
            playsinline: ${playsinline ? 1 : 0},
            showinfo: ${showinfo ? 1 : 0},
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError,
            'onPlaybackQualityChange': onPlaybackQualityChange,
            'onPlaybackRateChange': onPlaybackRateChange,
          }
        });
      }

      function onPlayerError(event) {
        ${getPostMessage('playerError', 'event.data')}
      }

      function onPlaybackRateChange(event) {
        ${getPostMessage('playbackRateChange', 'event.data')}
      }

      function onPlaybackQualityChange(event) {
        ${getPostMessage('playerQualityChange', 'event.data')}
      }

      function onPlayerReady(event) {
        ${getPostMessage('playerReady', 'event.data')}
      }

      var done = false;
      function onPlayerStateChange(event) {
        ${getPostMessage('playerStateChange', 'event.data')}
      }

      var isFullScreen = false;
      function onFullScreenChange() {
        isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        
        ${getPostMessage('fullScreenChange', 'Boolean(isFullScreen)')}
      }

      document.addEventListener('fullscreenchange', onFullScreenChange)
      document.addEventListener('mozfullscreenchange', onFullScreenChange)
      document.addEventListener('msfullscreenchange', onFullScreenChange)
      document.addEventListener('webkitfullscreenchange', onFullScreenChange)
    </script>
  </body>
</html>`;
