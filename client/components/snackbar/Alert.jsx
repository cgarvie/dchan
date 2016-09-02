import React, { Component } from 'react';

import Snackbar from 'material-ui/Snackbar';
import RaisedButton from 'material-ui/RaisedButton';

class AlertBar extends Component{

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      autoHideDuration: 3000,
    };
  }

  openAlert(duration) {
  	let {open} = this.state;
    this.setState({
      open: true,
      autoHideDuration: duration,
    });
  }

  handleRequestClose() {
   	let {open} = this.state;
    this.setState({
      open: false,
    });
  }

  render(){
  	let {open} = this.state;
  	const {warningAlert} = this.props;
  	console.log("in class, warningAlert = ", warningAlert)
    return (
      <div>
        <Snackbar
          open={open}
          message={warningAlert}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
      </div>
    )
  }
}

AlertBar.propTypes = {
  warningAlert: React.PropTypes.string.isRequired,
  //setChannel: React.PropTypes.func.isRequired,
  //activeChannel: React.PropTypes.object.isRequired
}

export default AlertBar