import React, {Component} from 'react';
import fecha from 'fecha';
import ChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import Badge from 'material-ui/Badge'
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
      var is_gif = 0

      // get original filename
      var xx = message.attachment.split('_')
      var attachment_original_filename = xx[xx.length-1]

      var t = message.attachment.split('.')
      switch (t[t.length-1]) {
        case "gif":
          attachment_type = 'image'
          is_gif = 1
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
      is_gif: is_gif,
      attachment_type: attachment_type,
      attachment_original_filename: attachment_original_filename,
      attachment_url: S3_PATH_PREFIX+'/ugc/'+message.attachment,
      attachment_url_thumb: S3_PATH_PREFIX+'/ugc/thumb/'+message.attachment,
      attachment_url_full: S3_PATH_PREFIX+'/ugc/'+message.attachment,
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

    var colorHash = new ColorHash({saturation: 0.8, lightness: 0.8});
    var attachment_elem, attachment_meta;
    let {message, activeSessions} = this.props;
    let createdAt = fecha.format(new Date(message.createdAt), 'HH:mm:ss MM/DD/YY');

    var myColor = colorHash.hex(hashCode(message.author));

    var chunk_is_online = <ChatBubble color={green100} />
    // If there are blank/empty/null authorAccountIds, authorIds, and activeSessions,
    // this can result in cases where '' == ''
    if ((activeSessions.indexOf(message.authorAccountId) !== -1) || 
              (activeSessions.indexOf(message.authorId) !== -1)) {
              var chunk_is_online = <ChatBubble color={green500} />
              }

    if (message.attachment) {

      attachment_meta = <span className='timestamp'>{this.state.attachment_original_filename}</span>

      if (this.state.attachment_type == 'image') {
        if (this.state.is_thumb == 1) {
          if (this.state.is_gif == 1) {
            attachment_elem = <div className='attachment'>
                                <Badge
                                    badgeContent={'gif'}
                                    secondary={true}
                                    badgeStyle={{top: 0, right: 0, backgroundColor: '#000'}}
                                    style={{padding:0}}
                                  >
                                 <img src={this.state.attachment_url_thumb} 
                                    onClick={this.toggleSize.bind(this)}
                                    />
                                </Badge>
                              </div>
                            
            } else {
              attachment_elem = <div className='attachment'>
                                 <img src={this.state.attachment_url_thumb} 
                                    onClick={this.toggleSize.bind(this)}
                                    />
                                </div>

            }
          } else {
            attachment_elem = <div className='attachment'>
                                <img src={this.state.attachment_url_full} 
                                  onClick={this.toggleSize.bind(this)}
                                  style={{maxWidth: '100%'}}
                                  />
                              </div>
          }
        }
      else if (this.state.attachment_type == 'video') { 
          attachment_elem = <div className='attachment'>
                              <video preload controls>
                                <source src={this.state.attachment_url} />
                              </video>
                            </div>
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
          {attachment_meta}
          <div style={{display: 'none'}}>
            <small>{message.authorId}</small>
            /
            <small>{message.authorAccountId}</small>
          </div>
        </div>
        <div className='body-container'>
          {attachment_elem}
          <div className='body'>{message.body}</div>
          <div style={{clear: 'both'}}></div>
        </div>
        
      </li>
    )
  }
}

Message.propTypes = {
  message: React.PropTypes.object.isRequired,
  activeSessions: React.PropTypes.array.isRequired
}

export default Message