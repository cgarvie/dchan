import React, {Component} from 'react';
import Message from './Message.jsx';

class MessageList extends Component{
  render(){
    //console.log("RENDERING MSG LIST:");
    //console.log(this.props.messages);
    return (
      <ul>{
        this.props.messages.map( message =>{
          return (
            <Message 
            {...this.props} 
            key={message.id} message={message} />
          )
        })
      }</ul>
    )
  }
}
MessageList.propTypes = {
  messages: React.PropTypes.array.isRequired,
  activeSessions: React.PropTypes.array.isRequired

}
export default MessageList