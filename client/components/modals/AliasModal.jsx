import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';


class AliasModal extends Component{

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

 

  onAddAlias(e){
    e.preventDefault();

    const node1 = this.refs.alias;
    const alias = node1.value;    
    
    this.props.AddUserAlias(alias);
    node1.value = '';
    this.handleRequestClose();

  }


  render() {
    /*
    const standardActions = (
      <FlatButton
        label="cancel"
        primary={true}
        onClick={this.handleRequestClose}
        />
    );
    */
    
    return (
        
          <Dialog
            open={this.state.open}
            title="Add Alias to Account"
            //actions={standardActions}
            onRequestClose={this.handleRequestClose}
          >
            <div className='row'>
              <div className='col-md-12'>
                <form onSubmit={this.onAddAlias.bind(this)}>
                  <div className='form-group'>
                    <input 
                      className='form-control'
                      placeholder='new alias'
                      type='text'
                      ref='alias'
                    />
                    <RaisedButton label='Register Alias' onClick={this.onAddAlias.bind(this)} />
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
       
      );
  }


}

AliasModal.propTypes = {
  AddUserAlias: React.PropTypes.func.isRequired
}



export default AliasModal