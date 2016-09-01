import React, {Component} from 'react';

class ThreadForm extends Component{
  onSubmit(e){
    e.preventDefault();
    const node = this.refs.thread;
    const threadName = node.value;
    console.log("thrad name will be "+threadName);
    this.props.addThread(threadName);
    node.value = '';
  }
  render(){
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <div className='form-group'>
          <input 
            className='form-control'
            placeholder='Add Thread'
            type='text'
            ref='thread'
          />
        </div>
        
      </form>
    )
  }
}

ThreadForm.propTypes = {
  addThread: React.PropTypes.func.isRequired
}


export default ThreadForm