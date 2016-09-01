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
    let {message} = this.props;
    let createdAt = fecha.format(new Date(message.createdAt), 'HH:mm:ss MM/DD/YY');
    const imagePublicId = 'sample';
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
          <strong>{message.author}</strong> 
          <i className='timestamp'>{createdAt}</i>
        </div>
        <div className='body'>{message.body}</div>
        <div className='attachment'>{attachment_elem}</div>
      </li>
    )
  }
}

Message.propTypes = {
  message: React.PropTypes.object.isRequired
}

export default Message