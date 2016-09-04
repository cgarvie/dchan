import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dropzone from 'react-dropzone';

import request from 'superagent';



class DropzoneWidget extends Component{
  onDrop(files){
      document.getElementById("dropzoneinner").innerHTML = "Uploading...";
      console.log('Received files: ', files);

      this.props.disable_btn()
      var this_obj = this
      var req = request.post('http://localhost:4000/upload');
      files.forEach((file)=> {
        req.attach('uploadfile', file);
      });
      req.end(function(err,resp){
        document.getElementsByName("attachment_src")[0].value = ''; 
        console.log(err); 
        console.log(resp);
        console.log("DONE UPLOADING! NOW SAFE TO POST");
        console.log(resp.text);
        if (resp.text.slice(0, 5) == "ERROR") {
          //resp.text.slice(7) // Everything after 'ERROR: '
          console.log( resp.text.slice(7) )
          this.props.onAlert( resp.text.slice(7) );

        } else {
        document.getElementById("dropzoneinner").innerHTML = "Upload complete!";
        this_obj.props.setAttachment(resp.text)
        this_obj.props.enable_btn()
        // ^ we have to use this_obj or this refers to 'req' (the ajax request)
        }

       });

      
  }

  render(){
    return (
          <div>
            <Dropzone onDrop={this.onDrop.bind(this)} className='dropzone' activeClassName='dropzone_active' multiple={false}>
              <div id='dropzoneinner'>Drag a file or click here to attach an image or webm to your post.</div>
            </Dropzone>
          </div>
      );
  }
}


class ThreadForm extends Component{
  constructor(props, context) {
    super(props, context);
    this.state = {
      btn_is_disabled: true,
      attachment: ""
    }
  }
  setAttachment(s){
    this.setState({ attachment: s })
  }
  inputChanged(){
    if (this.refs.thread.value == '') {
     this.disable_btn()
    } else {
      this.enable_btn()
    }
  }
  enable_btn(){
    this.setState({ btn_is_disabled: false })
  }
  disable_btn(){
   this.setState({ btn_is_disabled: true })
  }
  onSubmit(e){
    e.preventDefault();
    const node = this.refs.thread;
    const threadName = node.value;
    const node2 = this.refs.attachment_field;
    const attachment = node2.value;
    this.props.addThread(threadName, attachment);
    node.value = '';
    document.getElementsByName("attachment_src")[0].value = '';
    document.getElementById("dropzoneinner").innerHTML = "Drag a file or click here to attach an image or webm to your post.";
  }
  render(){
    return (
      <form>
        <div className='form-group'>
          <input 
            className='form-control'
            placeholder='New thread title...'
            type='text'
            ref='thread'
            onInput={this.inputChanged.bind(this)}
          />
          <div>
            <input ref='attachment_field' type='hidden' name='attachment_src' value={this.state.attachment} />
            <div style={{float: 'left', width: '80%'}}>
              <DropzoneWidget 
                  enable_btn={this.enable_btn.bind(this)}
                  disable_btn={this.disable_btn.bind(this)}
                  setAttachment={this.setAttachment.bind(this)}
                  />
            </div>
            <RaisedButton primary={true} label='Make Thread' disabled={this.state.btn_is_disabled} onClick={this.onSubmit.bind(this)} style={{float: 'right', width: '20%'}}/>
            <div style={{clear: 'both'}}></div>
          </div>
        </div>
      </form>
    )
  }
}

/*
DropzoneWidget.propTypes = {
  enable_btn: React.PropTypes.func.isRequired,
  disable_btn: React.PropTypes.func.isRequired
}
*/

ThreadForm.propTypes = {
  addThread: React.PropTypes.func.isRequired
}


export default ThreadForm