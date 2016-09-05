import React, { Component } from 'react';

import Snackbar from 'material-ui/Snackbar';
import RaisedButton from 'material-ui/RaisedButton';

class AlertBar extends Component{

  constructor(props) {
    super(props);
    this.state = {
      msg: "",
      open: false,
      autoHideDuration: 3000,
    };
  }

  openAlert(msg, duration) {
    this.setState({
      open: true,
      msg: msg,
      autoHideDuration: duration,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render(){
    return (
        <Snackbar
          open={this.state.open}
          message={this.state.msg}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
    )
  }
}

AlertBar.propTypes = {
  //warningAlert: React.PropTypes.string.isRequired,
  //setChannel: React.PropTypes.func.isRequired,
  //activeChannel: React.PropTypes.object.isRequired
}

export default AlertBar