$(document).ready(async () => {


  let playlist = []

  let isClicked = false



  $('body').append('<div id="popup1" class="overlay"><div class="popup"><h2 id="popH2">Escolha a playlist.</h2><div class="content"><div class="box"><a class="button" id="dwsdmusic">Dwsdnusic</a></div></div></div></div>')

  await $('.button').click(() => {


    if ($('.button').is('#dwsdmusic')) {
      playlist = [{ name: "Ruse", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/ruse.mp3" },
      { name: "Obvius", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/obvious.mp3" },
      { name: "See You Never", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/see_you_never.mp3" },
      { name: "Hear Me", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/hear_me.mp3" },
      { name: "Truth", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/truth.mp3" },
      { name: "Unplugged", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/unplugged.mp3" },
      { name: "Come Down", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/come_down.mp3" },
      { name: "Intro", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/intro.mp3" },
      { name: "One Thousand Times", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/one_thousand_times.mp3" },
      { name: "Don Krez", author: "Dwsdmusic", src: "https://musics.chrisdarkest.repl.co/sounds/Dwsdmusic/don_krez.mp3" }]


    }


    $('#popup1').remove()
    isClicked = true



    $('body').append('<audio id="player" src=""></audio><div class= "player"><div class="control"><i class="fas fa-play" id="playbtn"></i></div><div class="info"><div class="bar"><div id="progress"></div></div></div><div id="current">0:00</div></div>')


    var player = document.getElementById("player");
    let progress = document.getElementById("progress");
    let playbtn = document.getElementById("playbtn");




    let randomMusic = playlist[Math.floor(Math.random() * playlist.length)]


    $('#player')[0].src = randomMusic.src

    let info = `<p id="MusicInfo">${randomMusic.author} - ${randomMusic.name}<p>`

    $('.info').append(info)

    var playpause = function () {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    }

    player.play()

    player.volume = 0.3




    playbtn.addEventListener("click", playpause);

    player.onplay = function () {
      playbtn.classList.remove("fa-play");
      playbtn.classList.add("fa-pause");
    }

    player.onpause = function () {
      playbtn.classList.add("fa-play");
      playbtn.classList.remove("fa-pause");
    }

    player.ontimeupdate = function () {
      let ct = player.currentTime;
      current.innerHTML = timeFormat(ct);
      //progress
      let duration = player.duration;
      prog = Math.floor((ct * 100) / duration);
      progress.style.setProperty("--progress", prog + "%");
    }

    function timeFormat(ct) {
      minutes = Math.floor(ct / 60);
      seconds = Math.floor(ct % 60);

      if (seconds < 10) {
        seconds = "0" + seconds;
      }

      return minutes + ":" + seconds;
    }

    player.addEventListener('ended', () => {
      randomMusic = playlist[Math.floor(Math.random() * playlist.length)]
      $("#MusicInfo").remove()
      info = `<p id="MusicInfo">${randomMusic.author} - ${randomMusic.name}<p>`
      $('.info').append(info)
      $('#player')[0].src = randomMusic.src
      player.play()

    })
    




  })

    console.log(isClicked)


})




