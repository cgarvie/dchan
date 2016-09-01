import React, {Component} from 'react';
import MessageList from './MessageList.jsx';
import MessageForm from './MessageForm.jsx';

class MessageSection extends Component{
  onClick(e){
    e.preventDefault();
    //let {activeChannel} = this.props;
    const {setChannel, activeChannel} = this.props;
    setChannel(activeChannel);
  }
  render(){
    let {activeThread} = this.props;
    return (
      <div className='messages-container panel panel-default'>
        <div className='panel-heading'>
        <strong style={{display: 'block'}} className='pull-left'>{activeThread.name || 'Select a Thread'}</strong>
        <a className='btn btn-default pull-right btn-sm' onClick={this.onClick.bind(this)}>&larr; return</a>
        <div className='clearfix'></div>
        </div>
        <div className='panel-body messages'>
          <MessageList 
          {...this.props} 
          />
          <MessageForm 
          {...this.props} 
          />
        </div>
      </div>
    )
  }
}

MessageSection.propTypes = {
  messages: React.PropTypes.array.isRequired,
  activeThread: React.PropTypes.object.isRequired,
  activeChannel: React.PropTypes.object.isRequired,
  setChannel: React.PropTypes.func.isRequired,
  addMessage: React.PropTypes.func.isRequired,
  onAlert: React.PropTypes.func.isRequired
}

export default MessageSection