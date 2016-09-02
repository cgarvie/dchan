import React, {Component} from 'react';
import fecha from 'fecha';

var S3_PATH_PREFIX = "//s3-us-west-2.amazonaws.com/deechan"

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
    var attachment_elem;
    let {message, activeSessions} = this.props;
    let createdAt = fecha.format(new Date(message.createdAt), 'HH:mm:ss MM/DD/YY');

    var chunk_is_online = '[offline]'
    // There are a ton of blank authorAccountIds, authorIds, and activeSessions..
    // this can result in cases where '' == ''
    if ((activeSessions.indexOf(message.authorAccountId) !== -1) || 
              (activeSessions.indexOf(message.authorId) !== -1)) {
              var chunk_is_online = '[USER IS STILL ONLINE]'
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
        <div className='author'>
          <b>{chunk_is_online}</b>
          <strong>{message.author}</strong> 
          <i className='timestamp'>{createdAt}</i>
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