// Requiring the libraries
var React = require('react');
var Mui = require('material-ui');

// Setting the theme to dark
var ThemeManager = new Mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var Colors = Mui.Styles.Colors;

// Component declarations
var AppBar = Mui.AppBar;
var List = Mui.List;
var ListItem = Mui.ListItem;
var ListDivider = Mui.ListDivider;
var Avatar = Mui.Avatar;
var FloatingActionButton = Mui.FloatingActionButton;
var ToggleStar = Mui.ToggleStar;
var FontIcon = Mui.FontIcon;
var Dialog = Mui.Dialog;
var TextField = Mui.TextField;

var Main = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  componentDidMount: function() {
    // Syncing the play queue from the server
    this.syncFromServer();
    setInterval(this.syncFromServer, 10000);
  },
  getInitialState: function() {
    return {data: []};
  },
  // This call gets the queue from the server and renders it
  syncFromServer: function() {
    console.log("sync server called");
    $.ajax({
      url: 'http://localhost:3000/get_queue',
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        var songs = data["queue"];
        this.setState({data: songs});
      }.bind(this),
      error: function(jqxhr, textStatus, error) {
        var err_msg = textStatus + ", " + jqxhr.responseText;
        console.error("Get server queue failed: " + err_msg);
      }
    });
  },
  openDialog: function() {
    console.log("Add button is clicked");
    this.refs.addVideoDialog.show();
  },
  getParameterByName: function(name, videoURL) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(videoURL);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  },
  addVideo: function() {
    var videoURL = this.refs.videoURL.getValue();
    var videoID = this.getParameterByName('v', '?' + videoURL.split('?')[1]);
    console.log("Video was added- " + videoURL);
    var youtubeURL = 'https://www.googleapis.com/youtube/v3/videos?id='+videoID+'&key='+apiKey+'&part=snippet,statistics&fields=items(id,snippet(title,description,thumbnails),statistics)'
    $.ajax({
      url: youtubeURL,
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        if (!data["items"]) {
          console.error("No items in the response- " + JSON.stringify(data));
          return false;
        }
        var dataToPush = [];
        for (var i = 0; i < data["items"].length; i++) {
          // extracting the info from the json response
          var item = data["items"][i];
          var title = item["snippet"]["title"];
          var description = item["snippet"]["description"];
          var thumbnail = item["snippet"]["thumbnails"]["default"]["url"];
          var id = item["id"];
          dataToPush.push({'title':title,
                'description': description,
                'thumbnail': thumbnail,
                'id': id});
        }
        this.pushToServer(dataToPush);
      }.bind(this),
      error: function(jqxhr, textStatus, error) {
        var err_msg = textStatus + ", " + jqxhr.responseText;
        console.error("Youtube call failed: " + err_msg);
      }
    })
    .always(function(){
      this.dismissDialog();
    }.bind(this));
  },
  pushToServer: function(dataToPush) {
    console.log("pushing to server");
    $.ajax({
      url: 'http://localhost:3000/push_data',
      method: 'POST',
      data: JSON.stringify({"queue": dataToPush}),
      dataType: 'text',
      contentType: 'application/json',
      success: function(data) {
        console.log(data);
        this.syncFromServer();
      }.bind(this),
      error: function(jqxhr, textStatus, error) {
        var err_msg = textStatus + ", " + jqxhr.responseText;
        console.error("Get server queue failed: " + err_msg);
      }
    });
  },
  dismissDialog: function() {
    this.refs.addVideoDialog.dismiss();
  },
  render: function() {
  // These are the css styles
  var appBarStyle = {
    position: 'fixed',
    top: '0'
  };
  var actionButtonStyle = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    marginRight: '50',
    marginBottom: '50'
  };
  // The action buttons for the add button
  var standardActions = [
    { text: 'Cancel', onClick: this.dismissDialog },
    { text: 'Add', onClick: this.addVideo, ref: 'add' }
  ];
   return (
          <div className="main">
          <AppBar title="Welcome" zDepth={1} style={appBarStyle} />

          <SongList data={this.state.data} />

          <FloatingActionButton onClick={this.openDialog} style={actionButtonStyle}>
          <FontIcon className="material-icons">add</FontIcon>
          </FloatingActionButton>

          <Dialog
            ref="addVideoDialog"
            title="Enter the url of the youtube video"
            actions={standardActions}
            modal={true}>
            <TextField
              ref="videoURL"
              hintText="https://www.youtube.com/watch?v=qcOiJnWniWg"
              fullWidth={true} />
          </Dialog>
          </div>
          );
  }
});

var SongList = React.createClass({
  render: function() {
    var listStyle = {
      background: 'none',
      marginTop: '60'
    };
    var listNodes = this.props.data.map(function (song) {
        return (
          <div>
          <ListItem
            leftAvatar={<Avatar src={song.thumbnail} />}
            primaryText={song.title}
            secondaryText={song.description}
            secondaryTextLines={2} />
          <ListDivider inset={true} />
          </div>
        );
      });
    return (
      <div>
      <List style={listStyle}>
        {listNodes}
      </List>
      </div>
    );
  }
});

React.render(
  <Main />,
  document.getElementById('content')
);

