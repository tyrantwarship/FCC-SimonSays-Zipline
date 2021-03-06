var React = require("react");
var ReactDOM = require("react-dom");
var EventEmitter = require("events").EventEmitter;
var AppConstants = require("./constants/AppConstants.js");
var AppDispatcher = require("./dispatcher/AppDispatcher.js");
var AppActions = require("./actions/AppActions.js");
var AppStore = require("./stores/AppStores.js");
var $ = require("jquery");


var audio = document.createElement("audio");
var turn  = 1;
var winner_delay = 1;

function playSound(id) {
  switch (id) {
    case "GREEN":
      audio.src = "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3";
      audio.play();
    break;
    case "RED":
      audio.src = "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3";
      audio.play();
    break;
    case "YELLOW":
      audio.src = "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3";
      audio.play();
    break;
    case "BLUE":
      audio.src = "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3";
      audio.play();
    break;
  }
}

function displayError() {
  var prev_display = $(".menu-text").text();
  $(".menu-text").text("!!");
  setTimeout(function () {
    $(".menu-text").text(prev_display);
  }, 1000);
}

function runThroughSequence(sequence) {
  // take the sequence and run through every element
  var seconds = .6;
  var highlight_delay  = seconds * 1000;
  setTimeout(function () {
    sequence.forEach(function (value, index) {
      // for every element take the value and run it through ids to select the element
      console.log("my value is: " + value)
      setTimeout( function () {
        switch (value) {
          case "GREEN":
            console.log($("#GREEN").css("background"));
            $("#GREEN").addClass("GREEN");
            playSound("GREEN");
            setTimeout(function () {
              $("#GREEN").removeClass("GREEN");
            }, highlight_delay);
            break;
          case "RED":
            console.log($("#RED").css("background"));
            $("#RED").addClass("RED");
            playSound("RED");
            setTimeout(function () {
              $("#RED").removeClass("RED");
            }, highlight_delay);
            break;
          case "YELLOW":
            console.log($("#YELLOW").css("background"));
            $("#YELLOW").addClass("YELLOW");
            playSound("YELLOW");
            setTimeout(function () {
              $("#YELLOW").removeClass("YELLOW");
            }, highlight_delay);
            break;
          case "BLUE":
            console.log($("#BLUE").css("background"));
            $("#BLUE").addClass("BLUE");
            playSound("BLUE");
            setTimeout(function () {
              $("#BLUE").removeClass("BLUE");
            }, highlight_delay);
            break;
        }
      }, 800 * index);
    });
  }, highlight_delay);

}


