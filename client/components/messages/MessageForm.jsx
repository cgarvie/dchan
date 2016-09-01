import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import request from 'superagent';

class DropzoneWidget extends Component{
  onDrop(files){
      document.getElementById("dropzoneinner").innerHTML = "Uploading...";
      console.log('Received files: ', files);
      //var req = request.post('https://api.cloudinary.com/v1_1/dsmgsxobf/image/upload');
      var req = request.post('http://localhost:4000/upload');
      //req.type('form');
      files.forEach((file)=> {
      req.attach('uploadfile', file);
      });
      //req.set('Authorization', ''); // superagnt or react is adding this stupid fucking header
      //req.withCredentials();
      //req.send({ api_key: 531863212216164, 
      //           timestamp: Date.now() / 1000 | 0,
      //           upload_preset: 'ht8tfy75'});
      //req.field('api_key', 531863212216164);
      //req.field('timestamp', Date.now() / 1000 | 0);
      //req.field('upload_preset', 'ht8tfy75');
      //req.send('api_key', '531863212216164');
      //req.send('timestamp', Date.now() / 1000 | 0);
      //req.send('upload_preset', 'ht8tfy75');
      //console.log(req);
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
        document.getElementsByName("attachment_src")[0].value = resp.text; 
        }

       });

      
  }

  render(){
    return (
          <div>
            <Dropzone onDrop={this.onDrop} className='dropzone' activeClassName='dropzone_active' multiple='false'>
              <div id='dropzoneinner'>Drag a file or click here to attach an image or webm to your post.</div>
            </Dropzone>
          </div>
      );
  }
}

class MessageForm extends Component{
  onSubmit(e){
    e.preventDefault();
    const node = this.refs.message;
    const node2 = this.refs.attachment_field;
    const message = node.value;
    const attachment = node2.value;
    this.props.addMessage(message, attachment);
    node.value = '';
    document.getElementsByName("attachment_src")[0].value = '';
    document.getElementById("dropzoneinner").innerHTML = "Drag a file or click here to attach an image or webm to your post.";
  }
  render(){
    let input;

    if(this.props.activeChannel.id !== undefined){
      input = (
        <input 
          ref='message'
          type='text' 
          className='form-control' 
          placeholder='Add Message...' />
      )
    }
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <div className='form-group'>
          {input}
          <div>
            <input ref='attachment_field' type='hidden' name='attachment_src' value='' />
            <DropzoneWidget  />
          </div>
        </div>
      </form>
    )
  }
}

MessageForm.propTypes = {
  activeChannel: React.PropTypes.object.isRequired,
  addMessage: React.PropTypes.func.isRequired,
  onAlert: React.PropTypes.func.isRequired

}

export default MessageForm