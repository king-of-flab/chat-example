'use strict';

(function() {

  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var sidebar = document.getElementsByClassName('sidebar')
  var context = canvas.getContext('2d');

  var guessList = ['house', 'sun']

  socket.on('connect', function() {
  })

  var current = {
    color: 'black'
  };
  var drawing = false;

  socket.on('turn', function(turn) {
    if(turn) {
      canvas.addEventListener('mousedown', onMouseDown, false);
      canvas.addEventListener('mouseup', onMouseUp, false);
      canvas.addEventListener('mouseout', onMouseUp, false);
      canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

      $('.sidebar').empty()
      $('.sidebar').append($(`<p> your turn  to draw</p>`))
      $('.sidebar').append($(`<p>DRAW: ${guessList[0]}</p>`))

    } else {
      canvas.removeEventListener('mousedown', onMouseDown, false);
      canvas.removeEventListener('mouseup', onMouseUp, false);
      canvas.removeEventListener('mouseout', onMouseUp, false);
      canvas.removeEventListener('mousemove', throttle(onMouseMove, 10), false);

      $('.sidebar').empty()
      $('.sidebar').append($(`<p> your turn  to guess</p>`))
      // $('.sidebar').append($(`<form class="form"></form>`)) // do we need a form?
      $('.sidebar').append($(`<input id='guessedAns' type="text"><button class='submitBtn'>Submit</button>`))
      $('.sidebar').append($(`<div class="playerGuessedAns"></div>`))

      $('#guessedAns').keyup(function () {
        var guessedAns = $('#guessedAns').val()
        socket.emit('guessedAns', guessedAns)
      })

      $('.submitBtn').on('click', function(e) {
        e.preventDefault()

        socket.emit('guessedAns', '') // to clear guessed field for opp player

        var guessedAns = $('#guessedAns').val()
        $('#guessedAns').val('')
        if (guessedAns === guessList[0]) {
          alert('correct!')
          guessList.splice(0,1)
          console.log(guessList)
          socket.emit('change turn', "dummy variable") // Did not have the need to send anything to server
          context.clearRect(0, 0, canvas.width, canvas.height)
        } else {
          console.log(guessedAns)
          alert('try again')

        }

      })
    }
  })

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  socket.on('guessedAns', function(guessedAns) {
    $('.playerGuessedAns').remove()
    $('.sidebar').append($(`<div class="playerGuessedAns"></div>`))
    $('.playerGuessedAns').append($(`<p>${guessedAns}</p>`))
  })

  socket.on('changeTurnProcess', function () {
    guessList.splice(0,1)
    context.clearRect(0, 0, canvas.width, canvas.height)
    socket.emit('changeTurnProcess', 'dummy variable')
  })

  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight;
  }

})();