var Board = React.createClass({
  power: false,
  strict_mode: false,
  queue: [],
  user_queue: [], 
  _powerSwitch: function () {
    this.power = !this.power;
    if (this.power) {
    this.queue.push(this._generateQueueElement());
    console.log(this.queue);
    AppActions.sequenceLengthIncremented(this.queue);
    runThroughSequence(this.queue);
    } else {
      this.queue = [];
      AppActions.sequenceLengthIncremented(this.queue);
    }
  },
  _strictMode: function () {
    this.strict_mode = !this.strict_mode;
    console.log("strict mode is: " + this.strict_mode);
  },
  _generateQueueElement: function () {
    switch (Math.floor(Math.random() * 4)) {
      case 0:
          return AppConstants.GREEN;
        break;
      case 1:
          return AppConstants.RED;
        break;
      case 2:
          return AppConstants.BLUE;
        break;
      case 3:
          return AppConstants.YELLOW;
        break;
    }
  },
  _onButtonClick: function (button) {
    var self = this;
    this.user_queue.push(button);
    // don't do any of the logic until the sequences are the same length
    if (this.user_queue.length != this.queue.length) {
      // detect errors automatically as they happen
      if (this.queue[this.user_queue.length-1] != this.user_queue[this.user_queue.length-1]) {
        this.user_queue = []; 
        if (this.strict_mode) {
          // AppActions.playerInputIncorrectSequence();
          // go back to the first turn if you mess up in strict mode
          turn = 1;
          this.queue = [];
          this.queue.push(this._generateQueueElement());
          displayError();
          setTimeout(function () {
            AppActions.sequenceLengthIncremented(self.queue);
            runThroughSequence(self.queue);
          },1200);
        } else {
          // AppActions.playerInputIncorrectSequence();
          console.log("Error please start the sequence over!");
          displayError();
          setTimeout(runThroughSequence(this.queue), 1200);
        }
      }
      return;
    } 
    var sequence_correct = this.queue.every(function (value, index) {
      return self.user_queue[index] == value;
    });
    // before you start adding elements check, if we got the sequence correct first
    if (sequence_correct && (this.user_queue.length == this.queue.length)) {      
      turn++;
      if (turn == 20) {
        // here is where we check if the player has won! display to him and restart the game
        winner_delay = 1200;
        console.log("you won");
        $(".menu-text").text("WIN");
        self.queue = [];
        turn = 1;
      }
      setTimeout(function () {
        var tmp = self._generateQueueElement();
        self.queue.push(tmp);
        AppActions.sequenceLengthIncremented(self.queue);
        runThroughSequence(self.queue);
        console.log("button click generation: " + tmp);
      }, winner_delay);
      winner_delay = 1;
    } else {
      // if strict mode on
      // AppActions.playerInputIncorrectSequence();
      displayError();
      setTimeout(function() {
        if (self.strict_mode) {
          // clear queue && user_queue if we got it wrong
          console.log("i'm the strict mode if");
          turn = 1;
          self.queue = [];
          self.queue.push(self._generateQueueElement());
          AppActions.sequenceLengthIncremented(self.queue);
          runThroughSequence(self.queue);
          // it needs to present you with a brand new sequence starting from one
        } else { // if strict mode off
          // remove the last button pressed by the user and let him try again
          console.log("I'm the else");
          self.user_queue = [];
          runThroughSequence(self.queue);
        }
      }, 1200);
    }
    this.user_queue = [];
    console.log(this.queue);
  },
  // componentWillMount: function () {
  //   this.setState({
  //     queue: this.queue.push(this._generateQueueElement())
  //   });
  // },
  componentDidMount: function () {
   console.log(this.queue);
  },
  render: function () {
    return (
      <div className="board">
        <Menu powerSwitch={this._powerSwitch} strictMode={this._strictMode} queueLength={this.queue.length}/>
        <GameBlock id="GREEN" onButtonClick={this._onButtonClick}/>
        <GameBlock id="RED" onButtonClick={this._onButtonClick}/>
        <GameBlock id="YELLOW" onButtonClick={this._onButtonClick}/>
        <GameBlock id="BLUE" onButtonClick={this._onButtonClick}/>
      </div>
    );
  }
});

var Menu = React.createClass({
  render: function () {
    return (
      <div className="menu">
        <MenuDisplay queueLength={this.props.queueLength}/>
        <MenuPower powerSwitch={this.props.powerSwitch}/>
        <MenuStrictMode strictMode={this.props.strictMode}/>
      </div>
    );
  }
});
var MenuPower = React.createClass({
  _onClickHandler: function () {
    // AppActions.flipPowerSwitch();
    this.props.powerSwitch();
  },
  render: function () {
    return (
      <div className="menu-power" onClick={this._onClickHandler}><i className="fa fa-power-off"></i></div>
    );
  }
});
var MenuStrictMode = React.createClass({
  _onClickHandler: function () {
    $('.menu-mode-label i').toggleClass('strict-mode-active');
    this.props.strictMode();
  },
  render: function () {
    return (
      <div className="menu-mode" onClick={this._onClickHandler}>
        <p className="menu-mode-label">Strict<i className="fa fa-circle"></i></p>
      </div>
    );
  }
});
var MenuDisplay = React.createClass({
  componentWillMount: function () {
    AppStore.addChangeListener(this._onChange);
    AppStore.addErrorListener(this._onError);
  },
  componentWillUnmount: function () {
    AppStore.removeChangeListener(this._onChange);
    AppStore.removeErrorListener(this._onError);
  },
  _onChange: function () {
    //TODO: here is where we should update the state that is being displayed
    console.log("I heard it");
    this.setState({
      queueLength: AppStore.getSequence().length
    });
  },
  _onError: function () {
    console.log("I heard the error");
    this.setState({
      queueLength: "!!"
    });
  },
  getInitialState: function () {
    return {
      queueLength: 0
    };
  },
  render: function () {
    return (
      <div className="menu-display">
        <p className="menu-text">{this.state.queueLength}</p>
      </div>
    );
  }
});

var GameBlock = React.createClass({
  _onClickHandler: function () {
    AppActions.clickedButton(AppConstants[this.props.id]);
    playSound(AppConstants[this.props.id]);
    this.props.onButtonClick(AppConstants[this.props.id]);
  },
  render: function () {
    return (
      <button id={this.props.id} className="simon-button"onClick={this._onClickHandler}></button>
    );
  }
});

ReactDOM.render(
  <Board />,
  document.getElementById("game-board")
);
