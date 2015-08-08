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
  // This call gets the queue from the server and renders it
  syncFromServer: function() {
    console.log("sync server called");
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
    this.syncFromServer();
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
  var listStyle = {
    background: 'none',
    marginTop: '10'
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

          <List subheader="Song Queue" style={listStyle}>
            <ListItem
              leftAvatar={<Avatar src="http://img.youtube.com/vi/qcOiJnWniWg/1.jpg" />}
              primaryText="Brendan Lim"
              secondaryText={
                <p>
                  <span style={{color: Colors.darkBlack}}>Brunch this weekend?</span><br/>
                  I&apos;ll be in your neighborhood doing errands this weekend. Do you want to grab brunch?
                </p>
              }
              secondaryTextLines={2} />
            <ListDivider inset={true} />
            <ListItem
              leftAvatar={<Avatar src="http://img.youtube.com/vi/x1NAhlVRaZ4/1.jpg" />}
              primaryText="Hey there, this is my Primary Text"
              secondaryText={
                <p>
                  Do whatever you want, I don't want your secondary Text
                </p>
              }
              secondaryTextLines={2} />
            <ListDivider inset={true} />
          </List>

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

React.render(
  <Main />,
  document.getElementById('content')
);

