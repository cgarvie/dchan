import React, {Component} from 'react';
import fecha from 'fecha';
import ChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import ColorHash from 'color-hash';

import Avatar from 'material-ui/Avatar';
import {
blue300,
indigo900,
orange200,
deepOrange300,
pink400,
purple500,
red500,
yellow500,
green500,
green100,
blue500
} from 'material-ui/styles/colors';

const style = {margin: 5};

var S3_PATH_PREFIX = "//s3-us-west-2.amazonaws.com/deechan"


function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}



class Message extends Component{
  constructor(props, context) {
    super(props, context);
    let {message} = this.props;

    //
    var attachment_type
    if (message.attachment) {
      var t = message.attachment.split('.')
      console.log("READ THIS")
      console.log(t[t.length-1])
      switch (t[t.length-1]) {
        case "gif":
          attachment_type = 'image'
          break;
        case "jpg":
          attachment_type = 'image'
          break;
        case "jpeg":
          attachment_type = 'image'
          break;
        case "png":
          attachment_type = 'image'
          break;
        case "webm":
          attachment_type = 'video' // video!
          break;
        default:
          attachment_type = 'image'
          break;
        }
      }
  
    //
    this.state = {
      is_thumb: 1,
      attachment_type: attachment_type,
      attachment_url: S3_PATH_PREFIX+message.attachment,
      attachment_url_thumb: S3_PATH_PREFIX+message.attachment,
      attachment_url_full: S3_PATH_PREFIX+message.attachment,
      attachment_filename: message.attachment
    }
  }
  toggleSize(){
    if (this.state.is_thumb) {
          this.setState({
            is_thumb: 0,
            attachment_url: this.state.attachment_url_full
          });
    } 
    else {
          this.setState({
            is_thumb: 1,
            attachment_url: this.state.attachment_url_thumb
          });
    }

  }
  render(){

    var colorHash = new ColorHash({saturation: 1, lightness: 0.825});
    var attachment_elem;
    let {message, activeSessions} = this.props;
    let createdAt = fecha.format(new Date(message.createdAt), 'HH:mm:ss MM/DD/YY');

    var myColor = colorHash.hex(message.author);

    var chunk_is_online = <ChatBubble color={green100} />
    // If there are blank/empty/null authorAccountIds, authorIds, and activeSessions,
    // this can result in cases where '' == ''
    if ((activeSessions.indexOf(message.authorAccountId) !== -1) || 
              (activeSessions.indexOf(message.authorId) !== -1)) {
              var chunk_is_online = <ChatBubble color={green500} />
              }

    if (message.attachment) {
      if (this.state.attachment_type == 'image') {
          attachment_elem = <img src={this.state.attachment_url} 
                      onClick={this.toggleSize.bind(this)}
                      />
      } else if (this.state.attachment_type == 'video') { 
          attachment_elem = <video preload controls>
                              <source src={this.state.attachment_url} />
                            </video>
      }
    } else {
      //attachment_elem = ""
    }
    
    return (
      
      <li className='message'>
      <div>
      
      </div>
        <div className='author'>
          {chunk_is_online}
          <span className='author-name' style={{backgroundColor: myColor}}>{message.author}</span> 
          <span className='timestamp'>{createdAt}</span>
          <div style={{display: 'none'}}>
            <small>{message.authorId}</small>
            /
            <small>{message.authorAccountId}</small>
          </div>
        </div>
        <div className='body'>{message.body}</div>
        <div className='attachment'>{attachment_elem}</div>
      </li>
    )
  }
}

Message.propTypes = {
  message: React.PropTypes.object.isRequired,
  activeSessions: React.PropTypes.array.isRequired
}

export default Message