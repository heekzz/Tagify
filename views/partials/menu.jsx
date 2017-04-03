var React = require('react');

var Menu = React.createClass({
    render: function() {
        return (

            <nav className="navbar navbar-default navbar-fixed-bottom">
                <div className="container">
                    <!-- Brand and toggle get grouped for better mobile display -->
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand" href="#">Brand</a>
                    </div>

                    <!-- Collect the nav links, forms, and other content for toggling -->
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <li><a href="/">Home</a></li>
                            <li><a href="/add">Tag my Playlist</a></li>
                        </ul>
                        <p className="navbar-text navbar-right">
                            Signed in as Fredrik
                        </p>
                    </div><!-- /.navbar-collapse -->
                </div><!-- /.container-fluid -->
            </nav>
        );
    }
});

module.exports = Menu;