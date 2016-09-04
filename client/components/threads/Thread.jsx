import React, {Component} from 'react';
import Paper from 'material-ui/Paper';

var S3_PATH_PREFIX = "//s3-us-west-2.amazonaws.com/deechan"

class Thread extends Component{
  onClick(e){
    console.log("THREAD WAS CLICKED ON.");
    e.preventDefault();
    const {setThread, thread} = this.props;
    setThread(thread);
  }
  render(){
    const {thread, activeThread} = this.props;

    var img_url = "http://s3-us-west-2.amazonaws.com/deechan/ugc/thumb/UMGUQDIWWMNPPQIMGEGM_hugeimg.jpg"
    if (thread.attachment) {
      img_url = S3_PATH_PREFIX+'/ugc/thumb/'+thread.attachment
    }
    //const active = Thread === activeThread ? 'active' : '';
    return (
      <Paper zDepth={1} className="image-element-class thread-li">
        <a onClick={this.onClick.bind(this)}>
          <img src={img_url} />
          <span>{thread.name}</span>
        </a>
      </Paper>
    )
  }
}

Thread.propTypes = {
  thread: React.PropTypes.object.isRequired,
  setThread: React.PropTypes.func.isRequired,
  activeThread: React.PropTypes.object.isRequired
}

export default Thread