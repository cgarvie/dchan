import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';


class AuthModal extends Component{

  constructor(props, context) {
    super(props, context);

    this.handleRequestClose = this.handleRequestClose.bind(this);
    // ^ This shit doesn't work. idky. don't waste any more time on it.
    this.triggerDialog = this.triggerDialog.bind(this);

    this.state = {
      open: false,
    };
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  triggerDialog(e) {
    this.setState({
      open: true,
    });
  }

  onLogin(e){
    e.preventDefault();

    const node1 = this.refs.usr;
    const usr = node1.value;
    const node2 = this.refs.psw;
    const psw = node2.value;

    node1.value = '';
    node2.value = '';

    this.handleRequestClose();

    this.props.LoginUser(usr, psw);

  }


  onRegister(e){
    e.preventDefault();

    const node1 = this.refs.reg_usr;
    const usr = node1.value;
    const node2 = this.refs.reg_psw;
    const psw = node2.value;
    const node3 = this.refs.reg_psw2;
    const psw2 = node3.value;

    if (psw == psw2) {
      this.props.RegisterUser(usr, psw);

      node1.value = '';
      node2.value = '';
      node3.value = '';

      this.handleRequestClose();

    } else {
      alert("passwords didn't match!")

    }

  }


render() {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
        onClick={this.handleRequestClose}
        />
    );

    return (
        
          <Dialog
            open={this.state.open}
            title="Login or Register"
            //modal={false}
            actions={standardActions}
            onRequestClose={this.handleRequestClose}
          >
            <div className='row'>
              <div className='col-md-6'>
              <h3>Login</h3>
                <form onSubmit={this.onLogin.bind(this)}>
                  <div className='form-group'>
                    <input 
                      className='form-control'
                      placeholder='username'
                      type='text'
                      ref='usr'
                    />
                    <input 
                      className='form-control'
                      placeholder='password'
                      type='password'
                      ref='psw'
                    />
                    <RaisedButton label='Login' onClick={this.onLogin.bind(this)} />
                  </div>
                </form>
              </div>
              <div className='col-md-6'>
              <h3>Register</h3>
                <form onSubmit={this.onRegister.bind(this)}>
                  <div className='form-group'>
                    <input 
                      className='form-control'
                      placeholder='username'
                      type='text'
                      ref='reg_usr'
                    />
                    <input 
                      className='form-control'
                      placeholder='password'
                      type='password'
                      ref='reg_psw'
                    />
                    <input 
                      className='form-control'
                      placeholder='password (again)'
                      type='password'
                      ref='reg_psw2'
                    />
                    <RaisedButton label='Create account' onClick={this.onRegister.bind(this)} />
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
       
      );
  }


}

AuthModal.propTypes = {
  LoginUser: React.PropTypes.func.isRequired
}



export default AuthModal