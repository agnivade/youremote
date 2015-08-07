
var React = require('react');
var Mui = require('material-ui');

var data = [
  {author: "Pete Hunt", text: "This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];

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

var Main = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
   render: function() {
    var appBarStyle = {
      position: 'fixed',
      top: '0'
    };
    var listStyle = {
      background: 'none',
      marginTop: '10'
    };
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
            <FloatingActionButton iconClassName="muidocs-icon-content-add-circle"/>
            </div>
            );
  }
});

React.render(
  <Main />,
  document.getElementById('content')
);

