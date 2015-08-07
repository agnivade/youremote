
var React = require('react');
var Mui = require('material-ui');

var data = [
  {author: "Pete Hunt", text: "This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];

var ThemeManager = new Mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var Colors = Mui.Styles.Colors;

var AppBar = Mui.AppBar;

var Comment = React.createClass({
  render: function() {
      return (
        <div className="comment">
        <div className="author">{this.props.author}</div>
        {this.props.children}
        </div>
      )
      }
  });
var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
          return (
          <Comment author={comment.author}>
            {comment.text}
          </Comment>
          );
        });
        return (
          <div className="commentList">
           {commentNodes}
          </div>
          );
      }
});

var CommentForm = React.createClass({
    render: function() {
      return (
            <div className="commentForm">
              <br /><br />
              Hello, world! I am a CommentForm.
            </div>
            );
        }
});

var CommentBox = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
   render: function() {
     return (
           <div className="commentBox">
           <AppBar title="Hello There" />
           <h1>Comments</h1>
           <CommentList data={data}/>
           <CommentForm />
            </div>
            );
  }
});

React.render(
  <CommentBox />,
  document.getElementById('content')
);

